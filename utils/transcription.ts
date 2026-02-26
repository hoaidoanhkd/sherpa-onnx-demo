import * as RNFS from 'react-native-fs'

import { CHUNK_DURATION } from '../constants'
import { Speaker, TranscriptionSegment } from '../types'

import { cutWavChunk, transcribeInChunks } from './audioChunking'
import { getSttEngine } from './onnxContext'
import { detectSpeechSegments } from './vad'

export function mergeSegments(
  a: TranscriptionSegment[],
  b: TranscriptionSegment[]
): TranscriptionSegment[] {
  return [...a, ...b].sort((x, y) => x.startTime - y.startTime)
}

export async function transcribeWithVAD(
  filePath: string,
  speaker: Speaker
): Promise<TranscriptionSegment[]> {
  const vadSegments = await detectSpeechSegments(filePath)

  if (vadSegments.length === 0) {
    return []
  }

  const results: TranscriptionSegment[] = []
  const chunkFiles: string[] = []

  for (let i = 0; i < vadSegments.length; i++) {
    const seg = vadSegments[i]
    const segDuration = seg.end - seg.start

    if (segDuration > CHUNK_DURATION) {
      const chunkPath = await cutWavChunk(filePath, seg.start, seg.end)
      if (!chunkPath) {
        continue
      }

      chunkFiles.push(chunkPath)
      const chunkSegments = await transcribeInChunks(
        chunkPath,
        speaker,
        seg.start
      )
      results.push(...chunkSegments)
    } else {
      const chunkPath = await cutWavChunk(filePath, seg.start, seg.end)
      if (!chunkPath) {
        continue
      }

      chunkFiles.push(chunkPath)

      try {
        const engine = getSttEngine()
        if (!engine) {
          continue
        }
        const result = await engine.transcribeFile(chunkPath)
        const text = result.text.trim()

        if (text) {
          results.push({
            text,
            startTime: seg.start,
            speaker
          })
        }
      } catch {
        // skip failed segment
      }
    }
  }

  await Promise.all(chunkFiles.map((f) => RNFS.unlink(f).catch(() => {})))

  return results
}
