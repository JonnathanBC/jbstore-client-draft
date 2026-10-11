import { isRouteErrorResponse, Link, useRouteError } from 'react-router'

const MESSAGES: Record<number, { title: string; description: string }> = {
  403: {
    title: 'No tenés permiso',
    description: 'Tu cuenta no tiene acceso a esta sección.',
  },
  404: {
    title: 'No encontramos lo que buscás',
    description: 'Puede que haya sido eliminado o que el link esté mal.',
  },
}

const FALLBACK = {
  title: 'Algo salió mal',
  description: 'Ocurrió un error inesperado. Intentá de nuevo en unos minutos.',
}

/**
 * Cuerpo de error para los ErrorBoundary de los layouts: el layout pone su marco
 * (Sidebar, Header...) y esto el contenido. Nunca muestra el mensaje crudo de la excepción.
 */
export const RouteErrorContent = ({ homeTo = '/' }: { homeTo?: string }) => {
  const error = useRouteError()
  const status = isRouteErrorResponse(error) ? error.status : 500
  const { title, description } = MESSAGES[status] ?? FALLBACK

  return (
    <div className="mx-auto max-w-md space-y-3 py-16 text-center">
      <p className="text-sm font-medium text-zinc-500">{status}</p>
      <h1 className="text-2xl font-semibold">{title}</h1>
      <p className="text-zinc-700">{description}</p>
      <Link
        to={homeTo}
        className="text-primary inline-block font-medium underline"
      >
        Volver al inicio
      </Link>
    </div>
  )
}
