// Ссылки на инструменты и расходники для заказа. Открываются во внешнем
// браузере (target="_blank"), покупка происходит на сайте магазина.
//
// title/note — двуязычные объекты {ru, mn}, читать через tr() из useLanguage().
const shopLinks = [
  {
    id: 'tuning-key-heads',
    shop: 'AliExpress',
    title: {
      ru: 'Ключ для настройки со сменными головками и крюком-гибочником',
      mn: 'Сольж болох толгойтой, нугалуур дэгээтэй тааруулгын түлхүүр',
    },
    note: null,
    url: 'https://aliexpress.ru/item/1005001295564029.html?spm=a2g2w.orderdetail.0.0.5b2a4aa68jV2yN&sku_id=12000015615613520&_ga=2.164878908.2071039549.1784631144-244112369.1771259467',
  },
  {
    id: 'peg-install-key',
    shop: 'AliExpress',
    title: {
      ru: 'Ключ для установки и ремонта вирбелей (колков)',
      mn: 'Вирбель (товч) суурилуулах, засварлах түлхүүр',
    },
    note: null,
    url: 'https://aliexpress.ru/item/1005003010266228.html?spm=a2g2w.orderdetail.0.0.71044aa6BUWUeL&sku_id=12000023216082318&_ga=2.164878908.2071039549.1784631144-244112369.1771259467',
  },
  {
    id: 'soundboard-tool-set',
    shop: 'AliExpress',
    title: {
      ru: 'Набор инструментов для обслуживания деки и струн',
      mn: 'Дека, утас арчлах хэрэгслийн иж бүрдэл',
    },
    note: null,
    url: 'https://aliexpress.ru/item/4001006404249.html?spm=a2g2w.orderdetail.0.0.2b544aa6p6q8C0&sku_id=10000013429252949&_ga=2.164878908.2071039549.1784631144-244112369.1771259467',
  },
  {
    id: 'aliexpress-tool-4',
    shop: 'AliExpress',
    title: { ru: 'Инструмент мастера', mn: 'Мастерын хэрэгсэл' },
    note: {
      ru: 'Название не определилось автоматически — уточните на странице товара',
      mn: 'Нэр автоматаар тодорхойлогдсонгүй — бүтээгдэхүүний хуудаснаас нягтална уу',
    },
    url: 'https://aliexpress.ru/item/1005003088533291.html?spm=a2g2w.orderdetail.0.0.58e94aa6xNCFQG&sku_id=12000024009766372&_ga=2.162058687.2071039549.1784631144-244112369.1771259467',
  },
  {
    id: 'aliexpress-tool-5',
    shop: 'AliExpress',
    title: { ru: 'Инструмент мастера', mn: 'Мастерын хэрэгсэл' },
    note: {
      ru: 'Название не определилось автоматически — уточните на странице товара',
      mn: 'Нэр автоматаар тодорхойлогдсонгүй — бүтээгдэхүүний хуудаснаас нягтална уу',
    },
    url: 'https://aliexpress.ru/item/1005006311330655.html?shpMethod=CAINIAO_ECONOMY&sku_id=12000036716551279&spm=a2g2w.productlist.search_results.15.4283333e7zeirC',
  },
  {
    id: 'aliexpress-tool-6',
    shop: 'AliExpress',
    title: { ru: 'Инструмент мастера', mn: 'Мастерын хэрэгсэл' },
    note: {
      ru: 'Название не определилось автоматически — уточните на странице товара',
      mn: 'Нэр автоматаар тодорхойлогдсонгүй — бүтээгдэхүүний хуудаснаас нягтална уу',
    },
    url: 'https://aliexpress.ru/item/1005008328031706.html?spm=a2g2w.orderdetail.0.0.79af4aa6kfbLql&sku_id=12000044617119469&_ga=2.162058687.2071039549.1784631144-244112369.1771259467',
  },
  {
    id: 'protek-clp',
    shop: 'Ozon',
    title: {
      ru: 'Смазка Protek CLP для фортепианной механики (Германия)',
      mn: 'Пианиноны механизмд зориулсан Protek CLP тос (Герман)',
    },
    note: {
      ru: 'Premium-состав для точной регулировки капсюлей',
      mn: 'Капсюлийг нарийн тохируулахад зориулсан премиум найрлага',
    },
    url: 'https://www.ozon.ru/product/smazka-dlya-fortepiannoy-mehaniki-protek-clp-germaniya-premium-sostav-dlya-tochnoy-regulirovki-2451958527/?is_apparel_size_selected=true',
  },
  {
    id: 'polish-paste',
    shop: 'Ozon',
    title: {
      ru: 'Универсальная полировальная паста для металла, 50 г',
      mn: 'Металлд зориулсан универсал өнгөлгөөний паст, 50 г',
    },
    note: {
      ru: 'Подходит также для стекловолокна, пластика и краски',
      mn: 'Шилэн эслэг, хуванцар, будганд ч тохирно',
    },
    url: 'https://www.ozon.ru/product/50g-universalnaya-polirovalnaya-pasta-dlya-metalla-takzhe-dlya-steklovolokna-plastika-i-kraski-1670302431/?is_apparel_size_selected=true',
  },
]

export default shopLinks
