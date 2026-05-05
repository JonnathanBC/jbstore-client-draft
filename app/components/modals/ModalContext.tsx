import { createContext, useContext, type ReactNode } from 'react'

type ModalContextValue = {
  onClose: () => void
}

export const ModalContext = createContext<ModalContextValue | null>(null)

export function ModalProvider({
  value,
  children,
}: {
  value: ModalContextValue
  children: ReactNode
}) {
  return (
    <ModalContext.Provider value={value}>{children}</ModalContext.Provider>
  )
}

export function useModalContext() {
  return useContext(ModalContext)
}

