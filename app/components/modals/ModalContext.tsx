import { createContext, use, type ReactNode } from 'react'

type ModalContextValue = {
  onClose: () => void
}

const ModalContext = createContext<ModalContextValue | null>(null)

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
  const context = use(ModalContext)
  if (!context) {
    throw new Error('useModalContext must be used within ModalProvider')
  }
  return context
}

