import orderOperations from '../data/orderOperations.js'

// Возвращает операции, которые НЕ были отмечены выполненными в заказе —
// то, что осталось доделать, если визит отмечен как незаконченный.
// Используется и при «Повторить» для незакрытого заказа, и при
// «Продолжить у этого клиента» из профиля клиента — чтобы новый заказ
// сразу открывался с отмеченными оставшимися работами, а не с чистого листа.
export function getRemainingChecklist(order) {
  const checklist = {}
  const prices = {}
  orderOperations.forEach((op) => {
    if (!order.checklist?.[op.id]) {
      checklist[op.id] = true
      if (order.prices?.[op.id] !== undefined) prices[op.id] = order.prices[op.id]
    }
  })
  return { checklist, prices }
}
