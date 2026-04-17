import { modalRegistry } from '@/config/modalsRegistry';
import { atom } from 'nanostores';
import type { ComponentType } from 'react';

type ModalType = keyof typeof modalRegistry;

export const $modals = atom<{ _key: ModalType; Component: ComponentType<any>; props: any }[]>([]);

export const openModal = (modalKey: ModalType, props: any = {}) => {
  const modalConfig = modalRegistry[modalKey];
  if (!modalConfig) {
    console.warn(`Modal ${modalKey} not found in registry`);
    return;
  }
  $modals.set([...$modals.get(), { _key: modalKey, Component: modalConfig.Component, props }]);
};

export const closeModal = (index: number) => {
  $modals.set($modals.get().filter((_: any, i: any) => i !== index));
};
