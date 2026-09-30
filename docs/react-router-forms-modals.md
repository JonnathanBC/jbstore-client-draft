# Formularios, modales CRUD y manejo de errores en React Router 7

Guía de convenciones para `jb-store-client`. Objetivo: **un solo patrón** para crear, editar
y eliminar recursos, reutilizable en el admin y en la tienda.

---

## 0. TL;DR — las reglas

1. **Laravel es la fuente de verdad de la validación.** El cliente valida para UX; el backend decide.
2. **`<Form>` para páginas, `useFetcher` para todo lo que NO navega** (modales, acciones de fila, toggles).
3. **Toda action devuelve la misma forma**: `ActionResult` (`{ ok: true, ... } | { ok: false, ... }`).
4. **Errores esperados se RETORNAN** (422, reglas de negocio). **Errores inesperados se LANZAN** (404, 500) → `ErrorBoundary`. **401 → redirect a login.**
5. **Los datos del servidor viven en loaders**, nunca en Zustand. Zustand solo para estado de UI (qué modal está abierto).
6. **Un modal CRUD = `useModalForm` + `<CrudModal>` + un componente `*Fields` presentacional.**
7. **El HTTP method dice la operación** (`POST` / `PATCH` / `DELETE`), no un campo `intent`, cuando el endpoint es un recurso REST.

---

## 1. Estado actual (y qué hay que corregir)

Ya existe una base: `modal.store.ts` (Zustand) + `modalRegistry.ts` + `ModalRenderer.tsx` +
`DialogCrud.tsx` + `FormProvider.tsx` (react-hook-form). Está bien encaminado, pero:

| Problema | Dónde | Por qué importa |
|---|---|---|
| `lazy()` se llama **dentro del render** | `ModalRenderer.tsx` | Cada render crea un *tipo de componente nuevo* → React desmonta y remonta el modal → se pierde el estado del form. `lazy` va a nivel de módulo. |
| `key` con `JSON.stringify(props)` y `close` por índice | `ModalRenderer.tsx` | Dos modales iguales colisionan; cerrar por índice rompe si el array cambió. Usar un `id` incremental. |
| `<form>` envuelve a `DialogContent`, que hace **portal** | `DialogCrud.tsx` | En el DOM los inputs quedan FUERA del `<form>` → Enter no envía. Por eso hubo que usar `onClick={handleSubmit}`. El `<form>` va **dentro** del contenido. |
| Cada modal repite: `setError` por campo, toast, cerrar | `OptionProductModal.tsx` | Lógica duplicada → la encapsula `useModalForm`. |
| Props del modal sin tipar | `modal.store.ts` | `open('productOption', { cualquierCosa })` compila. |
| `'error' in result` sobre respuesta 204 | `deleteAddress` | Ver §6: **lanza `TypeError`**. |

---

## 2. Arquitectura propuesta

```
app/
├── lib/
│   ├── apiClient.ts          # (existe) axios + toApiError
│   ├── result.ts             # Result<T> para la capa server + attempt()
│   ├── action-result.ts      # ActionResult + ok() / fail() para actions
│   └── crud.ts               # whitelist de recursos CRUD + crudUrl()
├── routes/
│   └── resources.crud.$resource.($id).ts   # resource route genérica (proxy a Laravel)
├── hooks/
│   └── useModalForm.ts       # RHF + fetchers + errores + toast + cerrar
├── components/modals/
│   ├── CrudModal.tsx         # header: título | Eliminar | Guardar | X
│   ├── ModalRenderer.tsx     # (corregido)
│   └── ModalContext.tsx      # (existe)
├── store/modal.store.ts      # (corregido) + useModalsNavigator
├── config/modalRegistry.ts   # (corregido) lazy a nivel de módulo
└── addresses/components/
    ├── AddressFields.tsx     # presentacional: solo campos
    └── AddressModal.tsx      # container: une recurso + fields
```

Flujo de "Guardar":

```
<CrudModal> ──submit──▶ useModalForm.onSave (RHF valida)
                        │
                        ▼
      fetcher.submit(json, { method: POST|PATCH, action: /resources/crud/addresses/5 })
                        │
                        ▼
      resources.crud.$resource.($id).ts  (servidor RR: token, whitelist)
                        │
                        ▼
      Laravel PATCH /api/addresses/5  ──▶ ActionResult
                        │
                        ▼
      useModalForm: ok → toast + cerrar │ 422 → setError por campo │ otro → toast.error
                        │
                        ▼
      RR revalida loaders automáticamente → la lista se actualiza sola
```

