declare module 'react-native-sherpa-onnx/src/stt' {
  export interface SttEngine {
    transcribeFile(filePath: string): Promise<{ text: string }>
    destroy(): Promise<void>
  }

  export interface CreateSTTOptions {
    modelPath: { type: 'file'; path: string }
    preferInt8?: boolean
    modelType?: string
  }

  export function createSTT(options: CreateSTTOptions): Promise<SttEngine>
}
