import { t } from '~/i18n'

interface ProductVariants {
  variants: {
    sku: string
    image: string
    features: { id: string; description: string }[]
  }[]
}

export const Variants = ({ variants }: ProductVariants) => {
  return (
    <section className="card">
      <header className="py-3">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-semibold">{t('admin.variants')}</h1>
        </div>
      </header>

      <div className="p-6">
        <ul className="-my-4 divide-y">
          {variants.map((variant) => (
            <li key={variant.sku} className="flex items-center py-4">
              <img
                src={variant.image}
                alt={variant.sku}
                className="size-12 object-cover object-center"
              />

              <p className="divide-x">
                {variant.features.map((feature) => (
                  <span className="px-3" key={feature.id}>
                    {feature.description}
                  </span>
                ))}
              </p>

              <a
                href={`/admin/variants/${variant.sku}`} // verificar que la variante este relacionado si no que de error 404
                className="btn btn-blue ml-auto"
              >
                Editar
              </a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
