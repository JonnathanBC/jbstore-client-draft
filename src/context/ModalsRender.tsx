import { lazy, Suspense } from 'react';
import { useStore } from '@nanostores/react';
import { $modals, closeModal } from '@/stores';
import { modalRegistry } from '@/config/modalsRegistry';

export const ModalsRender = () => {
  const modals = useStore($modals);

  return (
    <>
      {modals?.map((modal, index) => {
        const ModalComponent: any = lazy(modalRegistry[modal._key].Component);
        return (
          <Suspense fallback={null} key={index}>
            <ModalComponent
              {...modal}
              open={true}
              setOpen={(open: boolean) => {
                if (!open) closeModal(index);
              }}
            />
          </Suspense>
        );
      })}
    </>
  );
};
