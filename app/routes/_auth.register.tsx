import { Form, Link, redirect, useActionData, useNavigation } from 'react-router';
import type { Route } from './+types/_auth.register';
import { register } from '~/server/auth.server';
import { commitSession, getSession } from '~/server/session.server';

export const meta: Route.MetaFunction = () => [{ title: 'Crear cuenta | JB Store' }];

export async function action({ request }: Route.ActionArgs) {
  const form = await request.formData();
  const name = String(form.get('name') ?? '').trim();
  const email = String(form.get('email') ?? '').trim();
  const password = String(form.get('password') ?? '');
  const password_confirmation = String(form.get('password_confirmation') ?? '');

  if (!name || !email || !password || !password_confirmation) {
    return { error: 'Todos los campos son requeridos' };
  }

  if (password.length < 8) {
    return { error: 'La contraseña debe tener al menos 8 caracteres' };
  }

  if (password !== password_confirmation) {
    return { error: 'Las contraseñas no coinciden' };
  }

  const result = await register({ name, email, password, password_confirmation });
  if ('error' in result) {
    return { error: result.error.message || 'No se pudo crear la cuenta' };
  }

  const session = await getSession(request.headers.get('Cookie'));
  session.set('token', result.token);
  session.set('userId', result.user.id);
  session.flash('toast', {
    kind: 'success',
    title: 'Cuenta creada',
    message: `¡Bienvenido, ${result.user.name}!`,
  });

  return redirect('/admin', {
    headers: { 'Set-Cookie': await commitSession(session) },
  });
}

export default function RegisterPage() {
  const actionData = useActionData<typeof action>();
  const nav = useNavigation();
  const submitting = nav.state === 'submitting';

  return (
    <div className="flex min-h-screen">
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <Form method="post" className="w-full max-w-sm space-y-4">
          <h2 className="text-2xl font-bold text-slate-900">Crear Cuenta</h2>
          {actionData?.error && (
            <div className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">{actionData.error}</div>
          )}

          <div>
            <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-1">
              Name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              required
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-1">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              minLength={8}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label
              htmlFor="password_confirmation"
              className="block text-sm font-medium text-slate-700 mb-1"
            >
              Confirm Password
            </label>
            <input
              id="password_confirmation"
              name="password_confirmation"
              type="password"
              required
              minLength={8}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="mt-12">
            <button
              type="submit"
              disabled={submitting}
              className="w-full shadow-xl py-2.5 px-4 text-[15px] font-medium tracking-wide rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? 'Creando...' : 'Crear cuenta'}
            </button>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-white px-4 text-slate-500">or continua con</span>
              </div>
            </div>

            <a
              href="/api/auth/google"
              className="w-full flex items-center justify-center gap-3 py-2.5 px-4 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
            >
              <span className="text-sm font-medium text-slate-700">Login con Google</span>
            </a>

            <p className="text-sm mt-6 text-center text-slate-600">
              ¿Ya tiene una cuenta?{' '}
              <Link to="/login" className="text-blue-600 font-medium hover:underline ml-1">
                Sign in
              </Link>
            </p>
          </div>
        </Form>
      </div>

      <div className="hidden lg:flex w-1/2 items-center justify-center bg-slate-50">
        <div className="text-slate-400">Jb Store</div>
      </div>
    </div>
  );
}
