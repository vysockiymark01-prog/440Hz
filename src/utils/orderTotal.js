import orderOperations from '../data/orderOperations.js'

// Сумма отмеченных операций заказа по введённым ценам.
export function orderTotal(order) {
  return orderOperations.reduce((sum, op) => {
    if (!order.checklist?.[op.id]) return sum
    const price = order.prices?.[op.id]
    return sum + (typeof price === 'number' && !Number.isNaN(price) ? price : 0)
  }, 0)
}

export default orderTotal
