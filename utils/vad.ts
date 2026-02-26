import { Buffer } from 'buffer'
import * as RNFS from 'react-native-fs'

import {
  SAMPLE_RATE,
  VAD_ENERGY_THRESHOLD,
  VAD_MIN_SILENCE_MS,
  VAD_MIN_SPEECH_MS,
  VAD_PADDING_MS,
  VAD_WINDOW_MS,
  WAV_HEADER_SIZE
} from '../constants'
import { VADSegment } from '../types'

const CHUNK_SAMPLES = 2_000_000
const SUBSAMPLE_FACTOR = 8

function base64ToFloat32(base64: string): Float32Array {
  const bytes = Uint8Array.from(Buffer.from(base64, 'base64'))
  const len = bytes.length
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength)
  const sampleCount = Math.floor(len / 2)
  const samples = new Float32Array(sampleCount)

  for (let i = 0; i < sampleCount; i++) {
    samples[i] = view.getInt16(i * 2, true) / 32768.0
  }

  return samples
}

function computeWindowEnergy(
  samples: Float32Array,
  start: number,
  end: number
): number {
  let sum = 0
  let count = 0
  for (let i = start; i < end; i += SUBSAMPLE_FACTOR) {
    sum += samples[i] * samples[i]
    count++
  }
  return count > 0 ? Math.sqrt(sum / count) : 0
}

export async function detectSpeechSegments(
  filePath: string
): Promise<VADSegment[]> {
  const stat = await RNFS.stat(filePath)
  const fileSize = Number(stat.size)
  const pcmBytes = fileSize - WAV_HEADER_SIZE
  const totalSamples = Math.floor(pcmBytes / 2)

  const windowSamples = Math.floor((SAMPLE_RATE * VAD_WINDOW_MS) / 1000)
  const totalWindows = Math.floor(totalSamples / windowSamples)

  const energies: number[] = []

  let samplesRead = 0
  while (samplesRead < totalSamples) {
    const chunkSamples = Math.min(CHUNK_SAMPLES, totalSamples - samplesRead)
    const byteOffset = WAV_HEADER_SIZE + samplesRead * 2
    const byteLen = chunkSamples * 2

    const base64 = await RNFS.read(filePath, byteLen, byteOffset, 'base64')
    const samples = base64ToFloat32(base64)

    const chunkStart = samplesRead
    const chunkEnd = samplesRead + samples.length

    for (
      let w = Math.floor(chunkStart / windowSamples);
      w < totalWindows;
      w++
    ) {
      const wStart = w * windowSamples
      const wEnd = wStart + windowSamples
      if (wStart >= chunkEnd) {
        break
      }
      if (wEnd > chunkEnd) {
        break
      }
      if (wStart < chunkStart) {
        continue
      }

      const localStart = wStart - chunkStart
      const localEnd = wEnd - chunkStart
      if (localEnd <= samples.length) {
        energies[w] = computeWindowEnergy(samples, localStart, localEnd)
      }
    }

    samplesRead += samples.length
  }

  const isSpeech = energies.map((e) => e > VAD_ENERGY_THRESHOLD)

  const minSpeechWindows = Math.ceil(VAD_MIN_SPEECH_MS / VAD_WINDOW_MS)
  const minSilenceWindows = Math.ceil(VAD_MIN_SILENCE_MS / VAD_WINDOW_MS)
  const paddingSec = VAD_PADDING_MS / 1000
  const totalDuration = totalSamples / SAMPLE_RATE

  const rawSegments: VADSegment[] = []
  let segStart = -1
  let silenceCount = 0

  for (let i = 0; i < isSpeech.length; i++) {
    if (isSpeech[i]) {
      if (segStart === -1) {
        segStart = i
      }
      silenceCount = 0
    } else {
      if (segStart !== -1) {
        silenceCount++
        if (silenceCount >= minSilenceWindows) {
          const segEnd = i - silenceCount + 1
          const durationWindows = segEnd - segStart
          if (durationWindows >= minSpeechWindows) {
            rawSegments.push({
              start: Math.max(
                0,
                (segStart * VAD_WINDOW_MS) / 1000 - paddingSec
              ),
              end: Math.min(
                totalDuration,
                (segEnd * VAD_WINDOW_MS) / 1000 + paddingSec
              )
            })
          }
          segStart = -1
          silenceCount = 0
        }
      }
    }
  }

  if (segStart !== -1) {
    const segEnd = isSpeech.length
    const durationWindows = segEnd - segStart
    if (durationWindows >= minSpeechWindows) {
      rawSegments.push({
        start: Math.max(0, (segStart * VAD_WINDOW_MS) / 1000 - paddingSec),
        end: Math.min(
          totalDuration,
          (segEnd * VAD_WINDOW_MS) / 1000 + paddingSec
        )
      })
    }
  }

  return rawSegments
}
