const { Markup } = require('telegraf');
const db = require('../services/db');

module.exports = async (ctx) => {
  try {
    const firstName = ctx.from.first_name || 'Друг';
    
    // Сохраняем пользователя в базе данных
    await db.createOrUpdateUser(ctx.from);
    
    const welcomeMessage = `🎉 Привет, ${firstName}!

Добро пожаловать в бота VELIZHANIN! 

Здесь ты можешь:
🎯 Пройти увлекательный квест
🤖 Получить совет от искусственного интеллекта
ℹ️ Узнать больше о боте

Выбери действие:`;

    const keyboard = Markup.inlineKeyboard([
      [Markup.button.callback('🎯 Пройти квест', 'quest_start')],
      [Markup.button.callback('🤖 Получить совет от ИИ', 'ai_advice')],
      [Markup.button.callback('ℹ️ О боте', 'about')]
    ]);

    await ctx.reply(welcomeMessage, keyboard);
    
    // Сохраняем состояние пользователя
    if (!ctx.session) {
      ctx.session = {};
    }
    ctx.session.userState = 'main_menu';
    
  } catch (error) {
    console.error('Ошибка в команде /start:', error);
    await ctx.reply('Произошла ошибка. Попробуйте команду /start еще раз.');
  }
};
