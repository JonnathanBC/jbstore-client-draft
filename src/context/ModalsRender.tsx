import { Suspense } from 'react';
import { useStore } from '@nanostores/react';
import { $modals, closeModal } from '@/stores';

export const ModalsRender = () => {
  const modals = useStore($modals);

  return (
    <>
      {modals?.map((modal, index) => {
        const ModalComponent = modal.Component;
        return (
          <Suspense fallback={null} key={index}>
            <ModalComponent open={true} onClose={() => closeModal(index)} {...modal.props} />
          </Suspense>
        );
      })}
    </>
  );
};
