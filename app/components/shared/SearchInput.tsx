import { useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'react-router'

import { Input } from './Input'

interface Props {
  className?: string
  placeholder?: string
  delay?: number
}

export function SearchInput({
  className,
  placeholder = 'Buscar por producto, tienda o marca',
  delay = 400,
}: Props) {
  const [searchParams, setSearchParams] = useSearchParams()

  // Estado local para feedback instantáneo mientras el usuario tipea.
  // Se siembra desde el URL para respetar lo que ya venía filtrado.
  const [value, setValue] = useState(searchParams.get('search') ?? '')
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Escribe el término en el URL. Usa el updater funcional para basarse
  // siempre en los params más nuevos (no en un closure viejo).
  const commit = (search: string) => {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev)
        if (search) {
          next.set('search', search)
        } else {
          next.delete('search')
        }
        next.delete('page')
        return next
      },
      { preventScrollReset: true },
    )
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const next = e.target.value
    setValue(next)

    // Debounce: cancelamos el timer anterior y reprogramamos.
    // Solo pega al servidor cuando el usuario DEJA de tipear.
    if (timer.current) clearTimeout(timer.current)
    timer.current = setTimeout(() => commit(next), delay)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== 'Enter') return
    // Enter = buscar YA, sin esperar el debounce.
    e.preventDefault()
    if (timer.current) clearTimeout(timer.current)
    commit(value)
  }

  // Re-sincroniza la cajita cuando el URL cambia por fuera del input
  // (botón atrás, limpiar filtros). Depende SOLO del valor del URL, así
  // reacciona a cambios externos y no pelea con lo que estás tipeando:
  // mientras tipeás el URL todavía no cambió, entonces este efecto no corre.
  const urlSearch = searchParams.get('search') ?? ''
  useEffect(() => {
    setValue(urlSearch)
  }, [urlSearch])

  // Limpiamos cualquier timer pendiente al desmontar.
  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current)
  }, [])

  return (
    <Input
      className={className}
      label=""
      name="search"
      value={value}
      onChange={handleChange}
      onKeyDown={handleKeyDown}
      placeholder={placeholder}
    />
  )
}
