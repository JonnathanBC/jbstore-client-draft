import type { Dispatch, SetStateAction } from 'react'
import { cn } from '~/lib/utils'
import type { PublicProduct } from '~/types/product'

type AddToCartVariantProps = {
  product: PublicProduct
  selectedFeat: Record<number, number>
  setSelectedFeat: Dispatch<SetStateAction<Record<number, number>>>
}

export const AddToCartVariant = ({
  product,
  selectedFeat,
  setSelectedFeat,
}: AddToCartVariantProps) => {
  const handleSelectFeat = (optionId: number, featureId: number) => {
    setSelectedFeat((prev) => ({
      ...prev,
      [optionId]: featureId,
    }))
  }

  return (
    <div className="flex flex-col gap-4">
      {product.options.map((option) => (
        <div className="flex items-center gap-2" key={option.id}>
          <p className="text-lg font-semibold">{option.name}</p>

          <ul className="flex flex-wrap items-center gap-2">
            {option.features.map((feat) => (
              <li key={feat.id}>
                {option.type === 1 && (
                  <button
                    type="button"
                    className={cn(
                      'h-8 w-20 rounded border border-gray-200 text-sm font-semibold text-gray-700 uppercase',
                      {
                        'bg-purple-600 text-white':
                          selectedFeat[option.id] === feat.id,
                      },
                    )}
                    onClick={() => handleSelectFeat(option.id, feat.id)}
                  >
                    {feat.value}
                  </button>
                )}

                {option.type === 2 && (
                  <button
                    type="button"
                    style={{
                      backgroundColor: feat.value,
                    }}
                    className={cn(
                      'size-6 rounded-full border border-gray-300',
                      {
                        'border-2 border-gray-400':
                          selectedFeat[option.id] === feat.id,
                      },
                    )}
                    onClick={() => handleSelectFeat(option.id, feat.id)}
                    aria-label={feat.value}
                  />
                )}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  )
}
