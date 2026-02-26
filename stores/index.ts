import { create } from 'zustand'

import useSttSlice, { SttState } from './stt_slice'

export type BoundState = SttState

const useBoundStore = create<BoundState>((...args) => ({
  ...useSttSlice(...args)
}))

export default useBoundStore