> **Por qué pasar por una resource route y no llamar a Laravel desde el navegador:** el token
> vive en la cookie de sesión del servidor RR (`requireAuth`). El navegador nunca lo ve. Además,
> después de una action React Router **revalida los loaders solo** — no hay que refrescar a mano.

---

## 3. Capa server: `Result<T>` en vez de `T | { error }`

`T | { error }` depende de que `T` no tenga una propiedad `error` y **explota si `T` no es un
objeto** (un 204 devuelve `''`). Una unión discriminada es explícita y elimina el try/catch repetido.

```ts
// app/lib/result.ts
import type { AxiosResponse } from 'axios'
import { toApiError, type ApiError } from '~/lib/apiClient'

export type Result<T> = { ok: true; data: T } | { ok: false; error: ApiError }

export async function attempt<T>(
  request: () => Promise<AxiosResponse<T>>,
): Promise<Result<T>> {
  try {
    const { data } = await request()
    return { ok: true, data }
  } catch (err) {
    return { ok: false, error: toApiError(err) }
  }
}
```

```ts
// app/server/addresses.server.ts
export const getAddresses = (token: string) =>
  attempt(() => apiClient(token).get<Address[]>('/api/addresses'))

export const deleteAddress = (id: number, token: string) =>
  attempt(() => apiClient(token).delete<void>(`/api/addresses/${id}`))
```

---

## 4. Contrato de las actions: `ActionResult`

Una sola forma para TODO el sistema. El frontend nunca adivina.

```ts
// app/lib/action-result.ts
import { data, redirect } from 'react-router'
import type { ApiError } from '~/lib/apiClient'

export type ActionOk<T = unknown> = { ok: true; message?: string; data?: T }
export type ActionFail = {
  ok: false
  message: string
  errors?: Record<string, string[]> // errores por campo (422 de Laravel)
}
export type ActionResult<T = unknown> = ActionOk<T> | ActionFail

export const ok = <T>(payload?: T, message?: string): ActionOk<T> => ({
  ok: true,
  data: payload,
  message,
})

/** Error esperado → se RETORNA con el status real (RR no revalida loaders si status >= 400). */
export function fail(error: ApiError, fallback = 'Ocurrió un error inesperado') {
  if (error.status === 401) throw redirect('/login')

  return data<ActionFail>(
    { ok: false, message: error.message || fallback, errors: error.errors },
    { status: error.status },
  )
}

/** Error de input del propio cliente (id inválido, etc.). */
export const invalid = (message: string) =>
  data<ActionFail>({ ok: false, message }, { status: 400 })

export function parseId(value: FormDataEntryValue | string | null | undefined) {
  const id = Number(value)
  return Number.isInteger(id) && id > 0 ? id : null
}
```

### ¿Retornar o lanzar?

| Situación | Qué hacer | Resultado |
|---|---|---|
| 422 validación, regla de negocio ("stock insuficiente") | `return fail(...)` | El form muestra el error, el usuario corrige. |
| 401 sesión vencida | `throw redirect('/login')` | Va a login. |
| 404 en un **loader** (el recurso de la página no existe) | `throw data('No encontrado', { status: 404 })` | `ErrorBoundary` de la ruta. |
| 500 / bug | dejar que lance | `ErrorBoundary`. |

Regla mental: **¿el usuario puede hacer algo para arreglarlo en esta misma pantalla?** → retornar.
Si no → lanzar.

Usá `data(valor, { status })` en vez de un objeto plano: el status HTTP correcto hace que React
Router **no revalide los loaders** cuando la action falló (no tiene sentido recargar la lista si
nada cambió).

---

## 5. Resource route CRUD genérica

Una whitelist de recursos. **Nunca** proxies un path arbitrario que venga del cliente
(`/resources/crud/../../api/admin/users` = agujero de seguridad).

