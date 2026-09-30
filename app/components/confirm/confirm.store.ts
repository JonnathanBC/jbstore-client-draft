import { create } from 'zustand'

export type ConfirmOptions = {
  title?: string
  description?: string
  confirmText?: string
  cancelText?: string
}

type ConfirmStore = {
  options: ConfirmOptions | null
  resolve: ((value: boolean) => void) | null
  request: (options: ConfirmOptions) => Promise<boolean>
  settle: (value: boolean) => void
}

export const useConfirmStore = create<ConfirmStore>((set, get) => ({
  options: null,
  resolve: null,
  request: (options) =>
    new Promise<boolean>((resolve) => {
      // Si ya hay un diálogo abierto, se cancela el anterior
      get().resolve?.(false)
      set({ options, resolve })
    }),
  settle: (value) => {
    get().resolve?.(value)
    set({ options: null, resolve: null })
  },
}))
