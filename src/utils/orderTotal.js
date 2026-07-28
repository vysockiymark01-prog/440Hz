import orderOperations from '../data/orderOperations.js'

// Сумма отмеченных операций заказа по введённым ценам.
// Гарантийный визит (без оплаты) в доход не засчитывается.
export function orderTotal(order) {
  if (order.isWarranty) return 0
  return orderOperations.reduce((sum, op) => {
    if (!order.checklist?.[op.id]) return sum
    const price = order.prices?.[op.id]
    return sum + (typeof price === 'number' && !Number.isNaN(price) ? price : 0)
  }, 0)
}

// Расходы на материалы по заказу.
export function orderExpenses(order) {
  const value = order.expenses
  return typeof value === 'number' && !Number.isNaN(value) ? value : 0
}

// Чистая прибыль заказа (доход минус расходы).
export function orderProfit(order) {
  return orderTotal(order) - orderExpenses(order)
}

export default orderTotal
