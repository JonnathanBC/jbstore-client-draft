import { createContext, useContext } from 'react';
import { openModal, closeModal } from '@/stores/modals.store';

export const ModalsContext = createContext({ openModal, closeModal } as any);

export const ModalsProvider = ({ children }: { children: React.ReactNode }) => {
  return (
    <ModalsContext.Provider value={{ openModal, closeModal }}>{children}</ModalsContext.Provider>
  );
};

export const useModalsNavigator = () => {
  return useContext(ModalsContext);
};
