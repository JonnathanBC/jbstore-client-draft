import { Link } from 'react-router'
import { LucideShoppingCart, MenuIcon, ShoppingCart, User2 } from 'lucide-react'

import type { User } from '~/types/user'
import { Container } from './Container'
import { Input } from './Input'
import { Button } from '../ui/button'

interface Props {
  user: User | null
  isAdmin: boolean
}

export function Header({ user, isAdmin }: Props) {
  return (
    <header className="bg-purple-600">
      <Container className="px-4 py-4">
        <div className="flex items-center justify-between space-x-8">
          <Button>
            <MenuIcon className="size-6 text-white md:size-8" />
          </Button>

          <h1 className="text-white">
            <Link to="/" className="inline-flex flex-col items-end">
              <span className="text-2xl leading-4 font-semibold md:text-3xl md:leading-6">
                JBStore
              </span>
              <span className="text-xs">Tienda Online</span>
            </Link>
          </h1>

          <div className="hidden flex-1 md:block">
            <Input
              className="w-full bg-white"
              label=""
              name="search"
              placeholder="Buscar por producto, tienda o marca"
            />
          </div>

          <div className="flex items-center">
            <Button className="text-white">
              <User2 className="size-5 md:size-6" />
            </Button>

            <Button className="text-white">
              <LucideShoppingCart className="size-5 md:size-6" />
            </Button>
          </div>
        </div>

        <div className="mt-4 md:hidden">
          <Input
            className="w-full bg-white"
            label=""
            name="search"
            placeholder="Buscar por producto, tienda o marca"
          />
        </div>
      </Container>
    </header>
  )
}

{
  /* <nav className="flex items-center gap-6 text-sm">
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
            <ShoppingCart className="size-5" />
          </Link>
        </nav> */
}
