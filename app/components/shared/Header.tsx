import { Form, Link } from 'react-router'
import { ShoppingCart } from 'lucide-react'
import type { User } from '~/types/user'

interface Props {
  user: User | null
  isAdmin: boolean
}

export function Header({ user, isAdmin }: Props) {
  return (
    <header className="flex h-16 items-center border-b bg-white px-6">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between">
        <Link to="/" className="text-lg font-semibold">
          JB Store
        </Link>

        <nav className="flex items-center gap-6 text-sm">
          <Link to="/products" className="hover:text-black">
            Productos
          </Link>
          {isAdmin && (
            <Link to="/admin" className="hover:text-black">
              Admin
            </Link>
          )}

          {user ? (
            <Form method="post" action="/logout">
              <button type="submit" className="cursor-pointer hover:text-black">
                Cerrar sesión
              </button>
            </Form>
          ) : (
            <Link to="/login" className="hover:text-black">
              Iniciar sesión
            </Link>
          )}

          <Link to="/cart" className="hover:text-black" aria-label="Cart">
            <ShoppingCart className="h-5 w-5" />
          </Link>
        </nav>
      </div>
    </header>
  )
}
