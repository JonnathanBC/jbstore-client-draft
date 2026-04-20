import { Form, Link, redirect, useActionData, useNavigation, useSearchParams } from 'react-router';
import { Lock, User } from 'lucide-react';
import type { Route } from './+types/_auth.login';
import { login } from '~/server/auth.server';
import { commitSession, getSession } from '~/server/session.server';
import { GoogleIcon } from '~/components/icons/GoogleIcon';
import { Input } from '~/components/shared/Input';

export const meta: Route.MetaFunction = () => [{ title: 'Iniciar sesión | JB Store' }];

export async function action({ request }: Route.ActionArgs) {
  const form = await request.formData();
  const email = String(form.get('email') ?? '').trim();
  const password = String(form.get('password') ?? '');
  const redirectTo = String(form.get('redirectTo') ?? '/admin');

  if (!email || !password) {
    return { error: 'Email y contraseña son requeridos' };
  }

  const result = await login(email, password);
  if ('error' in result) {
    return { error: result.error.message || 'Credenciales inválidas' };
  }

  const session = await getSession(request.headers.get('Cookie'));
  session.set('token', result.token);
  session.set('userId', result.user.id);

  return redirect(redirectTo, {
    headers: { 'Set-Cookie': await commitSession(session) },
  });
}

export default function LoginPage() {
  const actionData = useActionData<typeof action>();
  const nav = useNavigation();
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get('redirectTo') ?? '/admin';
  const submitting = nav.state === 'submitting';

  return (
    <div className="flex min-h-screen">
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <Form method="post" className="w-full max-w-sm space-y-4">
          <h2 className="text-2xl font-bold text-slate-900">Sign in</h2>
          {actionData?.error && (
            <div className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">{actionData.error}</div>
          )}

          <input type="hidden" name="redirectTo" value={redirectTo} />

          <Input label="Email" name="email" type="email" icon={User} required />
          <Input label="Password" name="password" type="password" icon={Lock} required />

          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 shrink-0 text-blue-600 focus:ring-blue-500 border-slate-300 rounded"
              />
              <label htmlFor="remember-me" className="ml-3 block text-sm text-slate-900">
                Remember me
              </label>
            </div>
          </div>

          <div className="mt-12">
            <button
              type="submit"
              disabled={submitting}
              className="w-full shadow-xl py-2.5 px-4 text-[15px] font-medium tracking-wide rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? 'Entrando...' : 'Sign in'}
            </button>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-white px-4 text-slate-500">Or continue with</span>
              </div>
            </div>

            <a
              href="/api/auth/google"
              className="w-full flex items-center justify-center gap-3 py-2.5 px-4 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
            >
              <GoogleIcon className="w-5 h-5" />
              <span className="text-sm font-medium text-slate-700">Sign in with Google</span>
            </a>

            <p className="text-sm mt-6 text-center text-slate-600">
              Don't have an account?{' '}
              <Link to="/register" className="text-blue-600 font-medium hover:underline ml-1">
                Register here
              </Link>
            </p>
          </div>
        </Form>
      </div>

      <div className="hidden lg:flex w-1/2 items-center justify-center bg-slate-50">
        <img src="/assets/deliveries.svg" alt="Deliveries" className="w-4/5 max-w-lg" />
      </div>
    </div>
  );
}
