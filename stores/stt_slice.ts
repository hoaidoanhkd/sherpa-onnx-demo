import { StateCreator } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

import AsyncStorage from '@react-native-async-storage/async-storage'

import { ModelStatus } from '../constants'

export type SttState = {
  isSpeechToTextEnabled: boolean
  modelStatus: ModelStatus
  downloadProgress: number
  setIsSpeechToTextEnabled: (enabled: boolean) => void
  setModelStatus: (status: ModelStatus) => void
  setDownloadProgress: (progress: number) => void
}

const STT_PERSISTED_KEY = 'stt-storage'

const SttPersist: StateCreator<SttState> = (set) => ({
  isSpeechToTextEnabled: false,
  modelStatus: ModelStatus.NOT_DOWNLOADED,
  downloadProgress: 0,
  setIsSpeechToTextEnabled: (enabled: boolean) =>
    set({ isSpeechToTextEnabled: enabled }),
  setModelStatus: (status: ModelStatus) => set({ modelStatus: status }),
  setDownloadProgress: (progress: number) => set({ downloadProgress: progress })
})

const useSttSlice: StateCreator<SttState, [], [['zustand/persist', unknown]]> =
  persist(SttPersist, {
    name: STT_PERSISTED_KEY,
    storage: createJSONStorage(() => AsyncStorage),
    partialize: (state) => ({
      isSpeechToTextEnabled: state.isSpeechToTextEnabled,
      modelStatus:
        state.modelStatus === ModelStatus.DOWNLOADING
          ? ModelStatus.NOT_DOWNLOADED
          : state.modelStatus
    })
  })

export default useSttSlice