```ts
// app/lib/crud.ts  (sin secretos: se importa desde cliente y servidor)
export const CRUD_RESOURCES = {
  addresses: {
    endpoint: '/api/addresses',
    messages: {
      created: 'Dirección creada',
      updated: 'Dirección actualizada',
      deleted: 'Dirección eliminada',
    },
  },
  // categories: { endpoint: '/api/categories', messages: { ... } },
} as const

export type CrudResource = keyof typeof CRUD_RESOURCES

export const isCrudResource = (value?: string): value is CrudResource =>
  !!value && Object.hasOwn(CRUD_RESOURCES, value)

export const crudUrl = (resource: CrudResource, id?: number | string | null) =>
  id == null ? `/resources/crud/${resource}` : `/resources/crud/${resource}/${id}`
```

```ts
// app/routes/resources.crud.$resource.($id).ts
import { data } from 'react-router'
import type { Route } from './+types/resources.crud.$resource.($id)'
import { apiClient } from '~/lib/apiClient'
import { attempt } from '~/lib/result'
import { fail, ok } from '~/lib/action-result'
import { CRUD_RESOURCES, isCrudResource } from '~/lib/crud'
import { requireAuth } from '~/server/auth.server'

function resolve(params: Route.LoaderArgs['params']) {
  const { resource, id } = params
  if (!isCrudResource(resource)) throw data('Recurso no encontrado', { status: 404 })
  if (id !== undefined && !/^\d+$/.test(id)) throw data('Id inválido', { status: 400 })

  const config = CRUD_RESOURCES[resource]
  return { config, url: id ? `${config.endpoint}/${id}` : config.endpoint }
}

// GET /resources/crud/addresses/5 → precargar un modal de edición por id
export async function loader({ request, params }: Route.LoaderArgs) {
  const { token } = await requireAuth(request)
  const { url } = resolve(params)

  const result = await attempt(() => apiClient(token).get(url))
  return result.ok ? ok(result.data) : fail(result.error)
}

const MESSAGE_BY_METHOD = { POST: 'created', PATCH: 'updated', DELETE: 'deleted' } as const

export async function action({ request, params }: Route.ActionArgs) {
  const { token } = await requireAuth(request)
  const { config, url } = resolve(params)

  const method = request.method as keyof typeof MESSAGE_BY_METHOD
  if (!(method in MESSAGE_BY_METHOD)) throw data('Método no permitido', { status: 405 })
  // POST va a la colección; PATCH/DELETE a un id concreto
  if ((method === 'POST') === Boolean(params.id)) throw data('Ruta inválida', { status: 400 })

  const body = method === 'DELETE' ? undefined : await request.json()
  const result = await attempt(() => apiClient(token).request({ url, method, data: body }))

  return result.ok
    ? ok(result.data, config.messages[MESSAGE_BY_METHOD[method]])
    : fail(result.error)
}
```

> Si un recurso es solo de admin, agregá `admin: true` en `CRUD_RESOURCES` y chequealo en
> `resolve` con un `requireAdmin`. Laravel igual debe autorizar: esto es defensa en profundidad,
> no la barrera principal.

---

## 6. Revisión: tu `case 'delete'`

```ts
case 'delete': {
  const id = Number(form.get('id'))
  if (!Number.isInteger(id) || id <= 0) return { error: 'Dirección inválida' }

  const result = await deleteAddress(id, auth.token)
  if ('error' in result) return { error: result.error.message || '...' }

  return { success: 'Dirección eliminada' }
}
```

**Lo que está BIEN:**
- Validás el `id` antes de pegarle al backend.
- Los errores esperados se **retornan**, no se lanzan. Correcto.
- Mensaje de fallback si Laravel no manda `message`.

**Lo que hay que cambiar:**

1. **Bug real:** `destroy` en Laravel responde `204 No Content`. Axios deja `data = ''`, y
   `'error' in ''` **lanza `TypeError`** (el operador `in` no acepta primitivos). Resultado: la
   dirección SÍ se borró, pero la action explota y el usuario ve el `ErrorBoundary`.
   `deleteAddress` además está tipada como `Promise<Address>`, cosa que es falsa. → `Result<T>` (§3) lo resuelve.
2. **Sin status HTTP:** devolvés 200 incluso cuando falló. → `data(..., { status })`.
3. **Forma distinta en cada action** (`{ error }`, `{ success }`, `{ fieldErrors }`, `{ ok, errors }`
   en `OptionProductModal`...). → `ActionResult` para todo.
