# Agregar status codes HTTP en returns de actions

## Problema

Varios returns de actions devuelven objetos planos sin envolverlos en `data()` con el status HTTP correspondiente. Esto hace que el cliente reciba un **200 OK** aunque haya un error, lo que rompe el contrato HTTP y puede confundir a herramientas de monitoreo, proxies y al propio React Router.

### Casos concretos

**`admin.families.$id.tsx` — línea 56**
```ts
if (!Number.isFinite(id) || id < 1) return { error: 'ID inválido' }
```

**`admin.families.$id.tsx` — línea 64**
```ts
if ('error' in result) return { error: result.error.message }
```

**`admin.products.$id.tsx` — línea 61**
```ts
if (!Number.isFinite(id) || id < 1) return { error: 'ID inválido', errors: [] }
```

## Solución esperada

Todos los returns de error deben ir con `data()` y su status correcto:

```ts
// ID inválido
return data({ error: 'ID inválido', errors: {} }, { status: 400 })

// Error de la API
return data(
  { error: result.error.message, errors: result.error.errors ?? {} },
  { status: result.error.status },
)
```

## Archivos afectados

- `app/routes/admin.families.$id.tsx`
- `app/routes/admin.products.$id.tsx`

> Nota: esta issue está relacionada con **#01** — al unificar el contrato de respuesta, este problema queda resuelto en el mismo paso.
