# Настройщик фортепиано

Офлайн-справочник и тренажёр слуха на биения для настройщика фортепиано.
PWA на React + Vite, без бэкенда и аккаунтов — весь прогресс хранится
локально в `localStorage` устройства.

Собрано по материалам курса «440Гц, 88 поток»: справочник переработан
в короткие карточки-статьи по девяти лекциям, плюс глоссарий терминов,
тренажёр биений на Web Audio API и рабочие инструменты мастера
(таблица проволоки Röslau, форма заказа басовой струны, чек-листы
диагностики и порядка работы).

## Стек

- React 19 + Vite 8
- react-router-dom (`HashRouter` — работает на любом статическом хостинге
  без серверных rewrite-правил, включая GitHub Pages и файловый TWA-обёртчик)
- vite-plugin-pwa (Workbox `generateSW`) — полный офлайн после первой загрузки
- fuse.js — клиентский полнотекстовый поиск по справочнику
- Web Audio API — генерация звука тренажёра, без аудиофайлов

## Запуск

```bash
npm install
npm run dev
```

Откроется на `http://localhost:5173`.

## Сборка

```bash
npm run build     # собирает production-бандл в dist/
npm run preview   # локально проверить собранный dist/
npm run lint       # oxlint
```

## Структура проекта

```
src/
  data/          контент справочника, глоссарий, таблица проволоки, чек-листы
  audio/         BeatEngine — движок двух синусоид с плавной атакой/затуханием
  hooks/         useBeatEngine, useFavorites, useLocalStorage
  components/    BottomNav, TermText (авто-ссылки на глоссарий), BeatVisualizer
  pages/
    reference/   Справочник, лекции, статьи, глоссарий, поиск
    trainer/     4 режима тренажёра биений
    tools/       Инструменты мастера
    more/        Избранное, о приложении
public/icons/    иконки PWA (192, 512, maskable, apple-touch-icon)
```

## Публикация на GitHub

```bash
git init                      # уже выполнено при создании проекта
git add -A
git commit -m "Initial commit"
git branch -M main
git remote add origin git@github.com:<username>/<repo>.git
git push -u origin main
```

## Деплой как сайта (GitHub Pages)

Перед обёрткой в TWA приложению нужен реальный HTTPS-адрес.
Проще всего — GitHub Pages:

1. `npm run build`
2. Опубликовать содержимое `dist/` в ветку `gh-pages` (вручную или
   через workflow `actions/deploy-pages`, либо пакет `gh-pages`:
   `npx gh-pages -d dist`).
3. Включить Pages в настройках репозитория (Source → GitHub Actions
   или ветка `gh-pages`).
4. Проверить, что сайт открывается по `https://<username>.github.io/<repo>/`
   и работает офлайн после первого захода (Service Worker).

Так как `vite.config.js` использует `base: './'`, сборка одинаково
хорошо работает и в корне домена, и в подпути GitHub Pages.

## План обёртки в TWA для Google Play (кратко)

TWA (Trusted Web Activity) открывает уже задеплоенный PWA-сайт в
полноэкранном Chrome-контейнере — Google Play публикует не веб-код,
а тонкий APK-обёртчик.

1. Задеплоить сайт на HTTPS (см. выше) — TWA не работает с `file://`
   или локальными адресами.
2. Установить [Bubblewrap CLI](https://github.com/GoogleChromeLabs/bubblewrap):
   `npm i -g @bubblewrap/cli`.
3. `bubblewrap init --manifest https://<домен>/manifest.webmanifest` —
   создаст Android-проект и сгенерирует ключ подписи.
4. Настроить Digital Asset Links: положить `assetlinks.json` (со
   SHA-256 отпечатком ключа подписи) в `https://<домен>/.well-known/`
   — без этого TWA покажет адресную строку браузера поверх приложения.
5. `bubblewrap build` — соберёт `.apk` / `.aab`.
6. Загрузить `.aab` в Google Play Console (создать приложение,
   заполнить листинг, пройти проверку контента, опубликовать
   закрытое тестирование перед продакшеном).
7. При обновлении сайта менять версию в `twa-manifest.json` и
   пересобирать обёртку только при изменении иконок/имени/цвета —
   сам контент подтягивается с сайта на лету.

## Definition of Done (из ТЗ)

- [x] `npm run build` собирается без ошибок
- [x] Service Worker кеширует все ассеты — полная работа офлайн
      после первой загрузки
- [x] Манифест PWA с иконками 192/512/maskable — приложение
      устанавливаемо (installable)
- [x] Тренажёр: звук без щелчков (плавная атака/затухание в
      `BeatEngine`), биения соответствуют заданной разнице частот
- [x] Все данные и прогресс — в `localStorage`, без бэкенда

## Вне рамок MVP

Оплата, интерактивная кварто-квинтовая темперация как отдельный
интерактивный тренажёр, квизы к экзамену, CRM настройщика, iOS-сборка —
сознательно не реализованы в этой версии.
