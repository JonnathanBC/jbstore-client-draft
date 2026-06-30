import { Link } from 'react-router'
import { LucideShoppingCart, MenuIcon, ShoppingCart, User2 } from 'lucide-react'

import type { User } from '~/types/user'
import { Container } from './Container'
import { Input } from './Input'
import { Button } from '../ui/button'
import { useMenuStore } from '~/store/menu.store'

interface Props {
  user: User | null
  isAdmin: boolean
}

export function Header({ user, isAdmin }: Props) {
  const openMenu = useMenuStore((state) => state.openMenu)

  return (
    <header className="bg-purple-600">
      <Container className="px-4 py-4">
        <div className="flex items-center justify-between space-x-8">
          <Button onClick={openMenu}>
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
