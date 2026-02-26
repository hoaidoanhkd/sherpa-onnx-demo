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
    console.log('[STT] transcribeAll called', {
      audioUrlA: !!audioUrlA,
      audioUrlB: !!audioUrlB,
      modelPath,
      running: running.current
    })
    if ((!audioUrlA && !audioUrlB) || !modelPath || running.current) {
      console.log('[STT] transcribeAll skipped — guard clause hit')
      return
    }

    running.current = true
    setIsTranscribing(true)
    setError(null)
    setConversation([])

    try {
      console.log('[STT] Initializing ONNX model at:', modelPath)
      const modelReady = await initOnnxModel(modelPath)
      console.log('[STT] Model init result:', modelReady)
      if (!modelReady) {
        throw new Error('Failed to initialize ONNX model')
      }

      console.log('[STT] Downloading audio files...')
      const [cutA, cutB] = await Promise.all([
        audioUrlA
          ? downloadPartialAudio(audioUrlA, 'a_cut.wav')
          : Promise.resolve(null),
        audioUrlB
          ? downloadPartialAudio(audioUrlB, 'b_cut.wav')
          : Promise.resolve(null)
      ])

      console.log('[STT] Downloaded:', { cutA, cutB })

      if (cutA) {
        tempFiles.current.push(cutA)
      }
      if (cutB) {
        tempFiles.current.push(cutB)
      }

      let segmentsA: TranscriptionSegment[] = []
      let segmentsB: TranscriptionSegment[] = []

      if (cutA) {
        console.log('[STT] Transcribing channel A...')
        segmentsA = await transcribeWithVAD(cutA, 'A')
        console.log('[STT] Channel A segments:', segmentsA.length)
      }

      if (cutB) {
        console.log('[STT] Transcribing channel B...')
        segmentsB = await transcribeWithVAD(cutB, 'B')
        console.log('[STT] Channel B segments:', segmentsB.length)
      }

      const merged = mergeSegments(segmentsA, segmentsB)
      console.log('[STT] Total segments:', merged.length)
      setConversation(merged)
    } catch (e) {
      console.log('[STT] Error:', e)
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
