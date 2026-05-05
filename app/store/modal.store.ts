import { create } from 'zustand'
import { modalRegistry } from '~/config/modalRegistry'

type ModalType = keyof typeof modalRegistry

interface ModalStore {
  modals: { _type: ModalType; [key: string]: unknown }[]
  open: (key: ModalType, options?: Record<string, unknown>) => void
  close: (index: number) => void
}

export const useModalStore = create<ModalStore>((set, get) => ({
  modals: [],
  open: (key, options = {}) =>
    set({ modals: [...get().modals, { _type: key, ...options }] }),
  close: (index) => set({ modals: get().modals.filter((_, i) => i !== index) }),
}))
