import { Link } from 'react-router'
import { LucideShoppingCart } from 'lucide-react'
import type { Cart } from '~/server/cart.server'

type Props = {
  cart: Cart
}

export const CartSummary = ({ cart }: Props) => {
  return (
    <div className="overflow-hidden rounded-lg bg-white shadow">
      <div className="flex items-center justify-between bg-purple-600 p-4 text-white">
        <p className="font-semibold">Resumen de compra ({cart.count})</p>
        <Link to="/cart" className="relative">
          <LucideShoppingCart className="size-6 text-white" />
        </Link>
      </div>

      {cart.items.length === 0 ? (
        <p className="p-4 text-sm text-gray-600">
          No hay productos en el carrito
        </p>
      ) : (
        <>
          <ul className="divide-y divide-gray-100">
            {cart.items.map((item) => (
              <li key={item.rowId} className="flex items-center gap-3 p-4">
                <img
                  src={item.options.image}
                  alt={item.name}
                  className="aspect-square size-12 rounded object-cover"
                />
                <div className="min-w-0 flex-1 text-sm">
                  <p
                    className="truncate font-medium text-gray-800"
                    title={item.name}
                  >
                    {item.name}
                  </p>
                  <p className="font-medium text-gray-500">
                    {item.qty} × ${item.price}
                  </p>
                </div>
                <p className="text-sm font-semibold text-gray-800">
                  ${item.subtotal}
                </p>
              </li>
            ))}
          </ul>

          <div className="flex justify-between border-t border-gray-200 p-4 font-semibold">
            <p>Total:</p>
            <p>$ {cart.subtotal}</p>
          </div>
        </>
      )}
    </div>
  )
}
