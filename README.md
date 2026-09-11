# ПС БЗ

Обучающая drag-and-drop игра: нужно распределить подстанции (ПС) по соответствующим районам электрических сетей (РЭС) Воронежской области.

## Запуск

```bash
npm install
npm run dev
```

## Скрипты

- `npm run dev` — запуск dev-сервера Vite
- `npm run build` — сборка (`tsc -b && vite build`)
- `npm run preview` — предпросмотр собранной версии
- `npm run lint` — проверка ESLint
- `npm run format` — форматирование Prettier

## Стек

- React 19 + TypeScript
- Vite 7
- Tailwind CSS 4 + shadcn/ui
- @dnd-kit (drag-and-drop)
- Husky + lint-staged, ESLint 9, Prettier

## Структура

```
src/
├── App.tsx               # игровая логика
├── components/           # PsItem, Droppable, ui-компоненты
├── data/                 # psDb.ts (подстанции), resList.ts (РЭС), types
└── lib/                  # утилита cn()
```

## Управление

- **Перемешать** — случайный порядок подстанций
- **Расставить по порядку** — сброс в исходное состояние
- **Заполнить правильными ответами** — автозаполнение РЭС
- **Сбросить счётчик ошибок** — обнуление счётчика

Перетаскивание доступно мышью, тачем и с клавиатуры (Enter + стрелки).
