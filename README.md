# 🚀 Telegram Bot VELIZHANIN

Полнофункциональный Telegram бот с интеграцией ИИ и мини-приложением для тестового задания студии VELIZHANIN.

## ✨ Возможности

### 🤖 Основные функции бота:
- **🎯 Интерактивный квест** - 3 вопроса с подсчетом очков и таблицей лидеров
- **🧠 AI-советник** - интеграция с OpenAI GPT-3.5 для ответов на вопросы
- **🏆 Таблица лидеров** - рейтинг игроков с результатами квеста
- **📱 Telegram Mini App** - веб-приложение с таблицей лидеров, формой обратной связи, статистикой приложения, а также возможностью **поиграть в DOOM**

### 🌐 Mini App включает:
- Таблица лидеров в реальном времени
- Форма обратной связи с рейтингом
- Статистика бота

## 🛠 Установка и запуск

### 1. Клонирование и установка
```bash
git clone <repository-url>
cd telegram-bot-velizhanin
npm install
```

### 2. Настройка переменных окружения
```bash
cp env.example .env
```

Заполните `.env` файл:
```env
# Telegram Bot Configuration
BOT_TOKEN=your_telegram_bot_token_here

# OpenAI API Configuration  
OPENAI_API_KEY=your_openai_api_key_here

# Database Configuration
DB_PATH=./data/bot.db

# Server Configuration
PORT=3000

# Mini App Configuration
MINI_APP_URL=http://localhost:3000

# Development
NODE_ENV=development
```

### 3. Запуск приложения
```bash
# Режим разработки
npm run dev

# Продакшен
npm start
```

## 🔑 Получение токенов

### Telegram Bot Token
1. Найдите [@BotFather](https://t.me/BotFather) в Telegram
2. Отправьте `/newbot`
3. Следуйте инструкциям для создания бота
4. Скопируйте полученный токен в `.env`

### OpenAI API Key
1. Зарегистрируйтесь на [OpenAI Platform](https://platform.openai.com)
2. Перейдите в раздел API Keys
3. Создайте новый ключ API
4. Скопируйте ключ в `.env`

## 🎮 Использование бота

### Основные команды:
- `/start` - запустить бота и показать главное меню
- `/help` - справка по командам
- `/ping` - проверить работоспособность

### Интерактивные функции:
1. **🎯 Пройти квест** - ответьте на 3 вопроса и получите очки
2. **🤖 Получить совет от ИИ** - задайте любой вопрос AI-советнику
3. **🏆 Таблица лидеров** - посмотрите рейтинг игроков
4. **📱 Открыть Mini App** - запустите веб-приложение в Telegram

## 🌐 API Endpoints

### Основные эндпоинты:
- `GET /health` - проверка здоровья сервисов
- `GET /api/leaderboard` - таблица лидеров (JSON)
- `POST /api/feedback` - отправка обратной связи
- `GET /api/feedback` - получение всех отзывов
- `GET /api/stats` - статистика бота

### Примеры использования API:

**Получение таблицы лидеров:**
```bash
curl http://localhost:3000/api/leaderboard
```

**Отправка обратной связи:**
```bash
curl -X POST http://localhost:3000/api/feedback \
  -H "Content-Type: application/json" \
  -d '{"name":"Иван","message":"Отличный бот!","rating":5}'
```

## 🏗 Основная архитектура проекта

```
src/
├── bot.js                 # Основной файл бота
├── server.js              # Express сервер для Mini App
├── commands/              # Команды бота
│   ├── start.js
│   ├── help.js
│   └── ping.js
├── handlers/              # Обработчики событий
│   ├── quest.js           # Логика квеста
│   ├── ai.js              # AI-советник
│   ├── leaderboard.js     # Таблица лидеров
│   └── mainMenu.js        # Главное меню
├── services/              # Сервисы
│   ├── api.js             # API интеграции
│   └── db.js              # База данных
├── middlewares/           # Middleware
│   ├── auth.js
│   └── logger.js
└── utils/                 # Утилиты
    ├── errors.js
    └── format.js

public/                    # Mini App
├── index.html
├── styles.css
└── app.js
```

## 🧪 Тестирование

```bash
# Запуск тестов
npm test

# Проверка здоровья API
curl http://localhost:3000/health
```

## 🚀 Деплой

### Heroku
1. Создайте приложение на Heroku
2. Подключите GitHub репозиторий
3. Добавьте переменные окружения в настройках Heroku:
   - `BOT_TOKEN`
   - `OPENAI_API_KEY`
   - `PORT` (автоматически)
4. Включите webhook в настройках бота через BotFather

### Vercel/Netlify
Для статического хостинга Mini App:
```bash
# Сборка для продакшена
npm run build

# Деплой папки public/
```

## 📊 База данных

Приложение использует SQLite с автоматическим созданием таблиц:
- `users` - информация о пользователях
- `quest_results` - результаты квеста
- `ai_requests` - запросы к ИИ
- `feedback` - обратная связь

## 🎯 Особенности реализации

### Квест:
- 3 вопроса с 4 вариантами ответов
- Подсчет очков (10 за правильный ответ)
- Детальный разбор результатов
- Сохранение в таблицу лидеров

### AI-советник:
- Интеграция с OpenAI GPT-3.5
- Fallback на случайные факты
- Сохранение истории запросов
- Ограничение на длину ответов

### Mini App:
- Адаптивный дизайн под Telegram
- Реальное время обновления данных
- Форма обратной связи с рейтингом
- Статистика бота

## 📝 Лицензия

MIT License

## 👥 Автор

Разработано для тестового задания студии VELIZHANIN

## 📞 Поддержка

По вопросам обращайтесь в Telegram: @goldreateav

---

**Готово к демонстрации!** 🎉

Все функции из технического задания реализованы и готовы к работе.