4. **401 no redirige.**

**Refactor:**

```ts
case 'delete': {
  const id = parseId(form.get('id'))
  if (!id) return invalid('Dirección inválida')

  const result = await deleteAddress(id, auth.token)
  if (!result.ok) return fail(result.error, 'Error al eliminar la dirección')

  return ok(null, 'Dirección eliminada')
}
```

---

## 7. Sistema de modales

### 7.1 Registry con `lazy` a nivel de módulo y props tipadas

```ts
// app/config/modalRegistry.ts
import { lazy } from 'react'

export const modalRegistry = {
  healthy: lazy(() => import('~/features/healthy/HealthyModal')),
  option: lazy(() => import('~/features/options/OptionForm')),
  productOption: lazy(() => import('~/products/options/OptionProductModal')),
  address: lazy(() => import('~/addresses/components/AddressModal')),
}

export type ModalKey = keyof typeof modalRegistry
export type ModalProps<K extends ModalKey> = React.ComponentProps<(typeof modalRegistry)[K]>
```

### 7.2 Store + `useModalsNavigator`

```ts
// app/store/modal.store.ts
import { create } from 'zustand'
import type { ModalKey, ModalProps } from '~/config/modalRegistry'

type ModalEntry = { id: number; key: ModalKey; props: Record<string, unknown> }

interface ModalStore {
  modals: ModalEntry[]
  open: <K extends ModalKey>(key: K, props?: ModalProps<K>) => void
  close: (id: number) => void
  closeAll: () => void
}

let sequence = 0

export const useModalStore = create<ModalStore>((set) => ({
  modals: [],
  open: (key, props) =>
    set((s) => ({ modals: [...s.modals, { id: ++sequence, key, props: props ?? {} }] })),
  close: (id) => set((s) => ({ modals: s.modals.filter((m) => m.id !== id) })),
  closeAll: () => set({ modals: [] }),
}))

/** API pública para abrir/cerrar modales desde cualquier componente. */
export const useModalsNavigator = () => ({
  open: useModalStore((s) => s.open),
  closeAll: useModalStore((s) => s.closeAll),
})
```

### 7.3 Renderer

```tsx
// app/components/modals/ModalRenderer.tsx
import { Suspense, useEffect, type ComponentType } from 'react'
import { useLocation } from 'react-router'
import { modalRegistry } from '~/config/modalRegistry'
import { useModalStore } from '~/store/modal.store'
import { ModalProvider } from './ModalContext'

export const ModalRenderer = () => {
  const modals = useModalStore((s) => s.modals)
  const close = useModalStore((s) => s.close)
  const closeAll = useModalStore((s) => s.closeAll)
  const { pathname } = useLocation()

  // El store sobrevive a la navegación: sin esto, un modal abierto te sigue a otra página
  useEffect(() => closeAll(), [pathname, closeAll])

  return modals.map(({ id, key, props }) => {
    const Component = modalRegistry[key] as ComponentType<Record<string, unknown>>

    return (
      <Suspense key={id} fallback={null}>
        <ModalProvider value={{ onClose: () => close(id) }}>
          <Component {...props} />
        </ModalProvider>
      </Suspense>
    )
  })
}
```

### 7.4 ¿Store o URL (`?modal=address&id=5`)?

| | Store (Zustand) | Search params |
|---|---|---|
| Modales apilados | ✅ | ❌ uno a la vez |
| Botón "atrás" cierra el modal | ❌ | ✅ |
| Recargar / compartir link mantiene el modal | ❌ | ✅ (necesita cargar por id) |
| Ensucia el historial | ❌ | ✅ cada apertura es una entrada |

**Decisión:** store para el admin (modales rápidos, apilables). Si algún día un modal tiene que ser
linkeable (ej. "ver pedido #123" desde un email), ese va por URL, y `useModalForm` ya soporta
cargar por id.

---

## 8. `useModalForm`: el corazón del CRUD

Encapsula: RHF + guardar (POST/PATCH según haya `id`) + eliminar + precarga por id + mapear
errores 422 a campos + toast + cerrar.

