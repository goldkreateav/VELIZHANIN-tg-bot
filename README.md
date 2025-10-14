# Telegram Bot VELIZHANIN

Telegram бот с интеграцией ИИ и мини-приложением для тестового задания студии VELIZHANIN.

## 🛠 Установка и запуск

1. **Клонируйте репозиторий:**
```bash
git clone <repository-url>
cd telegram-bot-velizhanin
```

2. **Установите зависимости:**
```bash
npm install
```

3. **Настройте переменные окружения:**
```bash
cp .env.example .env
```

Заполните `.env` файл:
```env
BOT_TOKEN=your_telegram_bot_token
OPENAI_API_KEY=your_openai_api_key
DB_PATH=./data/bot.db
PORT=3000
```

4. **Запустите бота:**
```bash
# Режим разработки
npm run dev

# Продакшен
npm start
```

## 📱 Получение токенов

### Telegram Bot Token
1. Найдите [@BotFather](https://t.me/BotFather) в Telegram
2. Отправьте `/newbot`
3. Следуйте инструкциям
4. Скопируйте полученный токен в `.env`

### OpenAI API Key
1. Зарегистрируйтесь на [OpenAI Platform](https://platform.openai.com)
2. Перейдите в API Keys
3. Создайте новый ключ
4. Скопируйте ключ в `.env`

## 🎮 Использование

### Основные команды:
- `/start` - запустить бота и показать главное меню
- `/help` - справка по командам
- `/ping` - проверить работоспособность

## 📊 API Endpoints

- `GET /health` - проверка здоровья сервисов
- `GET /leaderboard` - таблица лидеров (JSON)
- `POST /feedback` - отправка обратной связи

## 🧪 Тестирование

```bash
npm test
```

## 🚀 Деплой

### Heroku
1. Создайте приложение на Heroku
2. Подключите GitHub репозиторий
3. Добавьте переменные окружения
4. Включите webhook в боте

## 📝 Лицензия

MIT License

## 👥 Автор

Разработано для тестового задания студии VELIZHANIN

## 📞 Поддержка

По вопросам обращайтесь в tg: @goldreateav
