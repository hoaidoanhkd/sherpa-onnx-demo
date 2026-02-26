import { useCallback, useEffect, useRef, useState } from 'react'

import { TranscriptionSegment } from '../types'
import { cleanupFiles, downloadPartialAudio } from '../utils/fileUtils'
import { initOnnxModel } from '../utils/onnxContext'
import { mergeSegments, transcribeWithVAD } from '../utils/transcription'

export default function useSpeechToText(
  audioUrlA?: string,
  audioUrlB?: string,
  modelPath?: string | null
) {
  const [isTranscribing, setIsTranscribing] = useState(false)
  const [conversation, setConversation] = useState<TranscriptionSegment[]>([])
  const [error, setError] = useState<string | null>(null)

  const tempFiles = useRef<string[]>([])
  const running = useRef(false)

  const transcribeAll = useCallback(async () => {
    if ((!audioUrlA && !audioUrlB) || !modelPath || running.current) {
      return
    }

    running.current = true
    setIsTranscribing(true)
    setError(null)
    setConversation([])

    try {
      const modelReady = await initOnnxModel(modelPath)
      if (!modelReady) {
        throw new Error('Failed to initialize ONNX model')
      }

      const [cutA, cutB] = await Promise.all([
        audioUrlA
          ? downloadPartialAudio(audioUrlA, 'a_cut.wav')
          : Promise.resolve(null),
        audioUrlB
          ? downloadPartialAudio(audioUrlB, 'b_cut.wav')
          : Promise.resolve(null)
      ])

      if (cutA) {
        tempFiles.current.push(cutA)
      }
      if (cutB) {
        tempFiles.current.push(cutB)
      }

      let segmentsA: TranscriptionSegment[] = []
      let segmentsB: TranscriptionSegment[] = []

      if (cutA) {
        segmentsA = await transcribeWithVAD(cutA, 'A')
      }

      if (cutB) {
        segmentsB = await transcribeWithVAD(cutB, 'B')
      }

      const merged = mergeSegments(segmentsA, segmentsB)
      setConversation(merged)
    } catch (e) {
      if (__DEV__) console.error('[STT] Error:', e)
      setError(e instanceof Error ? e.message : 'Transcription failed')
    } finally {
      setIsTranscribing(false)
      running.current = false
    }
  }, [audioUrlA, audioUrlB, modelPath])

  useEffect(() => {
    const files = tempFiles.current
    return () => {
      cleanupFiles(files)
    }
  }, [])

  return { isTranscribing, conversation, transcribeAll, error }
}
