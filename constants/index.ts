import { Platform } from 'react-native'

// === ONNX Model Config ===
export const ONNX_MODEL_DIR_NAME = 'model'

export const ONNX_MODEL_FILES = [
  {
    localName: 'encoder.onnx',
    remoteName: 'encoder-epoch-99-avg-1.int8.onnx',
    minSize: 150_000_000
  },
  {
    localName: 'decoder.onnx',
    remoteName: 'decoder-epoch-99-avg-1.int8.onnx',
    minSize: 2_500_000
  },
  {
    localName: 'joiner.onnx',
    remoteName: 'joiner-epoch-99-avg-1.int8.onnx',
    minSize: 2_000_000
  },
  {
    localName: 'tokens.txt',
    remoteName: 'tokens.txt',
    minSize: 40_000
  }
]
export const ONNX_MODEL_TOTAL_SIZE_MB = 161

export const ONNX_MODEL_BASE_URL =
  'https://huggingface.co/reazon-research/reazonspeech-k2-v2/resolve/main/'

// === Audio Processing ===
export const WAV_HEADER_SIZE = 44
export const SAMPLE_RATE = 16000
export const BYTES_PER_SAMPLE = 2
export const NUM_CHANNELS = 1
export const BYTES_PER_SECOND = SAMPLE_RATE * BYTES_PER_SAMPLE * NUM_CHANNELS
export const STT_INITIAL_DURATION_SEC = 15
export const STT_DURATION_BYTES =
  16000 * STT_INITIAL_DURATION_SEC + WAV_HEADER_SIZE

// === VAD Config ===
export const VAD_WINDOW_MS = 250
export const VAD_ENERGY_THRESHOLD = 0.005
export const VAD_MIN_SPEECH_MS = 250
export const VAD_MIN_SILENCE_MS = 500
export const VAD_PADDING_MS = 200

// === Chunking Config ===
export const CHUNK_DURATION = 5
export const CHUNK_STEP = 3
export const OVERLAP_MAX_LEN = 20

export enum ModelStatus {
  NOT_DOWNLOADED = 'not_downloaded',
  DOWNLOADING = 'downloading',
  DOWNLOADED = 'downloaded'
}

export const IS_IOS = Platform.OS === 'ios'
