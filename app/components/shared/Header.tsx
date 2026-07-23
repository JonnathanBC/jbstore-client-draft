import { Form, Link, useNavigate } from 'react-router'
import { LucideShoppingCart, MenuIcon, ShoppingCart, User2 } from 'lucide-react'

import type { User } from '~/types/user'
import { Container } from './Container'
import { SearchInput } from './SearchInput'
import { Button } from '../ui/button'
import { useMenuStore } from '~/store/menu.store'
import { Avatar } from '../Avatar'
import { Dropdown } from './Dropdown'

interface Props {
  user: User | null
  isAdmin: boolean
}

export function Header({ user, isAdmin }: Props) {
  const openMenu = useMenuStore((state) => state.openMenu)
  const navigate = useNavigate()

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
            <SearchInput className="w-full bg-white" />
          </div>

          <div className="flex items-center space-x-2">
            {user ? (
              <Dropdown
                items={[
                  ...(isAdmin
                    ? [
                        {
                          label: 'Administrador',
                          onClick: () => navigate('/admin'),
                          divider: true,
                        },
                      ]
                    : []),
                  {
                    label: 'Mi perfil',
                    onClick: () => navigate('/settings/profile'),
                    divider: true,
                  },

                  {
                    label: (
                      <Form method="post" action="/logout">
                        <button type="submit" className="text-left">
                          <span>Finalizar sesión</span>
                        </button>
                      </Form>
                    ),
                    onClick: () => navigate('/logout'),
                  },
                ]}
              >
                <Avatar src={user.avatar || ''} alt="user image" />
              </Dropdown>
            ) : (
              <Dropdown
                items={[
                  {
                    label: 'Iniciar sesión',
                    onClick: () => navigate('/login'),
                  },
                  {
                    headerLabel: '¿No tenés cuenta?',
                    label: 'Regístrate',
                    onClick: () => navigate('/register'),
                  },
                ]}
              >
                <Avatar src="" alt="user image" />
              </Dropdown>
            )}

            <Button className="text-white">
              <LucideShoppingCart className="size-5 md:size-6" />
            </Button>
          </div>
        </div>

        <div className="mt-4 md:hidden">
          <SearchInput className="w-full bg-white" />
        </div>
      </Container>
    </header>
  )
}
