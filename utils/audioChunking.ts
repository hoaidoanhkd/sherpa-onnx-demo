import { Buffer } from 'buffer'
import * as RNFS from 'react-native-fs'

import {
  BYTES_PER_SECOND,
  CHUNK_DURATION,
  CHUNK_STEP,
  OVERLAP_MAX_LEN,
  SAMPLE_RATE,
  WAV_HEADER_SIZE
} from '../constants'
import { Speaker, TranscriptionSegment } from '../types'

import { getSttEngine } from './onnxContext'

function createWavHeader(dataSize: number): Uint8Array {
  const header = new Uint8Array(WAV_HEADER_SIZE)
  const view = new DataView(header.buffer)

  header[0] = 0x52
  header[1] = 0x49
  header[2] = 0x46
  header[3] = 0x46
  view.setUint32(4, 36 + dataSize, true)
  header[8] = 0x57
  header[9] = 0x41
  header[10] = 0x56
  header[11] = 0x45
  header[12] = 0x66
  header[13] = 0x6d
  header[14] = 0x74
  header[15] = 0x20
  view.setUint32(16, 16, true)
  view.setUint16(20, 1, true)
  view.setUint16(22, 1, true)
  view.setUint32(24, SAMPLE_RATE, true)
  view.setUint32(28, BYTES_PER_SECOND, true)
  view.setUint16(32, 2, true)
  view.setUint16(34, 16, true)
  header[36] = 0x64
  header[37] = 0x61
  header[38] = 0x74
  header[39] = 0x61
  view.setUint32(40, dataSize, true)

  return header
}

export async function cutWavChunk(
  inputPath: string,
  startTime: number,
  endTime: number
): Promise<string | null> {
  try {
    const startByte = WAV_HEADER_SIZE + Math.floor(startTime * BYTES_PER_SECOND)
    const endByte = WAV_HEADER_SIZE + Math.floor(endTime * BYTES_PER_SECOND)
    const dataSize = endByte - startByte

    if (dataSize <= 0) {
      return null
    }

    const pcmBase64 = await RNFS.read(inputPath, dataSize, startByte, 'base64')

    const header = createWavHeader(dataSize)
    const headerBase64 = Buffer.from(header).toString('base64')

    const outputPath = `${RNFS.DocumentDirectoryPath}/chunk_${Date.now()}.wav`
    await RNFS.writeFile(outputPath, headerBase64, 'base64')
    await RNFS.appendFile(outputPath, pcmBase64, 'base64')

    return outputPath
  } catch {
    return null
  }
}

export function findOverlapMatch(
  str1: string,
  str2: string,
  maxLen: number = OVERLAP_MAX_LEN
): number {
  if (!str1 || !str2) {
    return 0
  }

  const checkLen = Math.min(maxLen, str1.length, str2.length)

  for (let len = checkLen; len >= 2; len--) {
    const tail = str1.slice(-len)
    if (str2.startsWith(tail)) {
      return len
    }
  }
  return 0
}

export async function transcribeInChunks(
  filePath: string,
  speaker: Speaker,
  baseOffset: number
): Promise<TranscriptionSegment[]> {
  const stat = await RNFS.stat(filePath)
  const fileSize = Number(stat.size)
  const totalDuration = (fileSize - WAV_HEADER_SIZE) / BYTES_PER_SECOND

  const segments: TranscriptionSegment[] = []
  let prevText = ''

  for (let t = 0; t + CHUNK_DURATION <= totalDuration; t += CHUNK_STEP) {
    const chunkEnd = Math.min(t + CHUNK_DURATION, totalDuration)

    const chunkPath = await cutWavChunk(filePath, t, chunkEnd)
    if (!chunkPath) {
      continue
    }

    try {
      const engine = getSttEngine()
      if (!engine) {
        continue
      }
      const result = await engine.transcribeFile(chunkPath)
      const text = result.text.trim()

      await RNFS.unlink(chunkPath).catch(() => {})

      if (!text) {
        continue
      }

      let finalText = text
      if (prevText) {
        const overlap = findOverlapMatch(prevText, text)
        if (overlap > 0) {
          finalText = text.slice(overlap)
        }
      }

      if (finalText.trim()) {
        segments.push({
          text: finalText.trim(),
          startTime: baseOffset + t,
          speaker
        })
      }

      prevText = text
    } catch {
      await RNFS.unlink(chunkPath).catch(() => {})
    }
  }

  return segments
}
