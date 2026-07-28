// Определяет клиента по нормализованному телефону (или по имени, если телефона нет),
// чтобы группировать заказы одного клиента между собой.
export function clientKey(order) {
  if (order.phone && order.phone.trim()) return `phone:${order.phone.replace(/[^+\d]/g, '')}`
  if (order.clientName && order.clientName.trim()) return `name:${order.clientName.trim().toLowerCase()}`
  return null
}

export default clientKey
