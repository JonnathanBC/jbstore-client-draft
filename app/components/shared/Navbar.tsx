import { useEffect, useState } from 'react'
import { ChevronRight, X } from 'lucide-react'
import { Link, useFetcher } from 'react-router'
import { Button } from '../ui/button'
import { useMenuStore } from '~/store/menu.store'

interface MenuItem {
  value: string
  label: string
}

interface FamiliesData {
  items?: MenuItem[]
}

interface CategoriesData {
  items?: (MenuItem & { subcategories: MenuItem[] })[]
}

export const Navbar = () => {
  const isOpen = useMenuStore((state) => state.isOpen)
  const closeMenu = useMenuStore((state) => state.closeMenu)
  const familiesFetcher = useFetcher<FamiliesData>()
  const categoriesFetcher = useFetcher<CategoriesData>()
  const [familyId, setFamilyId] = useState<string | null>(null)

  // Lazy-load: traemos las familias la primera vez que se abre el drawer.
  // El guard !data hace que quede cacheado para el resto de la sesión.
  useEffect(() => {
    if (isOpen && familiesFetcher.state === 'idle' && !familiesFetcher.data) {
      familiesFetcher.load('/resources/public/families')
    }
  }, [isOpen, familiesFetcher])

  // Cada vez que cambia la familia activa, traemos SUS categorías
  // (cada una ya viene con sus subcategorías anidadas, un solo request).
  useEffect(() => {
    if (familyId) {
      categoriesFetcher.load(
        `/resources/public/categories?family_id=${familyId}`,
      )
    }
  }, [familyId])

  if (!isOpen) return null

  const families = familiesFetcher.data?.items ?? []
  const loadingFamilies = familiesFetcher.state === 'loading'

  const categories = categoriesFetcher.data?.items ?? []
  const loadingCategories = categoriesFetcher.state === 'loading'

  const activeFamily = families.find((family) => family.value === familyId)

  return (
    <div>
      <div
        onClick={closeMenu}
        className="fixed inset-0 top-0 left-0 z-10 bg-black opacity-25"
      />

      <div className="fixed top-0 left-0 z-20">
        <div className="flex">
          <div className="h-screen w-screen bg-white md:w-80">
            <div className="bg-purple-600 px-4 py-3 font-semibold text-white">
              <div className="flex items-center justify-between">
                <span className="text-lg">Hola</span>
                <Button onClick={closeMenu}>
                  <X />
                </Button>
              </div>
            </div>

            <div className="h-[calc(100vh-60px)] overflow-auto">
              {loadingFamilies && (
                <p className="px-4 py-4 text-sm text-gray-500">Cargando…</p>
              )}

              {!loadingFamilies && (
                <ul>
                  {families.map((family) => (
                    <li
                      key={family.value}
                      onMouseEnter={() => setFamilyId(family.value)}
                    >
                      <Link
                        to={`/families/${family.value}`}
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

          {/* Submenu: solo existe cuando hay una familia activa */}
          {activeFamily && (
            <div className="hidden w-80 pt-15 md:block xl:w-228">
              <div className="h-[calc(100vh-60px)] overflow-auto bg-white py-4">
                <div className="flex items-center justify-between px-4 pb-4">
                  <h2 className="text-3xl font-bold">{activeFamily.label}</h2>
                  <Link
                    to={`/families/${activeFamily.value}`}
                    onClick={closeMenu}
                    className="btn btn-primary"
                  >
                    Ver todo
                  </Link>
                </div>

                {loadingCategories && (
                  <p className="px-4 py-4 text-sm text-gray-500">Cargando…</p>
                )}

                {!loadingCategories && (
                  <ul className="grid gap-8 xl:grid-cols-3">
                    {categories.map((category) => (
                      <li key={category.value} className="px-4">
                        <Link
                          to={`/?categoria=${category.value}`}
                          onClick={closeMenu}
                          className="text-lg font-semibold text-purple-600"
                        >
                          {category.label}
                        </Link>

                        <ul className="mt-4 space-y-2">
                          {category.subcategories.map((subcategory) => (
                            <li key={subcategory.value}>
                              <Link
                                to={`/?subcategoria=${subcategory.value}`}
                                onClick={closeMenu}
                                className="block text-sm text-gray-600 hover:text-purple-600"
                              >
                                {subcategory.label}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
