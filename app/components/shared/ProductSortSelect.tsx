import { Select } from '~/components/inputs/Select'

const SORT_ITEMS = [
  { value: 'relevant', label: 'Relevancia' },
  { value: 'major_to_minor', label: 'Precio: mayor a menor' },
  { value: 'minor_to_major', label: 'Precio: menor a mayor' },
]

type Props = {
  value: string | null
  onChange: (value: string) => void
}

// Mismo "Ordenar por" en categorías, subcategorías y familias: las opciones viven en un solo lugar
export const ProductSortSelect = ({ value, onChange }: Props) => (
  <Select
    items={SORT_ITEMS}
    value={value ?? 'relevant'}
    onChange={onChange}
    className="w-56"
  />
)
