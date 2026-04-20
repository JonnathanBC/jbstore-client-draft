# Guía de migración: Astro → React Router v7 (modo framework)

Guía práctica pensada para tu proyecto actual (`jb-store-client-draft`), que hoy corre en **Astro + islands de React** usando `Astro.callAction`, `Astro.cookies`, `nanostores`, `sonner` y `AdminLayout.astro`.

El objetivo: que entiendas el modelo mental de **React Router v7 en modo framework** y tengas una receta por cada patrón que hoy usas.

---

## Índice

1. [Cambio de mentalidad: Astro vs RR v7](#1-cambio-de-mentalidad-astro-vs-rr-v7)
2. [Instalación y estructura base](#2-instalación-y-estructura-base)
3. [File-based routing](#3-file-based-routing)
4. [`loader`: tu nuevo frontmatter `---`](#4-loader-tu-nuevo-frontmatter----)
5. [`action`: mutaciones](#5-action-mutaciones)
6. [Layouts anidados (`<Outlet />`)](#6-layouts-anidados-outlet-)
7. [Sesión y cookies (reemplazo de `Astro.cookies`)](#7-sesión-y-cookies-reemplazo-de-astrocookies)
8. [Autenticación: login, logout, sign-up](#8-autenticación-login-logout-sign-up)
9. [Protección de rutas (route guards)](#9-protección-de-rutas-route-guards)
10. [Provider de usuario (current user)](#10-provider-de-usuario-current-user)
11. [Middleware](#11-middleware)
12. [Variables de entorno](#12-variables-de-entorno)
13. [Fetch al backend](#13-fetch-al-backend)
14. [Estado y stores](#14-estado-y-stores)
15. [UI optimista y `useFetcher`](#15-ui-optimista-y-usefetcher)
16. [SEO, `<meta>` y títulos](#16-seo-meta-y-títulos)
17. [Rendering: SSR, client-only, streaming](#17-rendering-ssr-client-only-streaming)
18. [Error boundaries](#18-error-boundaries)
19. [Mapa concreto: tu proyecto actual → RR v7](#19-mapa-concreto-tu-proyecto-actual--rr-v7)
20. [Checklist de migración](#20-checklist-de-migración)
21. [Trampas frecuentes](#21-trampas-frecuentes)
22. [Deployment](#22-deployment)
23. [TL;DR mental](#23-tldr-mental)
24. [Estado de la migración](#24-estado-de-la-migración)

---

## 1. Cambio de mentalidad: Astro vs RR v7

| Concepto | Astro | React Router v7 |
|---|---|---|
| Unidad de página | `.astro` con frontmatter `---` | `.tsx` con `loader` y default export |
| Código servidor | Dentro de `---` | Funciones `loader`/`action` exportadas |
| Hidratación | Islands puntuales (`client:load`) | Todo el árbol React hidratado |
| Routing | `src/pages/` | `app/routes/` |
| Layouts | `<Layout><slot /></Layout>` | Rutas padre con `<Outlet />` |
| Datos a página | `await Astro.callAction(...)` | `return` desde `loader` |
| Mutaciones | `actions` + `astro:actions` | `action` + `<Form method="post">` |
| Cookies | `Astro.cookies` | Helper `createCookieSessionStorage` |
| Props al cliente | Serializables (¡sin funciones!) | `useLoaderData<typeof loader>()` tipado |
| Middleware | `src/middleware.ts` | `unstable_middleware` en rutas |
| Protección de rutas | Condicional en middleware/página | `throw redirect()` desde loader |

**Idea clave**: en Astro el HTML es el ciudadano principal y React entra como invitado; en RR v7 **todo es React**, pero los datos viajan por `loader`/`action` y nunca hay "islands separados" con estado desincronizado.

---

## 2. Instalación y estructura base

```bash
npx create-react-router@latest jb-store-rr
cd jb-store-rr
npm run dev
```

Estructura típica:

```
app/
  root.tsx                         # Shell HTML raíz
  routes.ts                        # (opcional) registro declarativo
  routes/
    _index.tsx                     # /
    _auth.tsx                      # layout pathless para /login, /register
    _auth.login.tsx                # /login
    _auth.register.tsx             # /register
    admin.tsx                      # layout /admin/*
    admin._index.tsx               # /admin
    admin.families._index.tsx      # /admin/families
    admin.families.$id.tsx         # /admin/families/:id
    admin.families.create.tsx      # /admin/families/create
    admin.families.$id.delete.tsx  # /admin/families/:id/delete (solo action)
    logout.tsx
  components/
  server/
    session.server.ts
    auth.server.ts
    api.server.ts
  lib/
public/
react-router.config.ts
vite.config.ts
.env
```

---

## 3. File-based routing

Convenciones del directorio `app/routes/`:

- **`_index.tsx`** → ruta índice del segmento padre.
- **`.` (punto)** → separador: `admin.families.create.tsx` = `/admin/families/create`.
- **`$param`** → parámetro dinámico: `admin.families.$id.tsx` = `/admin/families/:id`.
- **`_prefijo`** → **layout pathless** (no genera URL pero sí layout compartido). `_auth.login.tsx` = `/login`, todos los `_auth.*` comparten layout `_auth.tsx`.
- **Archivo + carpeta mismo nombre** → ese archivo es el layout del segmento.
- **`.$`** → splat/catch-all: `docs.$.tsx` captura todo lo que venga después de `/docs/`.

Alternativa: `app/routes.ts` con definiciones explícitas si prefieres no usar la convención.

```ts
// app/routes.ts
import { type RouteConfig, route, layout, index } from '@react-router/dev/routes';

export default [
  index('routes/_index.tsx'),
  layout('routes/_auth.tsx', [
    route('login', 'routes/_auth.login.tsx'),
    route('register', 'routes/_auth.register.tsx'),
  ]),
  layout('routes/admin.tsx', [
    index('routes/admin._index.tsx'),
    route('families', 'routes/admin.families._index.tsx'),
    route('families/:id', 'routes/admin.families.$id.tsx'),
    route('families/create', 'routes/admin.families.create.tsx'),
  ]),
] satisfies RouteConfig;
```

---

## 4. `loader`: tu nuevo frontmatter `---`

### Astro (actual)

```astro
---
// src/pages/admin/families/index.astro
const page = Number(Astro.url.searchParams.get('page') ?? 1);
const { data: families } = await Astro.callAction(actions.getFamilies, { page });
const token = Astro.cookies.get('auth_token')?.value ?? '';
---
<AdminLayout>
  <CrudPageDetail columns={columns} token={token} client:load />
</AdminLayout>
```

### RR v7 equivalente

```tsx
// app/routes/admin.families._index.tsx
import type { Route } from './+types/admin.families._index';
import { useLoaderData } from 'react-router';
import { requireAuth } from '~/server/auth.server';
import { getFamilies } from '~/server/api.server';
import { CrudPageDetail } from '~/components/CrudPageDetail';

export async function loader({ request }: Route.LoaderArgs) {
  const user = await requireAuth(request);
  const page = Number(new URL(request.url).searchParams.get('page') ?? 1);
  const families = await getFamilies({ page, token: user.token });
  return { families, page };
}

export default function FamiliesPage() {
  const { families } = useLoaderData<typeof loader>();
  return <CrudPageDetail data={families.data} meta={families.meta} />;
}
```

### Cuándo corre un loader

- Primera carga SSR.
- Cada navegación client-side a esa ruta.
- Después de cualquier `action` → **revalidación automática**.
- Puedes forzar revalidación con `useRevalidator()`.

### Cosas que puedes devolver de un loader

- Objetos JSON (lo normal).
- `redirect('/otra-ruta')` (lanza, no retorna).
- `Response` nativas (útiles para streams, custom headers).
- Promesas sin resolver → streaming con `<Await>` (sección 17).

---

## 5. `action`: mutaciones

El `action` reemplaza a tus `Astro.callAction` **cuando hay intención de escribir** (POST/PUT/DELETE/PATCH).

```tsx
// app/routes/admin.families.create.tsx
import type { Route } from './+types/admin.families.create';
import { Form, redirect, useActionData, useNavigation } from 'react-router';
import { requireAuth } from '~/server/auth.server';
import { createFamily } from '~/server/api.server';

export async function action({ request }: Route.ActionArgs) {
  const user = await requireAuth(request);
  const formData = await request.formData();
  const name = String(formData.get('name') ?? '').trim();

  if (!name) return { error: 'El nombre es obligatorio' };

  await createFamily({ name, token: user.token });
  return redirect('/admin/families');
}

export default function CreateFamily() {
  const actionData = useActionData<typeof action>();
  const nav = useNavigation();
  const submitting = nav.state === 'submitting';

  return (
    <Form method="post" className="space-y-4">
      <input name="name" className="input" />
      {actionData?.error && <p className="text-red-500">{actionData.error}</p>}
      <button type="submit" disabled={submitting}>
        {submitting ? 'Creando...' : 'Crear'}
      </button>
    </Form>
  );
}
```

### Puntos importantes

- **`<Form>` vs `<form>`**: `<Form>` intercepta el submit, llama al action sin recargar la página, y revalida los loaders. `<form>` nativo también funciona — hace un POST full page.
- **`useNavigation()`** → estado `idle`/`submitting`/`loading` para spinners y disabling.
- **Múltiples actions en una ruta**: agrega un hidden `<input type="hidden" name="intent" value="delete" />` y haz `switch` en el action.
- **Action pura (sin UI)**: una ruta puede exportar solo `action` — útil para endpoints tipo `/families/:id/delete`.

### Action con múltiples intents

```tsx
export async function action({ request, params }: Route.ActionArgs) {
  const form = await request.formData();
  const intent = form.get('intent');

  switch (intent) {
    case 'update':
      return updateFamily(params.id!, { name: String(form.get('name')) });
    case 'delete':
      await deleteFamily(params.id!);
      return redirect('/admin/families');
    default:
      throw new Response('Invalid intent', { status: 400 });
  }
}
```

---

## 6. Layouts anidados (`<Outlet />`)

En Astro:
```astro
<AdminLayout><slot /></AdminLayout>
```

En RR v7, el layout **es una ruta padre** con `<Outlet />`:

```tsx
// app/routes/admin.tsx
import { Outlet, useLoaderData } from 'react-router';
import { Sidebar } from '~/components/Sidebar';
import { Breadcrumbs } from '~/components/Breadcrumbs';
import { AppToaster } from '~/components/AppToaster';
import { requireAuth } from '~/server/auth.server';
import type { Route } from './+types/admin';

export async function loader({ request }: Route.LoaderArgs) {
  const user = await requireAuth(request);
  return { user };
}

export default function AdminLayout() {
  const { user } = useLoaderData<typeof loader>();
  return (
    <>
      <Sidebar user={user} />
      <div className="p-4 sm:ml-64 min-h-screen pt-18">
        <Breadcrumbs />
        <main className="p-4 border border-gray-200 border-dashed rounded-lg">
          <Outlet />
        </main>
        <AppToaster />
      </div>
    </>
  );
}
```

### Acceder al loader del layout desde una ruta hija

```tsx
import { useRouteLoaderData } from 'react-router';
import type { loader as adminLoader } from './admin';

function DeepChild() {
  const data = useRouteLoaderData<typeof adminLoader>('routes/admin');
  return <span>Hola {data?.user.name}</span>;
}
```

Esto elimina el "prop drilling" típico — cualquier hijo pide los datos del padre por id de ruta.

### `root.tsx`

Reemplaza al `<html>...</html>` de AdminLayout.astro:

```tsx
// app/root.tsx
import { Links, Meta, Outlet, Scripts, ScrollRestoration } from 'react-router';
import './styles/global.css';

export default function App() {
  return (
    <html lang="es">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        <Outlet />
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}
```

---

## 7. Sesión y cookies (reemplazo de `Astro.cookies`)

```ts
// app/server/session.server.ts
import { createCookieSessionStorage } from 'react-router';

type SessionData = { token: string; userId: string };
type SessionFlash = { toast: { kind: 'success' | 'error'; message: string } };

export const { getSession, commitSession, destroySession } =
  createCookieSessionStorage<SessionData, SessionFlash>({
    cookie: {
      name: '__session',
      httpOnly: true,
      sameSite: 'lax',
      secrets: [process.env.SESSION_SECRET!],
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    },
  });
```

### Flash messages (toasts persistidos tras redirect)

```ts
const session = await getSession(request.headers.get('Cookie'));
session.flash('toast', { kind: 'success', message: 'Guardado' });
return redirect('/admin/families', {
  headers: { 'Set-Cookie': await commitSession(session) },
});
```

Y en el loader del layout admin:

```ts
const toast = session.get('toast');
return data({ toast }, { headers: { 'Set-Cookie': await commitSession(session) } });
```

---

## 8. Autenticación: login, logout, sign-up

```ts
// app/server/auth.server.ts
import { redirect } from 'react-router';
import { getSession, commitSession, destroySession } from './session.server';

export async function requireAuth(request: Request) {
  const session = await getSession(request.headers.get('Cookie'));
  const token = session.get('token');
  const userId = session.get('userId');
  if (!token || !userId) {
    const url = new URL(request.url);
    const redirectTo = url.pathname + url.search;
    throw redirect(`/login?redirectTo=${encodeURIComponent(redirectTo)}`);
  }
  return { token, userId };
}

export async function getOptionalUser(request: Request) {
  const session = await getSession(request.headers.get('Cookie'));
  return session.get('token') ? { token: session.get('token')!, userId: session.get('userId')! } : null;
}

export async function login(email: string, password: string) {
  const res = await fetch(`${process.env.API_URL}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) return null;
  return res.json() as Promise<{ token: string; user: { id: string; name: string; email: string } }>;
}
```

### Ruta login

```tsx
// app/routes/_auth.login.tsx
import { Form, redirect, useActionData } from 'react-router';
import { getSession, commitSession } from '~/server/session.server';
import { login } from '~/server/auth.server';
import type { Route } from './+types/_auth.login';

export async function action({ request }: Route.ActionArgs) {
  const form = await request.formData();
  const email = String(form.get('email'));
  const password = String(form.get('password'));
  const redirectTo = String(form.get('redirectTo') ?? '/admin');

  const result = await login(email, password);
  if (!result) return { error: 'Credenciales inválidas' };

  const session = await getSession(request.headers.get('Cookie'));
  session.set('token', result.token);
  session.set('userId', result.user.id);

  return redirect(redirectTo, {
    headers: { 'Set-Cookie': await commitSession(session) },
  });
}

export default function Login() {
  const data = useActionData<typeof action>();
  return (
    <Form method="post" className="max-w-sm mx-auto space-y-3">
      <input name="email" type="email" required />
      <input name="password" type="password" required />
      {data?.error && <p className="text-red-500">{data.error}</p>}
      <button type="submit">Entrar</button>
    </Form>
  );
}
```

### Logout

```tsx
// app/routes/logout.tsx
import { redirect } from 'react-router';
import { getSession, destroySession } from '~/server/session.server';
import type { Route } from './+types/logout';

export async function action({ request }: Route.ActionArgs) {
  const session = await getSession(request.headers.get('Cookie'));
  return redirect('/login', { headers: { 'Set-Cookie': await destroySession(session) } });
}

export async function loader() {
  return redirect('/');
}
```

Un botón "Cerrar sesión" en cualquier parte:

```tsx
<Form method="post" action="/logout">
  <button>Cerrar sesión</button>
</Form>
```

---

## 9. Protección de rutas (route guards)

En Astro hoy lo harías con `src/middleware.ts` chequeando cookie y redirigiendo. En RR v7 el patrón canónico es **llamar `requireAuth` dentro del loader**:

```tsx
export async function loader({ request }: Route.LoaderArgs) {
  const user = await requireAuth(request); // throw redirect si no hay sesión
  return { user };
}
```

**Ventaja enorme**: al ponerlo en el layout `admin.tsx`, **toda la rama `/admin/*` queda protegida automáticamente** — los loaders de las rutas padre corren antes que los de las hijas.

### Roles y permisos

```ts
// app/server/auth.server.ts
export async function requireRole(request: Request, role: 'admin' | 'editor') {
  const user = await requireAuth(request);
  const me = await fetchMe(user.token);
  if (!me.roles.includes(role)) {
    throw new Response('Forbidden', { status: 403 });
  }
  return me;
}
```

Y lo usas con:

```ts
export async function loader({ request }: Route.LoaderArgs) {
  const user = await requireRole(request, 'admin');
  return { user };
}
```

Si falta el rol, el `throw new Response` lo captura el `ErrorBoundary` de la ruta (ver sección 18).

### Guard sólo para invitados (rutas de login)

```tsx
// app/routes/_auth.tsx
export async function loader({ request }: Route.LoaderArgs) {
  const user = await getOptionalUser(request);
  if (user) throw redirect('/admin');
  return null;
}
```

---

## 10. Provider de usuario (current user)

En React tradicional harías un `UserContext`. En RR v7 normalmente **no lo necesitas**: el layout carga el user una vez y los hijos lo piden con `useRouteLoaderData`.

### Patrón simple (recomendado)

```tsx
// app/hooks/useCurrentUser.ts
import { useRouteLoaderData } from 'react-router';
import type { loader as adminLoader } from '~/routes/admin';

export function useCurrentUser() {
  const data = useRouteLoaderData<typeof adminLoader>('routes/admin');
  if (!data?.user) throw new Error('useCurrentUser fuera de /admin');
  return data.user;
}
```

Uso en cualquier componente de `/admin/*`:

```tsx
const user = useCurrentUser();
return <p>Hola {user.name}</p>;
```

### Variante con Context (si realmente lo quieres)

```tsx
// app/context/UserContext.tsx
import { createContext, useContext } from 'react';

type User = { id: string; name: string; email: string };
const UserContext = createContext<User | null>(null);

export const UserProvider = UserContext.Provider;

export function useUser() {
  const u = useContext(UserContext);
  if (!u) throw new Error('useUser sin UserProvider');
  return u;
}
```

Y en el layout:

```tsx
export default function AdminLayout() {
  const { user } = useLoaderData<typeof loader>();
  return (
    <UserProvider value={user}>
      <Sidebar />
      <Outlet />
    </UserProvider>
  );
}
```

**Cuándo elegir Context**: si hay componentes que consumen user y viven fuera del árbol de rutas (ej. un portal de modal renderizado en otra parte del DOM). En el 90% de los casos `useRouteLoaderData` es suficiente y más sencillo.

---

## 11. Middleware

RR v7 tiene middleware (todavía `unstable_` en algunas versiones) que corre **antes** de loaders/actions — útil para logging, rate limiting, CSRF, i18n.

```tsx
// app/routes/admin.tsx
import type { Route } from './+types/admin';

export const unstable_middleware: Route.unstable_MiddlewareFunction[] = [
  async ({ request }, next) => {
    const start = Date.now();
    const res = await next();
    console.log(`${request.method} ${request.url} — ${Date.now() - start}ms`);
    return res;
  },
];
```

Para la mayoría de casos de **protección de rutas**, no necesitas middleware: basta con `requireAuth` dentro del loader del layout.

---

## 12. Variables de entorno

- **`.env`** y **`.env.local`** en la raíz del proyecto (Vite las carga).
- **Servidor**: cualquier `process.env.FOO` dentro de archivos `.server.ts`.
- **Cliente**: solo vars con prefijo `VITE_` y accedidas vía `import.meta.env.VITE_FOO`.

```ts
// app/server/api.server.ts
const API_URL = process.env.API_URL!; // nunca se envía al cliente
```

```tsx
// cualquier .tsx de cliente
const analyticsKey = import.meta.env.VITE_ANALYTICS_KEY;
```

Regla de oro: si el valor es secreto, **nunca** le pongas prefijo `VITE_`.

---

## 13. Fetch al backend

Tu `apiClient` actual sigue valiendo. Muévelo a la capa adecuada:

```ts
// app/server/api.server.ts
import { apiClient } from '~/lib/apiClient';

export async function getFamilies({ page, token }: { page: number; token: string }) {
  const res = await apiClient(token).get(`/families?page=${page}`);
  return res.data;
}

export async function createFamily({ name, token }: { name: string; token: string }) {
  const res = await apiClient(token).post('/families', { name });
  return res.data;
}

export async function deleteFamily(id: string, token: string) {
  await apiClient(token).delete(`/families/${id}`);
}
```

**Importante**: si el archivo termina en `.server.ts`, el bundler **no lo incluye en el cliente** — seguro para secrets.

### Cuándo seguir haciendo fetch desde el cliente

Casi nunca. Solo si:
- Polling en tiempo real.
- Autocomplete con muchas consultas por segundo.
- Websockets.

En esos casos usa `useFetcher` apuntando a una ruta tipo `/api/search` con solo `loader`/`action`, para que toda la lógica siga en servidor.

---

## 14. Estado y stores

En RR v7 la mayoría del "estado global" desaparece:

| Caso | Antes (Astro + stores) | Ahora (RR v7) |
|---|---|---|
| Datos del servidor | `nanostores` + fetch cliente | `loader` |
| Filtros, paginación | Estado en store | `useSearchParams()` + loader lee URL |
| Estado de formulario | `useState` + manual | `<Form>` + `useActionData` + `useNavigation` |
| Usuario actual | `$user` store | Loader del layout + `useRouteLoaderData` |
| Tema, idioma | Store local | Cookie + loader (persiste entre visitas) |
| Modales abiertos | `$modals` store | **Se queda como estado local/store** ✓ |
| Notificaciones (toast) | `sonner` | `sonner` igual, pero sin bug de islands |

**Cuándo todavía usar nanostores/zustand**: estado **cross-cutting de UI puro**, que no debe persistirse ni sincronizarse con el servidor — modales, preferencias de layout en memoria, carrito volátil, etc.

Regla: si el dato viene del servidor, vive en el loader. Si es puramente UI efímera, store.

---

## 15. UI optimista y `useFetcher`

`useFetcher` llama loaders/actions **sin navegar** — ideal para botones de eliminar, toggles, likes, etc.

```tsx
import { useFetcher } from 'react-router';
import { useEffect } from 'react';
import { toast } from 'sonner';

function DeleteButton({ id }: { id: string }) {
  const fetcher = useFetcher<{ ok: boolean; error?: string }>();
  const submitting = fetcher.state !== 'idle';

  useEffect(() => {
    if (fetcher.state === 'idle' && fetcher.data) {
      if (fetcher.data.ok) toast.success('Eliminado');
      else toast.error(fetcher.data.error ?? 'Error');
    }
  }, [fetcher.state, fetcher.data]);

  return (
    <fetcher.Form method="post" action={`/admin/families/${id}/delete`}>
      <button disabled={submitting}>{submitting ? '…' : 'Eliminar'}</button>
    </fetcher.Form>
  );
}
```

### Optimistic UI (toggle)

```tsx
function FavoriteButton({ id, isFav }: { id: string; isFav: boolean }) {
  const fetcher = useFetcher();
  const optimistic = fetcher.formData
    ? fetcher.formData.get('isFav') === 'true'
    : isFav;

  return (
    <fetcher.Form method="post" action={`/items/${id}/favorite`}>
      <input type="hidden" name="isFav" value={String(!optimistic)} />
      <button>{optimistic ? '★' : '☆'}</button>
    </fetcher.Form>
  );
}
```

El UI refleja el nuevo valor **antes** de que el server responda; si falla, la revalidación automática vuelve al estado correcto.

---

## 16. SEO, `<meta>` y títulos

Cada ruta puede exportar `meta`:

```tsx
// app/routes/admin.families._index.tsx
import type { Route } from './+types/admin.families._index';

export const meta: Route.MetaFunction = ({ data }) => [
  { title: 'Familias | JB Store' },
  { name: 'description', content: 'Gestiona tus familias' },
];
```

Recibe `data` del loader, así puedes hacer títulos dinámicos:

```tsx
export const meta: Route.MetaFunction = ({ data }) => [
  { title: `${data?.family.name} | JB Store` },
];
```

Los `<Meta />` y `<Links />` de `root.tsx` renderizan automáticamente lo que exportan las rutas activas.

---

## 17. Rendering: SSR, client-only, streaming

Todo es SSR por defecto. Casos especiales:

### Client-only (equivalente a `client:only="react"`)

```tsx
import { ClientOnly } from 'remix-utils/client-only';

<ClientOnly fallback={<Skeleton />}>
  {() => <MapaConWebGL />}
</ClientOnly>
```

O con `useEffect`+flag si no quieres la dependencia.

### Streaming con `<Await>`

```tsx
export async function loader() {
  return {
    fast: await getUser(),
    slow: getReportsBigAndSlow(), // sin await → promesa
  };
}

export default function Page() {
  const { fast, slow } = useLoaderData<typeof loader>();
  return (
    <>
      <h1>{fast.name}</h1>
      <Suspense fallback={<Spinner />}>
        <Await resolve={slow}>{(reports) => <ReportList items={reports} />}</Await>
      </Suspense>
    </>
  );
}
```

La página responde con el HTML inicial inmediato y el reporte llega por stream.

---

## 18. Error boundaries

Cada ruta puede exportar un `ErrorBoundary`:

```tsx
import { useRouteError, isRouteErrorResponse } from 'react-router';

export function ErrorBoundary() {
  const error = useRouteError();

  if (isRouteErrorResponse(error)) {
    return (
      <div>
        <h1>{error.status} {error.statusText}</h1>
        <p>{error.data}</p>
      </div>
    );
  }

  return <p>Error inesperado: {String(error)}</p>;
}
```

Captura errores de loaders, actions y del render — **sin romper toda la app**, solo esa rama del árbol.

Un `ErrorBoundary` en `root.tsx` es tu fallback global.

---

## 19. Mapa concreto: tu proyecto actual → RR v7

| Archivo / patrón actual | Equivalente RR v7 |
|---|---|
| `src/pages/admin/families/index.astro` | `app/routes/admin.families._index.tsx` con `loader` |
| `src/pages/admin/families/create.astro` | `app/routes/admin.families.create.tsx` con `action` |
| `src/pages/admin/families/[id].astro` | `app/routes/admin.families.$id.tsx` |
| `src/pages/admin/families/_components/FamilyForm.tsx` | `app/routes/admin.families._components/FamilyForm.tsx` (RR respeta carpetas con `_` prefix como "no routes") |
| `src/layouts/AdminLayout.astro` | `app/routes/admin.tsx` con `<Outlet />` |
| `src/components/admin/Sidebar.astro` | `app/components/Sidebar.tsx` |
| `src/components/shared/Breadcrumbs.astro` | `app/components/Breadcrumbs.tsx` usando `useMatches()` |
| `Astro.callAction(actions.getFamilies)` | Import + llamada directa dentro del loader |
| `Astro.cookies.get('auth_token')` | `requireAuth(request)` desde `session.server.ts` |
| `src/middleware.ts` | `requireAuth` en loader del layout (preferido) o `unstable_middleware` |
| `<Toaster client:load />` | `<AppToaster />` normal en el layout, **sin** directivas |
| `ModalsRender client:load` | Componente normal en el layout |
| `nanostores` | Solo para UI cross-cutting; datos del servidor → loaders |
| `sonner` (con `resolve.dedupe` y wrapper) | `sonner` **plano**, sin tricks — ya no hay islands |
| `astro:actions` | Funciones en `app/server/*.server.ts` llamadas por `loader`/`action` |
| `Astro.url.searchParams` (server) | `new URL(request.url).searchParams` |
| `URLSearchParams` (cliente) | `useSearchParams()` |
| Guardado `ENV` (`process.env` en Astro) | `process.env.X` en `.server.ts`, `import.meta.env.VITE_X` en cliente |

---

## 20. Checklist de migración

1. **Scaffold**: `npx create-react-router@latest` al lado del proyecto actual.
2. **Copiar**: `src/styles/`, `src/i18n/`, `src/lib/`, `src/types/`, componentes React puros.
3. **Sesión**: crear `app/server/session.server.ts` y `app/server/auth.server.ts`.
4. **Root**: `app/root.tsx` con `<html>`, `<Meta>`, `<Links>`, `<Scripts>`.
5. **Layout admin**: `app/routes/admin.tsx` con `requireAuth` en loader + `<Outlet />`.
6. **Layout auth**: `app/routes/_auth.tsx` con guard inverso (solo invitados).
7. **Login/logout**: `_auth.login.tsx`, `logout.tsx`.
8. **Migrar cada página**:
   - Mover frontmatter → `loader`.
   - `client:load` → componente normal.
   - `Astro.callAction(x)` → import directo desde `.server.ts`.
   - Formularios → `<Form method="post">` + `action`.
9. **Eliminar deletes/acciones ad-hoc**: refactor con `useFetcher`.
10. **Auditar stores**: eliminar los que cachean datos del servidor.
11. **ErrorBoundary** en `root.tsx` y en rutas sensibles.
12. **Meta** en rutas importantes.
13. **Deploy**: Node adapter (tienes `@astrojs/node` → sigue siendo Node, fácil).

---

## 21. Trampas frecuentes

- **No puedes importar `.server.ts` desde un componente**: el bundler bloquea — así garantiza que los secrets se quedan en backend.
- **`useLoaderData` vs `useRouteLoaderData`**: el primero lee el loader **de la ruta actual**; el segundo lee **de una ruta específica** del árbol (útil en hijos).
- **Revalidación agresiva**: después de cada `action`, todos los loaders activos corren. Si uno es pesado, exporta `shouldRevalidate` para saltarlo cuando no cambian sus inputs.
- **Tipos generados**: `.react-router/types/` se crea en `dev`/`typecheck`. Si TS se queja, corre `npm run typecheck`.
- **No `<a href>` para navegación interna**: usa `<Link to="...">` o `<NavLink>` para que no recargue la página.
- **`params` siempre son strings**: `params.id` es `string | undefined`. Si necesitas número, convierte.
- **`request.formData()` solo una vez**: no puedes leerlo dos veces. Guarda en variable.
- **No confundir `loader` de una ruta y `loader` del layout**: cada uno es independiente.

---

## 22. Deployment

Tu stack actual usa `@astrojs/node`. RR v7 tiene adapter de Node directo:

```ts
// react-router.config.ts
import type { Config } from '@react-router/dev/config';

export default {
  ssr: true,
  // deploy como Node: no hace falta adapter extra
} satisfies Config;
```

```bash
npm run build
node build/server/index.js
```

También hay adapters oficiales para Cloudflare, Vercel, Netlify, AWS Lambda, etc. — todos file-based con el mismo código.

---

## 23. TL;DR mental

- **`loader`** = tu `---` frontmatter.
- **`action`** = tu mutación (reemplaza `Astro.callAction` + `<form action>`).
- **`<Outlet />`** = tu `<slot />`.
- **`requireAuth` en loader** = tu `middleware.ts`.
- **`useRouteLoaderData`** = tu "provider de user", sin Context.
- **`.server.ts`** = frontera servidor/cliente garantizada por el bundler.
- **`searchParams`** + **`sessión`** sustituyen al 80% de tus stores.
- **Todo es React hidratado** → adiós bugs raros de islands.

Ganas: tipado end-to-end automático, hot reload de datos tras mutaciones, errores localizados por ruta, y un único modelo mental para toda la app.

---

## 24. Estado de la migración

Branch activa: **`migration_rr7`**. La migración se hizo **in-place** dentro de `jb-store-client-draft/`: `src/`, `astro.config.mjs`, `.astro/` y `src/env.d.ts` están eliminados; toda la app vive en `app/`.

### Commits de referencia

| Commit | Fase | Qué entró |
|---|---|---|
| `b62535c` | Fase 1 | Scaffold RR v7, sesión/auth, login/register/logout, layout admin protegido, listado de familias, Google OAuth. |
| `bbb8ccf` | Fase 2 | CRUD de familias (create/edit + 404 real + flash toasts), layout público `_app` con Header/Footer auth-aware. |

### Mapa Astro → RR v7 (archivo por archivo)

| Origen (Astro) | Destino (RR v7) | Estado |
|---|---|---|
| `src/pages/index.astro` | `app/routes/_app._index.tsx` (bajo layout público) | ✅ |
| `src/pages/login.astro` + `components/login/Login.astro` + `actions/auth/login.action.ts` | `app/routes/_auth.login.tsx` | ✅ |
| `src/pages/register.astro` + `components/register/RegisterForm.astro` + `actions/auth/register.action.ts` | `app/routes/_auth.register.tsx` | ✅ |
| `src/pages/api/auth/logout.ts` + `actions/auth/logout.action.ts` | `app/routes/logout.tsx` | ✅ |
| `src/pages/api/auth/google/index.ts` | `app/routes/api.auth.google._index.tsx` | ✅ (scaffold; backend Google no configurado) |
| `src/pages/api/auth/google/callback.ts` | `app/routes/api.auth.google.callback.tsx` | ✅ (scaffold) |
| `src/pages/admin/index.astro` | `app/routes/admin._index.tsx` | ✅ |
| `src/pages/admin/families/index.astro` + `actions/admin/families/get-families.action.ts` | `app/routes/admin.families._index.tsx` + `server/api.server.ts::getFamilies` | ✅ |
| `src/pages/admin/families/create.astro` + `actions/admin/families/create-family.action.ts` | `app/routes/admin.families.create.tsx` + `server/api.server.ts::createFamily` | ✅ |
| `src/pages/admin/families/[id].astro` + `actions/admin/families/{get-family,update-family}.action.ts` | `app/routes/admin.families.$id.tsx` + `server/api.server.ts::{getFamily,updateFamily}` | ✅ |
| `src/pages/admin/families/_components/FamilyForm.astro` | `app/components/admin/families/FamilyForm.tsx` | ✅ (React reutilizable para create/edit) |
| `src/layouts/AppLayout.astro` | `app/routes/_app.tsx` + `components/shared/{Header,Footer}.tsx` | ✅ |
| `src/layouts/AuthLayout.astro` | `app/routes/_auth.tsx` | ✅ |
| `src/layouts/AdminLayout.astro` | `app/routes/admin.tsx` | ✅ |
| `src/middleware.ts` | `requireAuth()` en `app/server/auth.server.ts` (llamado desde loaders) | ✅ (ya no hay middleware global) |
| `src/components/shared/Header.astro` | `app/components/shared/Header.tsx` | ✅ (auth-aware, logout via `<Form>`) |
| `src/components/shared/Footer.astro` | `app/components/shared/Footer.tsx` | ✅ |
| `src/components/shared/Breadcrumbs.astro` | `app/components/shared/Breadcrumbs.tsx` (`useMatches()` + `handle.breadcrumb`) | ✅ |
| `src/components/shared/Input.astro` | `app/components/shared/Input.tsx` | ✅ (React, acepta `icon` como `ComponentType<SVGProps>`) |
| `src/icons/Google.astro` | `app/components/icons/GoogleIcon.tsx` | ✅ |
| `src/icons/Deliveries.astro` | `public/assets/deliveries.svg` | ✅ (servido como asset, consumido con `<img>`) |
| `src/icons/{User,Password,Dashboard,Cart,ShoppingApp}.astro` | `lucide-react` (`User`, `Lock`, `LayoutDashboard`, `ShoppingCart`…) | ✅ (reemplazados por iconos de lucide-react) |
| `src/components/admin/Sidebar.astro` | `app/components/admin/Sidebar.tsx` | ✅ (React + nanostores) |
| `src/components/admin/Navbar.astro` | `app/components/admin/Navbar.tsx` | ✅ |
| `src/components/react/{Table,Pagination,AppToaster}.tsx` | `app/components/{Table,Pagination,AppToaster}.tsx` | ✅ (AppToaster reescrito con **sileo**) |
| `src/components/react/CrudPageDetail.tsx` | — | ❌ eliminado (reemplazado por loader + `useSearchParams` en la ruta) |
| `src/components/ui/{button,dialog}.tsx` | `app/components/ui/{button,dialog}.tsx` | ✅ |
| `src/components/CrudDialog.tsx` | — | ❌ no se usa en fase 1/2 (create/edit son rutas dedicadas) |
| `src/services/api.ts` | `app/lib/apiClient.ts` (`axios`) + `app/lib/apiClient.ts::toApiError` | ✅ |
| `src/lib/utils.ts` | `app/lib/utils.ts` | ✅ |
| `src/stores/sidebar.store.ts` | `app/stores/sidebar.store.ts` | ✅ |
| `src/stores/modals.store.ts` + `context/{ModalContext,ModalsRender}.tsx` + `config/modalsRegistry.ts` + `screens/families/FamilyForm.tsx` | — | ❌ **no migrados** (sistema de modales global; innecesario porque las pantallas CRUD ahora son rutas) |
| `src/i18n/**` | `app/i18n/**` | ✅ (copia directa) |
| `src/types/{api,family}.ts`, `src/types/user.d.ts` | `app/types/{api,family,user}.ts` | ✅ |
| `src/env.d.ts` (Astro locals) | — | ❌ eliminado (tipos cubiertos por `~/types/route.ts`) |
| `src/styles/global.css` | `app/styles/global.css` | ✅ |
| `astro.config.mjs` | `react-router.config.ts` + `vite.config.ts` | ✅ |
| `src/middleware.ts` (session seeding en `locals`) | `_app.tsx` loader resuelve `user`/`isAdmin` por request | ✅ |
| `.env` `PUBLIC_LARAVEL_API_URL` | `.env` `API_URL` + `SESSION_SECRET` | ✅ |

### Arquitectura cubierta (checklist)

- [x] SSR con React Router v7 + Vite + `@tailwindcss/vite`.
- [x] File-based routing vía `@react-router/fs-routes` (`app/routes.ts` llama `flatRoutes()`).
- [x] Sesión con `createCookieSessionStorage` en cookie `auth_token` (compat backend Laravel) y `SESSION_SECRET` obligatorio.
- [x] Guardas: `requireAuth` en loader del layout protegido + guard inverso (`getOptionalAuth`) en `_auth.tsx`.
- [x] Loaders server-side con token (`apiClient(token)`), errores normalizados vía `toApiError` y convertidos a `Response` cuando corresponde (p. ej. 404 en `admin.families.$id`).
- [x] Forms con `<Form method="post">` + `action` + `useNavigation` + `useActionData`; validación server con mensajes al usuario.
- [x] Flash toasts via `session.flash('toast', {...})` consumidos en loader del layout y renderizados con **sileo** en `AppToaster`.
- [x] Breadcrumbs dinámicos con `useMatches()` + `handle.breadcrumb`.
- [x] Paginación server-driven vía `useSearchParams()` (el loader re-corre al cambiar `?page=`).
- [x] ErrorBoundary global en `root.tsx` + `throw new Response(..., 404)` por ruta.
- [x] Header público auth-aware (links condicionales Admin / Iniciar sesión / Cerrar sesión).
- [x] Build y typecheck limpios (`bun run build`, `bun run typecheck`).

### Rutas activas hoy

```
/                             _app._index.tsx     (home público)
/cart                         _app.cart.tsx       (placeholder con data fake)
/login                        _auth.login.tsx
/register                     _auth.register.tsx
/logout (POST)                logout.tsx
/admin                        admin._index.tsx    (protegida)
/admin/families               admin.families._index.tsx
/admin/families/create        admin.families.create.tsx
/admin/families/:id           admin.families.$id.tsx
/api/auth/google              api.auth.google._index.tsx
/api/auth/google/callback     api.auth.google.callback.tsx
```

### Features futuras

Auth avanzado que no existía en Astro y conviene agregar cuando el core esté estable:

- **Password reset / forgot password** — endpoint backend + rutas `_auth.forgot.tsx` y `_auth.reset.$token.tsx`.
- **Email verification** — flujo con token al registrarse.
- **Profile / cambio de contraseña** — ruta protegida bajo `admin` (o una pathless `_account`) para que el user actualice sus datos.
- **Google OAuth real** — hoy está scaffoldeado (`/api/auth/google*`) pero el backend Laravel no tiene `client_id` configurado, así que no completa el flujo.

### Pendiente (fases siguientes)

- **Delete de familias**: UI (botón en la tabla o en edit) + endpoint backend (hoy no existe).
- **`/products` y `/cart`**: hoy el Header linkea a ellas pero no están implementadas (van a dar 404).
- **Otros recursos CRUD** si se suman (categorías, productos, pedidos) — el patrón ya está establecido.
- **Google OAuth** realmente funcional: el cliente está scaffoldeado pero el backend no tiene `client_id` configurado (no es bloqueo del cliente).
- **Modales globales**: dejados fuera a propósito. Si en el futuro hace falta un modal compartido (confirmación de delete, búsqueda global, etc.), reintroducir una versión simple con `ModalContext` + `ModalsRender` sobre nanostores.
- **Tests**: no hay tests automatizados todavía (ni los había en Astro).
- **Merge de `migration_rr7` → `main`** cuando la cobertura funcional sea total y el equipo valide el comportamiento.

