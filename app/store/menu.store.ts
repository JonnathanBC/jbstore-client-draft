import { create } from 'zustand'

interface MenuStore {
  isOpen: boolean

  openMenu: () => void
  closeMenu: () => void
}

export const useMenuStore = create<MenuStore>()((set) => ({
  isOpen: false,

  openMenu: () => set({ isOpen: true }),
  closeMenu: () => set({ isOpen: false }),
}))
