import { create } from 'zustand'
import { modalRegistry } from '~/config/modalRegistry'

export type ModalType = keyof typeof modalRegistry

interface ModalEntry {
  id: number
  type: ModalType
  props: Record<string, unknown>
}

interface ModalStore {
  modals: ModalEntry[]
  open: (type: ModalType, props?: Record<string, unknown>) => void
  close: (id: number) => void
}

let nextId = 0

export const useModalStore = create<ModalStore>((set) => ({
  modals: [],
  open: (type, props = {}) =>
    set((state) => ({
      modals: [...state.modals, { id: ++nextId, type, props }],
    })),
  close: (id) =>
    set((state) => ({ modals: state.modals.filter((m) => m.id !== id) })),
}))
