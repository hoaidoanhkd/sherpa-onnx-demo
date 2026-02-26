import SherpaOnnx from 'react-native-sherpa-onnx/src/NativeSherpaOnnx'

let isInitialized = false
let initPromise: Promise<boolean> | null = null

export async function initOnnxModel(modelDir: string): Promise<boolean> {
  if (__DEV__) console.log('[onnxContext] initOnnxModel called with:', modelDir)

  if (isInitialized) {
    return true
  }

  if (initPromise) {
    return initPromise
  }

  try {
    await SherpaOnnx.testSherpaInit()
  } catch (e: any) {
    if (__DEV__) console.error('[onnxContext] testSherpaInit error:', e?.message || e)
    return false
  }

  initPromise = SherpaOnnx.initializeSherpaOnnx(modelDir, true, 'transducer')
    .then((result: any) => {
      isInitialized = result?.success ?? false
      return isInitialized
    })
    .catch((error: any) => {
      if (__DEV__) console.error('[onnxContext] initializeSherpaOnnx ERROR:', error?.message || error)
      return false
    })
    .finally(() => {
      initPromise = null
    })

  return initPromise
}

export async function transcribe(filePath: string): Promise<string> {
  if (!isInitialized) {
    throw new Error('STT not initialized')
  }
  return SherpaOnnx.transcribeFile(filePath)
}

export async function releaseOnnxModel(): Promise<void> {
  if (isInitialized) {
    await SherpaOnnx.unloadSherpaOnnx()
    isInitialized = false
  }
}

export function isOnnxReady(): boolean {
  return isInitialized
}

// Legacy export for compatibility
export function getSttEngine(): { transcribe: (path: string) => Promise<string> } | null {
  if (!isInitialized) {
    return null
  }
  return {
    transcribe: (filePath: string) => SherpaOnnx.transcribeFile(filePath)
  }
}
