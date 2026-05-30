// Calcula la secuencia de páginas a mostrar en la paginación.
// Genera un array con los números de página a visualizar, incluyendo "ellipsis" (...)
// cuando hay espacios grandes entre páginas. Muestra siempre la primera y última página,
// y 1-2 páginas alrededor de la página actual para navegación rápida.
export function buildPageItems(current: number, total: number): (number | "ellipsis")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)
  const items: (number | "ellipsis")[] = [1]
  if (current > 3) items.push("ellipsis")
  const start = Math.max(2, current - 1)
  const end = Math.min(total - 1, current + 1)
  for (let i = start; i <= end; i++) items.push(i)
  if (current < total - 2) items.push("ellipsis")
  items.push(total)
  return items
}