```ts
// app/hooks/useModalForm.ts
import { useEffect } from 'react'
import { useFetcher, type FetcherWithComponents, type SubmitTarget } from 'react-router'
import { useForm, type DefaultValues, type FieldValues, type Path, type UseFormReturn } from 'react-hook-form'
import { toast } from 'sonner'
import type { ActionResult } from '~/lib/action-result'
import { crudUrl, type CrudResource } from '~/lib/crud'
import { useModalContext } from '~/components/modals/ModalContext'

type Options<T extends FieldValues> = {
  resource: CrudResource
  /** Con id → edición (PATCH/DELETE). Sin id → alta (POST). */
  id?: number | null
  /** Valores iniciales para el alta (ej. country: 'EC'). */
  defaultValues?: DefaultValues<T>
  /** Registro ya disponible (de la lista). Si falta y hay id, se carga por id. */
  record?: Partial<T>
  onSuccess?: (result: ActionResult, operation: 'save' | 'delete') => void
}

export function useModalForm<T extends FieldValues>({
  resource,
  id,
  defaultValues,
  record,
  onSuccess,
}: Options<T>) {
  const { onClose } = useModalContext()
  const isEdit = id != null
  const action = crudUrl(resource, id)

  const methods = useForm<T>({
    defaultValues: { ...defaultValues, ...record } as DefaultValues<T>,
  })

  const saver = useFetcher<ActionResult>()
  const deleter = useFetcher<ActionResult>()
  const reader = useFetcher<ActionResult<T>>()

  // Precarga por id solo si no nos pasaron el registro (ej. modal abierto por URL)
  useEffect(() => {
    if (isEdit && !record) reader.load(action)
  }, [isEdit, record, action])

  useEffect(() => {
    if (reader.data?.ok && reader.data.data) {
      methods.reset({ ...defaultValues, ...reader.data.data } as T)
    }
  }, [reader.data])

  useFetcherResult(saver, methods, (r) => {
    onSuccess ? onSuccess(r, 'save') : onClose()
  })
  useFetcherResult(deleter, methods, (r) => {
    onSuccess ? onSuccess(r, 'delete') : onClose()
  })

  const onSave = methods.handleSubmit((values) => {
    saver.submit(values as SubmitTarget, {
      method: isEdit ? 'patch' : 'post',
      action,
      encType: 'application/json', // sin JSON.stringify manual para arrays/objetos anidados
    })
  })

  const onDelete = () => {
    if (!isEdit || !confirm('¿Eliminar este registro? No se puede deshacer.')) return
    deleter.submit(null, { method: 'delete', action })
  }

  const isSaving = saver.state !== 'idle'
  const isDeleting = deleter.state !== 'idle'
  const isLoading = reader.state === 'loading'

  return {
    methods,
    isEdit,
    onSave,
    onDelete,
    isSaving,
    isDeleting,
    isLoading,
    isBusy: isSaving || isDeleting || isLoading,
  }
}

function useFetcherResult<T extends FieldValues>(
  fetcher: FetcherWithComponents<ActionResult>,
  methods: UseFormReturn<T>,
  onOk: (result: ActionResult) => void,
) {
  useEffect(() => {
    const result = fetcher.data
    if (fetcher.state !== 'idle' || !result) return

    if (result.ok) {
      if (result.message) toast.success(result.message)
      onOk(result)
      return
    }

    methods.clearErrors()
    const fieldErrors = Object.entries(result.errors ?? {})
    fieldErrors.forEach(([field, [message]]) =>
      methods.setError(field as Path<T>, { message }),
    )
    // Si hay errores por campo ya se ven en el form; si no, toast
    if (fieldErrors.length === 0) toast.error(result.message)
  }, [fetcher.state, fetcher.data])
}

export type ModalFormController<T extends FieldValues> = ReturnType<typeof useModalForm<T>>
```

> **¿Por qué `useFetcher` y no `useSubmit`/`<Form>`?** `<Form>` y `useSubmit` **navegan**:
> cambian `useNavigation().state` de toda la página y comparten un único `actionData`. Un fetcher
> tiene su propio estado y su propia respuesta: podés tener dos modales y cinco botones de fila
> enviando a la vez sin pisarse.

---

## 9. `<CrudModal>`: la cáscara visual

