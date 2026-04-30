import {
  Form,
  Link,
  redirect,
  useActionData,
  useNavigation,
} from 'react-router'
import { Lock, User } from 'lucide-react'
import type { Route } from './+types/_auth.register'
import { register } from '~/server/auth.server'
import { commitSession, getSession } from '~/server/session.server'
import { GoogleIcon } from '~/components/icons/GoogleIcon'
import { Input } from '~/components/shared/Input'

export const meta: Route.MetaFunction = () => [
  { title: 'Crear cuenta | JB Store' },
]

export async function action({ request }: Route.ActionArgs) {
  const form = await request.formData()
  const name = String(form.get('name') ?? '').trim()
  const email = String(form.get('email') ?? '').trim()
  const password = String(form.get('password') ?? '')
  const password_confirmation = String(form.get('password_confirmation') ?? '')

  if (!name || !email || !password || !password_confirmation) {
    return { error: 'Todos los campos son requeridos' }
  }

  if (password.length < 8) {
    return { error: 'La contraseña debe tener al menos 8 caracteres' }
  }

  if (password !== password_confirmation) {
    return { error: 'Las contraseñas no coinciden' }
  }

  const result = await register({
    name,
    email,
    password,
    password_confirmation,
  })
  if ('error' in result) {
    return { error: result.error.message || 'No se pudo crear la cuenta' }
  }

  const session = await getSession(request.headers.get('Cookie'))
  session.set('token', result.token)
  session.set('userId', result.user.id)
  session.flash('toast', {
    kind: 'success',
    title: 'Cuenta creada',
    message: `¡Bienvenido, ${result.user.name}!`,
  })

  return redirect('/admin', {
    headers: { 'Set-Cookie': await commitSession(session) },
  })
}

export default function RegisterPage() {
  const actionData = useActionData<typeof action>()
  const nav = useNavigation()
  const submitting = nav.state === 'submitting'

  return (
    <div className="flex min-h-screen">
      <div className="flex w-full items-center justify-center p-8 lg:w-1/2">
        <Form method="post" className="w-full max-w-sm space-y-4">
          <h2 className="text-2xl font-bold text-slate-900">Crear Cuenta</h2>
          {actionData?.error && (
            <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
              {actionData.error}
            </div>
          )}

          <Input label="Name" name="name" icon={User} required />
          <Input label="Email" name="email" type="email" icon={User} required />
          <Input
            label="Password"
            name="password"
            type="password"
            icon={Lock}
            required
            minLength={8}
          />
          <Input
            label="Confirm Password"
            name="password_confirmation"
            type="password"
            icon={Lock}
            required
            minLength={8}
          />

          <div className="mt-12">
            <button
              type="submit"
              disabled={submitting}
              className="w-full cursor-pointer rounded-lg bg-blue-600 px-4 py-2.5 text-[15px] font-medium tracking-wide text-white shadow-xl hover:bg-blue-700 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
            >
              {submitting ? 'Creando...' : 'Crear cuenta'}
            </button>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-white px-4 text-slate-500">
                  or continua con
                </span>
              </div>
            </div>

            <a
              href="/api/auth/google"
              className="flex w-full items-center justify-center gap-3 rounded-lg border border-slate-300 px-4 py-2.5 transition-colors hover:bg-slate-50"
            >
              <GoogleIcon className="h-5 w-5" />
              <span className="text-sm font-medium text-slate-700">
                Login con Google
              </span>
            </a>

            <p className="mt-6 text-center text-sm text-slate-600">
              ¿Ya tiene una cuenta?{' '}
              <Link
                to="/login"
                className="ml-1 font-medium text-blue-600 hover:underline"
              >
                Sign in
              </Link>
            </p>
          </div>
        </Form>
      </div>

      <div className="hidden w-1/2 items-center justify-center bg-slate-50 lg:flex">
        <img
          src="/assets/deliveries.svg"
          alt="Deliveries"
          className="w-4/5 max-w-lg"
        />
      </div>
    </div>
  )
}
