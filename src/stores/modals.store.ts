import { modalRegistry } from '@/config/modalsRegistry';
import { atom } from 'nanostores';

type ModalType = keyof typeof modalRegistry;

export const $modals = atom<{ _key: ModalType; Component: any; props: any }[]>([]);

export const openModal = (modalKey: ModalType, props: any = {}) => {
  const Component = modalRegistry[modalKey]?.Component;
  if (!Component) {
    console.warn(`Modal ${modalKey} not found in registry`);
    return;
  }
  $modals.set([...$modals.get(), { _key: modalKey, Component, props }]);
};

export const closeModal = (index: number) => {
  $modals.set($modals.get().filter((_: any, i: any) => i !== index));
};