```tsx
// app/components/modals/CrudModal.tsx
import { useId, type ReactNode } from 'react'
import { FormProvider, type FieldValues } from 'react-hook-form'
import { Save, Trash2, XIcon } from 'lucide-react'
import { Dialog, DialogClose, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import type { ModalFormController } from '~/hooks/useModalForm'
import { useModalContext } from './ModalContext'

type Props<T extends FieldValues> = {
  title: string
  form: ModalFormController<T>
  children: ReactNode
  className?: string
}

export function CrudModal<T extends FieldValues>({ title, form, children, className }: Props<T>) {
  const { onClose } = useModalContext()
  const formId = useId()

  return (
    <Dialog open onOpenChange={(open) => !open && !form.isBusy && onClose()}>
      <DialogContent showCloseButton={false} className={className ?? 'p-4 sm:max-w-lg xl:max-w-xl'}>
        <DialogHeader className="mb-4 flex-row items-center justify-between gap-0">
          <DialogTitle>{title}</DialogTitle>

          <div className="flex items-center gap-3">
            {form.isEdit && (
              <button type="button" className="btn btn-danger flex items-center gap-2"
                onClick={form.onDelete} disabled={form.isBusy}>
                <Trash2 className="size-4" />
                {form.isDeleting ? 'Eliminando...' : 'Eliminar'}
              </button>
            )}

            {/* form={formId}: el botón vive fuera del <form> pero lo envía igual */}
            <button type="submit" form={formId} className="btn btn-primary flex items-center gap-2"
              disabled={form.isBusy}>
              <Save className="size-4" />
              {form.isSaving ? 'Guardando...' : 'Guardar'}
            </button>

            <DialogClose disabled={form.isBusy}>
              <XIcon className="size-4 cursor-pointer hover:text-red-800" />
            </DialogClose>
          </div>
        </DialogHeader>

        <FormProvider {...form.methods}>
          {/* El <form> va DENTRO de DialogContent (que hace portal) → Enter envía */}
          <form id={formId} onSubmit={form.onSave} noValidate>
            <fieldset disabled={form.isBusy} className={form.isLoading ? 'animate-pulse' : ''}>
              {children}
            </fieldset>
          </form>
        </FormProvider>
      </DialogContent>
    </Dialog>
  )
}
```

`<fieldset disabled>` deshabilita todos los inputs de una sola vez mientras se guarda: evita
doble envío y ediciones a mitad de request, sin tocar cada campo.

---

## 10. Uso real: direcciones

### Fields (presentacional, reutilizable en modal y en página)

```tsx
// app/addresses/components/AddressFields.tsx
import { Field } from '~/components/inputs/Field'

export function AddressFields() {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <div><Field name="phone" label="Teléfono" obb autoComplete="tel" /></div>
      <div><Field name="address_line_1" label="Dirección principal" obb placeholder="Calle principal y número" /></div>
      <div><Field name="address_line_2" label="Complemento" placeholder="Edificio, departamento o piso" /></div>
      <div><Field name="city" label="Ciudad" obb /></div>
      <div><Field name="province" label="Provincia" obb /></div>
      <div><Field name="postal_code" label="Código postal" /></div>
      <div><Field name="country" label="País" obb maxLength={2} /></div>
      <div><Field name="reference" label="Referencia" placeholder="Cerca de..." /></div>
    </div>
  )
}
```

No sabe si es alta o edición, ni a dónde se envía. **Solo pinta campos.** Por eso se reutiliza.

### Modal (container)

```tsx
// app/addresses/components/AddressModal.tsx
import { CrudModal } from '~/components/modals/CrudModal'
import { useModalForm } from '~/hooks/useModalForm'
import type { Address, AddressInput } from '~/types/addresses'
import { AddressFields } from './AddressFields'

type Props = { id?: number; record?: Address }

export default function AddressModal({ id, record }: Props) {
  const form = useModalForm<AddressInput>({
    resource: 'addresses',
    id,
    record,
    defaultValues: { country: 'EC' },
  })

  return (
    <CrudModal title={id ? 'Editar dirección' : 'Nueva dirección'} form={form}>
      <AddressFields />
    </CrudModal>
  )
}
```

### Abrirlo

```tsx
const { open } = useModalsNavigator()

<button onClick={() => open('address', { id: address.id, record: address })}>Editar</button>
<button onClick={() => open('address')}>Añadir dirección</button>
```

