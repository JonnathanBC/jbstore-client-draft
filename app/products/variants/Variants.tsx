import { Link, useLoaderData } from 'react-router'

import { t } from '~/i18n'
import { loader } from '~/routes/admin.products.$id'

export const Variants = () => {
  const { product } = useLoaderData<typeof loader>()

  return (
    <section className="card">
      <header className="pb-4">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-semibold">{t('admin.variants')}</h1>
        </div>
      </header>

      <div className="px-4">
        <ul className="-my-4 divide-y">
          {product?.variants.map((variant) => (
            <li key={variant.id} className="flex items-center py-4">
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

              <Link
                to={`variants/${variant.id}`}
                className="btn btn-primary ml-auto"
              >
                Editar
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
