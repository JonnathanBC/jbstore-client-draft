import { redirect } from 'react-router';
import { commitSession } from './session.server';
import type { ToastFlash } from '~/components/AppToaster';

type FlashOptions = {
  title?: string;
  redirectTo: string;
};

export async function flashSuccess(
  session: any,
  message: string,
  options: FlashOptions
) {
  const toast: ToastFlash = {
    kind: 'success',
    title: options.title,
    message,
  };

  session.flash('toast', toast);

  return redirect(options.redirectTo, {
    headers: {
      'Set-Cookie': await commitSession(session),
    },
  });
}

export async function flashError(
  session: any,
  message: string,
  options: FlashOptions
) {
  const toast: ToastFlash = {
    kind: 'error',
    title: options.title ?? 'Error',
    message,
  };

  session.flash('toast', toast);

  return redirect(options.redirectTo, {
    headers: {
      'Set-Cookie': await commitSession(session),
    },
  });
}