import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  isRouteErrorResponse,
  useRouteError,
} from 'react-router';

import type { Route } from './+types/root';
import './styles/global.css';

export const links: Route.LinksFunction = () => [
  { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
];

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return <Outlet />;
}

export function ErrorBoundary() {
  const error = useRouteError() as Error;

  if (isRouteErrorResponse(error)) {
    return (
      <main className="min-h-screen flex items-center justify-center p-8">
        <div className="max-w-md text-center space-y-2">
          <h1 className="text-2xl font-bold">
            {error.status} {error.statusText}
          </h1>
          {error.data ? <p className="text-sm text-slate-600">{String(error.data)}</p> : null}
        </div>
      </main>
    );
  }

  const message = error ? error.message : 'Unknown error';

  return (
    <main className="min-h-screen flex items-center justify-center p-8">
      <div className="max-w-md text-center space-y-2">
        <h1 className="text-2xl font-bold">Algo salió mal</h1>
        <p className="text-slate-700">{message}</p>
      </div>
    </main>
  );
}
