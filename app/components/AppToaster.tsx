import { useEffect } from 'react';
import { Toaster, toast as sonner } from 'sonner';

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
    const options = { description: toast.message };
    const title = toast.title ?? toast.message;
    switch (toast.kind) {
      case 'success':
        sonner.success(title, options);
        break;
      case 'error':
        sonner.error(title, options);
        break;
      case 'warning':
        sonner.warning(title, options);
        break;
      case 'info':
      default:
        sonner.info(title, options);
        break;
    }
  }, [toast]);

  return <Toaster position="bottom-right" richColors closeButton />;
};
