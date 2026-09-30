# Stack de `jb-store-client`

## Qué usamos

| Capa | Tecnología | Rol |
|---|---|---|
| Framework | **React Router 7** (framework mode, `ssr: true`) | Rutas, SSR, loaders/actions, servidor BFF |
| UI | React 19 + Tailwind 4 + shadcn/ui | Componentes |
| Formularios | `<Form>` nativo (tienda) / react-hook-form (admin) | Estado del form en el cliente |
| Estado de UI | Zustand | Modales, UI global. **Nunca datos del servidor** |
| HTTP | axios (solo en `*.server.ts`) | Llamadas a Laravel |
| Backend | Laravel + Sanctum | API, validación, reglas de negocio |

```
Navegador ──cookie de sesión──▶ Servidor RR7 (Node) ──Bearer token──▶ Laravel API
            ◀──HTML + datos────                     ◀──JSON──────────
```

El servidor de React Router actúa como **BFF (Backend For Frontend)**: el token de Sanctum vive
en una cookie de sesión `httpOnly` (`session.server.ts`) y **nunca llega al JavaScript del navegador**.

---

## React Router 7 (framework) vs React "directo" (SPA con Vite)

"React directo" = SPA: Vite + React + un router del lado del cliente + axios/TanStack Query +
Formik/RHF. Todo corre en el navegador y habla directo con Laravel.

### Ventajas de React Router 7 para un e-commerce

**1. SEO y previews para redes (la más importante en una tienda).**
Con SSR, `/products/123` llega a Google, WhatsApp o Facebook como HTML con nombre, precio,
imagen y los `meta` de la ruta (`export const meta`). En una SPA el HTML inicial es un
`<div id="root">` vacío. Google puede ejecutar JS, pero es más lento y menos confiable, y **los
scrapers de WhatsApp, Facebook y X NO ejecutan JS**: el link compartido de un producto sale sin
imagen ni precio. En una tienda eso es plata perdida.

**2. Seguridad del token.**
En una SPA el token se guarda en `localStorage` o en memoria: cualquier XSS (una dependencia
comprometida, un script de analytics) lo puede leer. Con el BFF el navegador solo tiene una cookie
`httpOnly` que JS no puede leer. El token de Laravel queda en el servidor.

**3. Carga inicial más rápida (Core Web Vitals).**
SPA: descargar JS → ejecutar → pedir datos → pintar (cascada de spinners). RR7: el servidor ya
trae los datos y devuelve HTML pintado. Mejor LCP, que Google usa para rankear y que impacta
directo en la conversión.

**4. Sin cascadas de requests.**
Los `loader` de rutas anidadas (`_app` → `_app.products.$id`) corren **en paralelo** antes de
renderizar. En una SPA, el típico `useEffect(fetch)` en el padre y después en el hijo es una
cascada.

**5. Mutaciones sin boilerplate.**
`action` + `<Form>`/`useFetcher` resuelven el envío, el estado pending, los errores y **la
revalidación automática** de los loaders. En una SPA eso lo armás vos: TanStack Query,
`invalidateQueries`, estados de loading manuales...

**6. Progressive enhancement.**
Un `<Form>` nativo funciona aunque el JS no haya terminado de cargar (3G, gama baja). Login,
carrito y checkout siguen andando.

**7. Code splitting por ruta, gratis.**
Cada ruta es su propio chunk. El admin (RHF, drag & drop, tablas) no se descarga en la tienda.

**8. Una sola convención.**
Rutas por archivo, `loader`/`action`/`meta`/`ErrorBoundary` por ruta y tipos generados
(`./+types/...`). Menos decisiones por pantalla, código más uniforme entre devs.

### Desventajas de React Router 7 (hay que conocerlas)

| Desventaja | Mitigación |
|---|---|
| Necesita un **servidor Node** (hosting más caro que un CDN estático) | Fly.io, Railway, un VPS o un contenedor junto a Laravel. |
| **Doble salto de red** (navegador → RR → Laravel) | Desplegar RR y Laravel en la misma red/región: el salto interno es de ms. |
| Modelo mental **servidor/cliente**: `window` no existe en el servidor, errores de hidratación | Todo lo del navegador va en `useEffect`/`clientLoader`; lo del servidor, en `*.server.ts`. |
| Algunas librerías no son SSR-friendly | Importarlas lazy en el cliente. |
| Curva de aprendizaje (loaders, actions, revalidación) | Esta doc + `react-router-forms-modals.md`. |

### Cuándo SÍ elegiría React directo (SPA)

- App **detrás de login** donde el SEO no importa (un panel interno o un CRM).
- Hosting **solo estático** (S3/CDN) sin posibilidad de correr Node.
- Equipo que no puede asumir el modelo servidor/cliente.

Ninguno aplica a la tienda. El **admin** sí podría ser una SPA, pero dentro de la misma app RR7
ya se beneficia del BFF (token seguro) y del code splitting, así que separarlo no suma.

---

## Formularios: por qué no Formik

- **Formik:** mantenimiento muy bajo hace años, inputs controlados (re-render en cada tecla). No.
- **react-hook-form:** inputs no controlados, `useFieldArray` y `setError`. Ya está instalado. Lo usamos en el admin.
- **`<Form>` nativo de RR7:** cero dependencias y funciona sin JS. Lo usamos en la tienda.

React Router resuelve el **transporte** (enviar, pending, errores del servidor, revalidar).
RHF resuelve el **estado del form en el cliente**. Se complementan: no compiten.

Detalle de patrones: [`react-router-forms-modals.md`](./react-router-forms-modals.md).

---

## Veredicto

Para un e-commerce, **React Router 7 en framework mode** es la elección correcta. Un SPA no
resuelve bien el SEO del catálogo, las previews al compartir, la carga inicial ni la seguridad del
token, y para cubrir mutaciones y cache termina necesitando más librerías (TanStack Query,
Formik).
