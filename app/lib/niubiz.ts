// Niubiz manda las fechas como yyMMddHHmmss (ej: 261002115315).
export function formatNiubizDate(value: string) {
  const [yy, MM, dd, HH, mm] = value.match(/\d{2}/g) ?? []
  if (!mm) return value
  return `${dd}/${MM}/20${yy} ${HH}:${mm}`
}
