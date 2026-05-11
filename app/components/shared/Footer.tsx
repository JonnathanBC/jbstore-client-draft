import { useEffect, useState } from 'react'

export function Footer() {
  const [year, setYear] = useState(() => new Date().getFullYear())

  return (
    <footer
      suppressHydrationWarning
      className="border-t bg-white p-4 text-center text-sm text-zinc-500"
    >
      © {year} JB Store
    </footer>
  )
}
