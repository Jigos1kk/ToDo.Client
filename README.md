# ToDo.UI — Фронтенд платформы ToDo

Современный SPA на React + TypeScript + Vite для экосистемы ToDo.  
Работает с микросервисами **ToDo.Auth** (авторизация) и **ToDo.Core** (бизнес-логика).

## Быстрый старт

```bash
cd ToDo.UI
npm install
npm run dev
```

Приложение стартует на **http://localhost:5173**.  
Запросы к API проксируются через Vite:
- `/api/auth/*` → `http://localhost:5057` (ToDo.Auth)
- `/api/*` → `http://localhost:5056` (ToDo.Core)

Убедитесь, что оба бэкенда запущены перед началом работы.

## Команды

| Команда | Описание |
| ------- | -------- |
| `npm run dev` | Dev-сервер (5173) |
| `npm run build` | Сборка для продакшена |
| `npm run lint` | ESLint |
| `npm run format` | Prettier |

## Архитектура

Проект следует методологии FSD (Feature-Sliced Design):
- **`src/app`** — providers, router, layout, глобальные стили
- **`src/features`** — бизнес-фичи: auth, theme, tasks
- **`src/entities`** — модели данных и API-клиенты: user, project, task, membership, correction, file
- **`src/shared`** — переиспользуемый UI-кит, http-клиент, утилиты

## Дизайн-система

- Адаптивная сетка (max-width: 1080px)
- Светлая и тёмная темы (CSS custom properties, тоггл в шапке)
- Анимации: fade-in, scale-in, slide-in-right, shimmer (скелетоны)
- Доступность: aria-атрибуты, focus management, reduced-motion
- Логотип: SVG inline, favicon через data-URI

## Страницы

| Маршрут | Страница |
| ------- | -------- |
| `/login` | Вход |
| `/register` | Регистрация (Customer/Freelancer) |
| `/confirm-email` | Подтверждение email по токену |
| `/forgot-password` | Восстановление пароля |
| `/reset-password` | Сброс пароля |
| `/` | Список проектов |
| `/projects/:id` | Проект: задачи, файлы, заявки |
| `/tasks/:id` | Задача: подзадачи, корректировки, файлы |
| `/profile` | Профиль: данные, роли, смена пароля |

## Технологии

- **React 19** + TypeScript 6 (strict)
- **Vite 8** — сборка, HMR, прокси
- **@tanstack/react-query** — серверный стейт, кеш, optimistic updates
- **React Hook Form** + Zod — валидация форм
- **Zustand** — auth store, theme store
- **Axios** — HTTP-клиент с auto-refresh токенов
- **CSS Modules** — изолированные стили на CSS custom properties
- **ESLint** + **Prettier** — линтинг и форматирование