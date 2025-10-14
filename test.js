// Простой тест для проверки работоспособности бота
require('dotenv').config();

async function testBot() {
  console.log('🧪 Тестирование компонентов бота...\n');

  try {
    // Тест 1: Проверка переменных окружения
    console.log('1. Проверка переменных окружения:');
    console.log(`   BOT_TOKEN: ${process.env.BOT_TOKEN ? '✅ Установлен' : '❌ Не установлен'}`);
    console.log(`   OPENAI_API_KEY: ${process.env.OPENAI_API_KEY ? '✅ Установлен' : '❌ Не установлен'}`);
    console.log(`   DB_PATH: ${process.env.DB_PATH || '✅ По умолчанию'}\n`);

    // Тест 2: Инициализация базы данных
    console.log('2. Тест базы данных:');
    const db = require('./src/services/db');
    console.log('   ✅ База данных инициализирована\n');

    // Тест 3: Инициализация API сервиса
    console.log('3. Тест API сервиса:');
    const api = require('./src/services/api');
    console.log('   ✅ API сервис инициализирован\n');

    // Тест 4: Проверка утилит
    console.log('4. Тест утилит:');
    const format = require('./src/utils/format');
    const errors = require('./src/utils/errors');
    console.log('   ✅ Утилиты загружены\n');

    // Тест 5: Проверка команд
    console.log('5. Тест команд:');
    const startCmd = require('./src/commands/start');
    const helpCmd = require('./src/commands/help');
    const pingCmd = require('./src/commands/ping');
    console.log('   ✅ Команды загружены\n');

    // Тест 6: Инициализация бота
    console.log('6. Тест инициализации бота:');
    const { bot } = require('./src/bot');
    console.log('   ✅ Бот инициализирован\n');

    console.log('🎉 Все тесты пройдены успешно!');
    console.log('🚀 Бот готов к запуску. Используйте: npm start');

  } catch (error) {
    console.error('❌ Ошибка при тестировании:', error.message);
    console.error('📋 Убедитесь, что:');
    console.error('   - Установлены все зависимости (npm install)');
    console.error('   - Создан .env файл с токенами');
    console.error('   - Все файлы на месте');
  }
}

// Запуск тестов
testBot();
