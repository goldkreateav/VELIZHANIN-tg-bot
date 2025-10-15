require('dotenv').config();
const { bot } = require('./src/bot');
const server = require('./src/server');

// Запуск бота и сервера
async function startApplication() {
  try {
    console.log('🚀 Запуск приложения...');
    
    // Запуск Express сервера
    console.log('🌐 Запуск веб-сервера...');
    // Сервер уже запускается в server.js
    
    // Запуск бота
    console.log('🤖 Запуск Telegram бота...');
    await bot.launch();
    
    console.log('✅ Приложение успешно запущено!');
    console.log('📱 Бот готов к работе в Telegram');
    console.log('🌐 Mini App доступен по адресу:', `http://localhost:${process.env.PORT || 3000}`);
    
    // Graceful stop
    process.once('SIGINT', () => {
      console.log('🛑 Остановка приложения...');
      bot.stop('SIGINT');
      process.exit(0);
    });
    
    process.once('SIGTERM', () => {
      console.log('🛑 Остановка приложения...');
      bot.stop('SIGTERM');
      process.exit(0);
    });
    
  } catch (error) {
    console.error('❌ Ошибка при запуске приложения:', error);
    process.exit(1);
  }
}

// Запуск
startApplication();