Pasar `record` desde la lista evita un request extra (los datos ya están en memoria). Si se abre
solo con `id`, el hook lo carga desde el loader de la resource route.

**Agregar un CRUD nuevo = 1 entrada en `CRUD_RESOURCES` + 1 `*Fields` + 1 `*Modal` de ~15 líneas + 1 entrada en el registry.**

---

## 11. Acciones de fila (favorito, toggles) con UI optimista

Para acciones que no abren modal, un fetcher por fila con UI optimista:

```tsx
function DefaultStar({ address }: { address: Address }) {
  const fetcher = useFetcher<ActionResult>()
  // Mientras el request vuela, mostramos el valor que ESTAMOS enviando
  const isDefault = fetcher.formData ? true : address.is_default

  return (
    <fetcher.Form method="post">
      <input type="hidden" name="id" value={address.id} />
      <button name="intent" value="set-default"><Star className={cn({ 'fill-purple-400': isDefault })} /></button>
    </fetcher.Form>
  )
}
```

Acá sí conviene `intent`: `set-default` no es un verbo REST estándar sobre el recurso.

---

## 12. React Router 7 + RHF vs Formik

**Formik: no.** Tiene mantenimiento muy bajo hace años y `react-hook-form` (ya instalado) lo
supera en rendimiento (inputs no controlados, menos renders) y en ecosistema.

**¿React Router solo, sin librería?** Sí, y para formularios simples es lo MEJOR:

| Tipo de form | Herramienta | Por qué |
|---|---|---|
| Login, registro, checkout, dirección en la tienda | `<Form>` nativo + `action` | Funciona sin JS (progressive enhancement), cero dependencias, `useNavigation` para el loading. |
| Admin: modales, campos dinámicos (`features[]`), validación en vivo, dependencias entre campos | RHF + `useModalForm` | `useFieldArray`, `watch`, `setError`, estado dirty/touched. Hacer esto a mano es reinventar RHF. |

React Router **no es una librería de formularios**. Resuelve el *transporte* (enviar, estados
pending, revalidar, errores del servidor). RHF resuelve el *estado del form en el cliente*. Se
complementan, no compiten. Por eso el patrón es: **RHF para el estado, fetcher para el transporte,
action para hablar con Laravel.**

Opcional a futuro: `zod` para validar en el cliente con el mismo schema (`@hookform/resolvers`).
Nunca reemplaza la validación de Laravel.

---

## 13. Checklist de buenas prácticas RR7

- [ ] Toda llamada a Laravel vive en `*.server.ts` (nunca se bundlea al cliente).
- [ ] Loaders devuelven datos; actions devuelven `ActionResult`.
- [ ] `data(value, { status })` en errores: status HTTP real.
- [ ] `throw` para 404/500 en loaders; cada ruta importante tiene `ErrorBoundary` (`isRouteErrorResponse`).
- [ ] 401 → `throw redirect('/login')` centralizado en `fail()`.
- [ ] No refetchear a mano después de mutar: RR revalida los loaders solo.
- [ ] `useFetcher` para mutaciones sin navegación; `<Form>` para las que cambian de página.
- [ ] Loading: `useNavigation().state` para páginas, `fetcher.state` para fetchers.
- [ ] UI optimista con `fetcher.formData` en toggles.
- [ ] `defaultValue` (no controlado) + `key` para resetear un form nativo al cambiar de registro.
- [ ] Datos del servidor NUNCA en Zustand. Zustand = estado de UI.
- [ ] Resource routes con whitelist: nunca proxy de paths arbitrarios.
- [ ] `encType: 'application/json'` en `fetcher.submit` para payloads anidados.

---

## 14. Plan de migración sugerido

1. `lib/result.ts` + migrar `addresses.server.ts` (arregla el bug del 204).
2. `lib/action-result.ts` + migrar `_app.address.tsx` a `ActionResult`.
3. Corregir `modalRegistry` (lazy a nivel de módulo) y `ModalRenderer` (id en vez de índice).
4. `lib/crud.ts` + resource route genérica.
5. `useModalForm` + `CrudModal`. Primer caso: `AddressModal`.
6. Migrar `OptionProductModal` y borrar `DialogCrud` cuando nadie lo use.
