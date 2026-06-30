import { useEffect } from 'react'
import { ChevronRight, X } from 'lucide-react'
import { Link, useFetcher } from 'react-router'
import { Button } from '../ui/button'
import { useMenuStore } from '~/store/menu.store'

interface FamiliesData {
  items?: { value: string; label: string }[]
}

export const Navbar = () => {
  const isOpen = useMenuStore((state) => state.isOpen)
  const closeMenu = useMenuStore((state) => state.closeMenu)
  const fetcher = useFetcher<FamiliesData>()

  // Lazy-load: traemos las familias la primera vez que se abre el drawer.
  // El guard !fetcher.data hace que quede cacheado para el resto de la sesión.
  useEffect(() => {
    if (isOpen && fetcher.state === 'idle' && !fetcher.data) {
      fetcher.load('/resources/families')
    }
  }, [isOpen, fetcher])

  if (!isOpen) return null

  const families = fetcher.data?.items ?? []
  const loading = fetcher.state === 'loading'

  return (
    <div>
      <div
        onClick={closeMenu}
        className="fixed inset-0 top-0 left-0 z-10 bg-black opacity-25"
      />

      <div className="fixed top-0 left-0 z-20">
        <div className="flex">
          <div className="h-screen w-80 bg-white">
            <div className="bg-purple-600 px-4 py-3 font-semibold text-white">
              <div className="flex items-center justify-between">
                <span className="text-lg">Hola</span>
                <Button onClick={closeMenu}>
                  <X />
                </Button>
              </div>
            </div>

            <div className="h-full overflow-auto">
              {loading && (
                <p className="px-4 py-4 text-sm text-gray-500">Cargando…</p>
              )}

              {!loading && (
                <ul>
                  {families.map((family) => (
                    <li key={family.value}>
                      <Link
                        to={`/?familia=${family.value}`}
                        onClick={closeMenu}
                        className="flex items-center justify-between px-3 py-4 text-gray-700 hover:bg-purple-100"
                      >
                        {family.label}
                        <ChevronRight />
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
