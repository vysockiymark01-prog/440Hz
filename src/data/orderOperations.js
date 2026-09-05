// Список операций для чек-листа заказа с ориентировочными ценами.
// Источник: конспект «440Гц, 88 поток», лекции 5 и 9 (порядок работы,
// диагностика, чистка, регулировка, циковка, настройка, прайс ассоциации
// «Справочник пианосервиса России», Москва). Цены — ориентир, для конкретного
// заказа их можно изменить прямо в чек-листе.
//
// title — двуязычный объект {ru, mn}. Читать через tr() из useLanguage()
// (см. LanguageContext.jsx), например: tr(op.title). Исключение — тексты,
// которые уходят клиенту/во внешний экспорт (смета, .ics, CSV): там title.ru
// используется явно, независимо от языка интерфейса (см. MyOrders.jsx).

const orderOperations = [
  { id: 'diagnostika', title: { ru: 'Диагностика', mn: 'Оношилгоо' }, defaultPrice: 2000 },
  { id: 'chistka', title: { ru: 'Чистка', mn: 'Цэвэрлэгээ' }, defaultPrice: 800 },
  { id: 'ustranenie-shumov', title: { ru: 'Устранение шумов (скрип, стук, дребезг, звон)', mn: 'Чимээ шуугиан арилгах (шажигнах, тогших, чичрэх, дуугарах)' }, defaultPrice: null },
  { id: 'melkiy-remont', title: { ru: 'Мелкий ремонт (расклейка узлов механики)', mn: 'Жижиг засвар (механизмын наалдацыг сэргээх)' }, defaultPrice: null },
  { id: 'regulirovka-klaviatury', title: { ru: 'Регулировка клавиатуры', mn: 'Товчлуурын тохируулга' }, defaultPrice: null },
  { id: 'regulirovka-mehaniki', title: { ru: 'Регулировка механики', mn: 'Механизмын тохируулга' }, defaultPrice: null },
  { id: 'regulirovka-pedaley', title: { ru: 'Регулировка педалей (шпилёвка и пр.)', mn: 'Педалийн тохируулга (шпилёвка гэх мэт)' }, defaultPrice: 750 },
  { id: 'cikovka', title: { ru: 'Подъём строя (циковка)', mn: 'Тааруулгын түвшинг өргөх (циковка)' }, defaultPrice: 1500 },
  { id: 'postanovka-struny', title: { ru: 'Постановка струны', mn: 'Утас тавих' }, defaultPrice: 1250 },
  { id: 'nastroyka-pianino', title: { ru: 'Настройка пианино', mn: 'Пианино тааруулах' }, defaultPrice: 5000 },
  { id: 'nastroyka-royalya', title: { ru: 'Настройка рояля', mn: 'Рояль тааруулах' }, defaultPrice: 6000 },
  { id: 'proverka', title: { ru: 'Проверка темперации и унисонов по диапазону', mn: 'Диапазоноор темперамент ба унисоныг шалгах' }, defaultPrice: null },
  { id: 'sdacha', title: { ru: 'Сдача инструмента, консультация клиента', mn: 'Хөгжим хүлээлгэн өгөх, клиентэд зөвлөгөө өгөх' }, defaultPrice: null },
]

export default orderOperations
