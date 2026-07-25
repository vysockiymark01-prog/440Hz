// Список операций для чек-листа заказа с ориентировочными ценами.
// Источник: конспект «440Гц, 88 поток», лекции 5 и 9 (порядок работы,
// диагностика, чистка, регулировка, циковка, настройка, прайс ассоциации
// «Справочник пианосервиса России», Москва). Цены — ориентир, для конкретного
// заказа их можно изменить прямо в чек-листе.

const orderOperations = [
  { id: 'diagnostika', title: 'Диагностика', defaultPrice: 2000 },
  { id: 'chistka', title: 'Чистка', defaultPrice: 800 },
  { id: 'ustranenie-shumov', title: 'Устранение шумов (скрип, стук, дребезг, звон)', defaultPrice: null },
  { id: 'melkiy-remont', title: 'Мелкий ремонт (расклейка узлов механики)', defaultPrice: null },
  { id: 'regulirovka-klaviatury', title: 'Регулировка клавиатуры', defaultPrice: null },
  { id: 'regulirovka-mehaniki', title: 'Регулировка механики', defaultPrice: null },
  { id: 'regulirovka-pedaley', title: 'Регулировка педалей (шпилёвка и пр.)', defaultPrice: 750 },
  { id: 'cikovka', title: 'Подъём строя (циковка)', defaultPrice: 1500 },
  { id: 'postanovka-struny', title: 'Постановка струны', defaultPrice: 1250 },
  { id: 'nastroyka-pianino', title: 'Настройка пианино', defaultPrice: 5000 },
  { id: 'nastroyka-royalya', title: 'Настройка рояля', defaultPrice: 6000 },
  { id: 'proverka', title: 'Проверка темперации и унисонов по диапазону', defaultPrice: null },
  { id: 'sdacha', title: 'Сдача инструмента, консультация клиента', defaultPrice: null },
]

export default orderOperations
