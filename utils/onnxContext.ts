import type { SttEngine } from 'react-native-sherpa-onnx/src/stt'
import { createSTT } from 'react-native-sherpa-onnx/src/stt'

let sttEngine: SttEngine | null = null
let initPromise: Promise<boolean> | null = null

export function getSttEngine(): SttEngine | null {
  return sttEngine
}

export async function initOnnxModel(modelDir: string): Promise<boolean> {
  if (sttEngine) {
    return true
  }

  if (initPromise) {
    return initPromise
  }

  initPromise = createSTT({
    modelPath: { type: 'file', path: modelDir },
    preferInt8: true,
    modelType: 'transducer'
  })
    .then((engine) => {
      sttEngine = engine
      return true
    })
    .catch(() => {
      return false
    })
    .finally(() => {
      initPromise = null
    })

  return initPromise
}

export async function releaseOnnxModel(): Promise<void> {
  if (sttEngine) {
    await sttEngine.destroy()
    sttEngine = null
  }
}

export function isOnnxReady(): boolean {
  return sttEngine !== null
}
