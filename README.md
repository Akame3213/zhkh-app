# ⚡ ЖКХ — Система учёта коммунальных ресурсов

Fullstack клиент-серверное приложение для учёта расхода коммунальных ресурсов в ЖКХ.

## 🛠 Стек технологий

| Слой | Технология |
|---|---|
| Frontend | React 18, React Router v6, Recharts, Axios |
| Backend | Node.js, Express.js, Sequelize ORM |
| База данных | PostgreSQL 15 |
| Real-time | WebSocket (ws) |
| Контейнеризация | Docker, Docker Compose |
| Аутентификация | JWT (jsonwebtoken) + bcrypt |

## 📁 Структура проекта

```
zhkh-app/
├── backend/
│   ├── src/
│   │   ├── controllers/    # Логика обработки запросов
│   │   ├── middleware/     # JWT аутентификация
│   │   ├── models/         # Sequelize модели (User, Apartment, Meter, MeterReading, Bill)
│   │   ├── routes/         # Express маршруты
│   │   ├── websocket/      # WebSocket сервер
│   │   ├── index.js        # Точка входа
│   │   └── seed.js         # Тестовые данные
│   ├── Dockerfile
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/     # Layout, навигация
│   │   ├── context/        # AuthContext
│   │   ├── hooks/          # useApi (axios), useWebSocket
│   │   └── pages/          # Dashboard, Apartments, Meters, Readings, Bills, Users
│   ├── Dockerfile
│   ├── nginx.conf
│   └── package.json
├── docker-compose.yml
└── README.md
```

## 🚀 Запуск через Docker (рекомендуется)

### Требования
- [Docker Desktop](https://www.docker.com/products/docker-desktop/)

### Шаги

```bash
# 1. Клонировать / распаковать проект
cd zhkh-app

# 2. Запустить все сервисы
docker-compose up --build

# 3. Заполнить БД тестовыми данными (в отдельном терминале)
docker exec zhkh_backend node src/seed.js

# 4. Открыть браузер
# http://localhost:3000
```

## 💻 Запуск локально (без Docker)

### Требования
- Node.js 18+
- PostgreSQL 15

### Backend

```bash
cd backend
cp .env.example .env
# Отредактируйте .env — укажите параметры вашей PostgreSQL

npm install
npm run seed     # Создать таблицы и тестовые данные
npm run dev      # Запуск с nodemon (порт 5000)
```

### Frontend

```bash
cd frontend
cp .env.example .env
# REACT_APP_API_URL=http://localhost:5000/api
# REACT_APP_WS_URL=ws://localhost:5000/ws

npm install
npm start        # Запуск (порт 3000)
```

## 👤 Тестовые аккаунты

| Роль | Email | Пароль |
|---|---|---|
| Администратор | admin@zhkh.ru | admin123 |
| Менеджер | manager@zhkh.ru | manager123 |
| Жилец (Анна) | anna@mail.ru | resident123 |
| Жилец (Дмитрий) | dmitry@mail.ru | resident123 |

## 🔑 Ролевая модель

| Действие | Admin | Manager | Resident |
|---|---|---|---|
| Просмотр квартир | ✅ все | ✅ все | ✅ свои |
| CRUD квартир | ✅ | ✅ | ❌ |
| Удаление квартир | ✅ | ❌ | ❌ |
| CRUD счётчиков | ✅ | ✅ | ❌ |
| Внесение показаний | ✅ | ✅ | ✅ |
| Формирование счетов | ✅ | ✅ | ❌ |
| Оплата счетов | ✅ | ✅ | ✅ |
| Управление пользователями | ✅ | 👁 просмотр | ❌ |
| Блокировка пользователей | ✅ | ❌ | ❌ |

## 🌐 API Endpoints

```
POST   /api/auth/register
POST   /api/auth/login
GET    /api/auth/me

GET    /api/apartments
POST   /api/apartments
PUT    /api/apartments/:id
DELETE /api/apartments/:id

GET    /api/meters
POST   /api/meters
PUT    /api/meters/:id
DELETE /api/meters/:id

GET    /api/readings
POST   /api/readings
DELETE /api/readings/:id

GET    /api/bills
POST   /api/bills/generate
POST   /api/bills/:id/pay
DELETE /api/bills/:id

GET    /api/users
PUT    /api/users/:id
PATCH  /api/users/:id/toggle

WS     ws://localhost:5000/ws
```

## 📡 WebSocket события

| Событие | Описание |
|---|---|
| `CONNECTED` | Подключение установлено |
| `NEW_READING` | Внесено новое показание |
| `NEW_BILL` | Сформирован новый счёт |
| `BILL_PAID` | Счёт оплачен |
| `PING / PONG` | Проверка соединения |

## 📋 Методология двенадцати факторов (12-Factor App)

1. **Codebase** — один репозиторий Git
2. **Dependencies** — все зависимости в package.json
3. **Config** — конфигурация через переменные окружения (.env)
4. **Backing services** — PostgreSQL как внешний сервис
5. **Build/release/run** — разделено через Docker
6. **Processes** — stateless Express-сервер
7. **Port binding** — сервис экспортирует порт самостоятельно
8. **Concurrency** — горизонтальное масштабирование через Docker
9. **Disposability** — быстрый старт и завершение
10. **Dev/prod parity** — одинаковое окружение через Docker Compose
11. **Logs** — вывод в stdout/stderr
12. **Admin processes** — seed.js как одноразовый процесс
