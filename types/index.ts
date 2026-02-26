export type Speaker = 'A' | 'B'

export type TranscriptionSegment = {
  text: string
  startTime: number
  speaker: Speaker
}

export type VADSegment = {
  start: number
  end: number
}

export type OnnxModelFile = {
  localName: string
  remoteName: string
  minSize: number
}

export type IconProps = {
  color: string
  size?: number
  focused?: boolean
}
