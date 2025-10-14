require('dotenv').config();
const { bot } = require('./src/bot');

// Запуск бота
async function startBot() {
  try {
    console.log('🚀 Запуск Telegram бота...');
    
    // Запуск бота в режиме polling (для разработки)
    await bot.launch();
    
    console.log('✅ Бот успешно запущен!');
    console.log('📱 Бот готов к работе в Telegram');
    
    // Graceful stop
    process.once('SIGINT', () => bot.stop('SIGINT'));
    process.once('SIGTERM', () => bot.stop('SIGTERM'));
    
  } catch (error) {
    console.error('❌ Ошибка при запуске бота:', error);
    process.exit(1);
  }
}

// Запуск
startBot();
