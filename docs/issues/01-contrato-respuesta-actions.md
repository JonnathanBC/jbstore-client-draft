# Unificar contrato de respuesta de actions

## Problema

Actualmente hay tres patrones distintos para devolver errores desde una action, dependiendo del archivo:

**Patrón A** — `families.$id.tsx`
```ts
return { toast: { kind: 'error', message: result.error.message } }
```

**Patrón B** — `products.$id.tsx`
```ts
return data({ error: result.error.message, errors: [] }, { status: result.error.status })
```

**Patrón C** — `families.$id.tsx` (otro caso en el mismo archivo)
```ts
return { error: 'ID inválido' }
```

Esto hace que cada componente maneje el error de forma distinta y sea imposible tener un handler centralizado.

## Solución esperada

Definir un único tipo de respuesta de error para todas las actions:

```ts
// types/action.ts
export interface ActionResponse {
  ok?: boolean
  error?: string
  errors?: Record<string, string[]>
}
```

Y siempre retornar con `data()` y el status HTTP correcto:

```ts
return data<ActionResponse>(
  { error: result.error.message, errors: result.error.errors ?? {} },
  { status: result.error.status },
)
```

## Archivos afectados

- `app/routes/admin.families.$id.tsx`
- `app/routes/admin.families.create.tsx`
- `app/routes/admin.categories.$id.tsx`
- `app/routes/admin.categories.create.tsx`
- `app/routes/admin.subcategories.$id.tsx`
- `app/routes/admin.subcategories.create.tsx`
- `app/routes/admin.products.$id.tsx`
- `app/routes/admin.products.create.tsx`
