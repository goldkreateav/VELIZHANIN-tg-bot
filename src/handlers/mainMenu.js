const { Markup } = require('telegraf');

// Обработчик возврата в главное меню
const mainMenuHandler = async (ctx) => {
  try {
    await ctx.answerCbQuery();
    
    // Сбрасываем все состояния сессии
    if (ctx.session) {
      ctx.session.questState = null;
      ctx.session.aiState = null;
      ctx.session.questAnswers = null;
      ctx.session.questQuestions = null;
      ctx.session.questCurrentQuestion = null;
      ctx.session.userState = 'main_menu';
    }
    
    const firstName = ctx.from.first_name || 'Друг';
    
    const welcomeMessage = `🏠 *Главное меню*\n\nПривет, ${firstName}!\n\nВыбери действие:`;
    
    // Создаем кнопки
    const buttons = [
      [Markup.button.callback('🎯 Пройти квест', 'quest_start')],
      [Markup.button.callback('🤖 Получить совет от ИИ', 'ai_advice')],
      [Markup.button.callback('🏆 Таблица лидеров', 'leaderboard')],
      [Markup.button.callback('💬 Оставить отзыв', 'feedback_start')]
    ];
    
    // Добавляем кнопку Mini App только если URL начинается с HTTPS
    const miniAppUrl = (process.env.MINI_APP_URL || '').trim();
    if (miniAppUrl && miniAppUrl.startsWith('https://')) {
      buttons.push([Markup.button.webApp('📱 Открыть Mini App', miniAppUrl)]);
    } else if (process.env.NODE_ENV === 'development') {
      // В режиме разработки показываем информацию о Mini App
      buttons.push([Markup.button.callback('📱 Mini App (только HTTPS)', 'mini_app_info')]);
    }
    
    buttons.push([Markup.button.callback('ℹ️ О боте', 'about')]);
    
    const keyboard = Markup.inlineKeyboard(buttons);
    
    await ctx.reply(welcomeMessage, { 
      parse_mode: 'Markdown',
      ...keyboard 
    });
    
  } catch (error) {
    console.error('Ошибка в обработчике main_menu:', error);
    await ctx.reply('Произошла ошибка при возврате в главное меню. Попробуйте команду /start.');
  }
};

module.exports = {
  mainMenuHandler
};
