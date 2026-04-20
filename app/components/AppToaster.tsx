import { useEffect } from 'react';
import { Toaster, sileo } from 'sileo';
import 'sileo/styles.css';

export type ToastFlash = {
  kind: 'success' | 'error' | 'info' | 'warning';
  title?: string;
  message: string;
};

interface Props {
  toast?: ToastFlash | null;
}

export const AppToaster = ({ toast }: Props) => {
  useEffect(() => {
    if (!toast) return;
    const options = { title: toast.title, description: toast.message };
    switch (toast.kind) {
      case 'success':
        sileo.success(options);
        break;
      case 'error':
        sileo.error(options);
        break;
      case 'warning':
        sileo.warning(options);
        break;
      case 'info':
      default:
        sileo.info(options);
        break;
    }
  }, [toast]);

  return <Toaster position="bottom-right" />;
};
