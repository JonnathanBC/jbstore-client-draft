import { CrudDialog } from '@/components/CrudDialog';

type Props = {
  open: boolean;
  onClose: (open: boolean) => void;
};

export const FamilyForm = ({ open, onClose }: Props) => {
  return (
    <CrudDialog open={open} onClose={onClose} title="Crear Familia">
      <h1>Family form</h1>
    </CrudDialog>
  );
};
