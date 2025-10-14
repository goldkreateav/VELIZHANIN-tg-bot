module.exports = async (ctx) => {
  try {
    const startTime = Date.now();
    
    await ctx.reply('🏓 Понг!');
    
    const responseTime = Date.now() - startTime;
    
    const statusMessage = `✅ Бот работает!
📊 Время ответа: ${responseTime}мс
🕐 Текущее время: ${new Date().toLocaleString('ru-RU')}
💻 Версия: 1.0.0`;

    await ctx.reply(statusMessage);
    
  } catch (error) {
    console.error('Ошибка в команде /ping:', error);
    await ctx.reply('❌ Ошибка при проверке статуса бота.');
  }
};
