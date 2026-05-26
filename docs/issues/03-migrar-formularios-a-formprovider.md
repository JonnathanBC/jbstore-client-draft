# Migrar formularios viejos a FormProvider + FieldError

## Problema

Los formularios anteriores al nuevo sistema de `FormProvider` + `Field` + `FieldError` reciben los errores como prop `validationErrors` y renderizan los mensajes de error de forma manual e inline:

```tsx
{validationErrors?.name?.[0] && (
  <p className="mt-1 text-sm text-red-500">
    {validationErrors.name[0]}
  </p>
)}
```

Este patrón convive con el nuevo sistema, genera duplicación y hace que cada formulario sea responsable de mostrar sus propios errores.

## Solución esperada

Migrar cada formulario para que use `FormProvider` como wrapper y `Field` para cada input. Los errores del servidor se pasan via `actionData` al `FormProvider` y `FieldError` (incluido dentro de `Field`) los muestra automáticamente. No queda ningún manejo manual de errores en el JSX.

```tsx
// Antes
<ProductForm validationErrors={actionData?.errors} />

// Después
<ProductForm actionData={actionData} />
```

```tsx
// Dentro del form
<FormProvider actionData={actionData}>
  <Field name="name" label="Nombre" />
  <Field name="subcategory_id" label="Subcategoría" component={AsyncSelect} source="/resources/subcategories" />
</FormProvider>
```

## Archivos afectados

- `app/components/admin/categories/CategoryForm.tsx`
- `app/components/admin/families/FamilyForm.tsx`
- `app/components/admin/subcategories/SubCategoryForm.tsx`
- `app/products/ProductForm.tsx`
- `app/routes/admin.products.create.tsx` — pasa `validationErrors={actionData?.errors}`, cambiar a `actionData={actionData}`
- `app/routes/admin.categories.$id.tsx` — ídem
- `app/routes/admin.subcategories.$id.tsx` — ídem
