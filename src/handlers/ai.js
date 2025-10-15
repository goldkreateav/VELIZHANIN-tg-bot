const { Markup } = require('telegraf');
const apiService = require('../services/api');
const db = require('../services/db');

// Обработчик запуска AI-советника
const aiAdviceHandler = async (ctx) => {
  try {
    await ctx.answerCbQuery();
    
    // Инициализируем сессию для AI
    if (!ctx.session) {
      ctx.session = {};
    }
    ctx.session.aiState = 'waiting_question';
    
    const message = `🤖 *AI-советник готов помочь!*\n\nЗадайте любой вопрос, и я постараюсь дать полезный ответ.\n\n💡 *Примеры вопросов:*\n• Как улучшить продуктивность?\n• Что такое машинное обучение?\n• Как создать Telegram бота?\n• Советы по изучению программирования\n\nПросто напишите ваш вопрос:`;
    
    const keyboard = Markup.inlineKeyboard([
      [Markup.button.callback('🏠 Главное меню', 'main_menu')]
    ]);
    
    await ctx.reply(message, { 
      parse_mode: 'Markdown',
      ...keyboard 
    });
    
  } catch (error) {
    console.error('Ошибка в обработчике ai_advice:', error);
    await ctx.reply('Произошла ошибка при запуске AI-советника. Попробуйте позже.');
  }
};

// Обработчик текстовых сообщений для AI
const aiTextHandler = async (ctx) => {
  try {
    // Проверяем, что пользователь в режиме AI
    if (!ctx.session || ctx.session.aiState !== 'waiting_question') {
      return;
    }
    
    const question = ctx.message.text;
    
    // Показываем индикатор печати
    await ctx.sendChatAction('typing');
    
    try {
      // Получаем ответ от AI
      const aiResponse = await apiService.getAIResponse(question, ctx.from.id);
      
      // Сохраняем запрос в базу данных
      const user = await db.getUserByTelegramId(ctx.from.id);
      if (user) {
        await db.saveAIRequest(user.id, question, aiResponse);
      }
      
      // Отправляем ответ
      await ctx.reply(`🤖 *AI-ответ:*\n\n${aiResponse}`, { 
        parse_mode: 'Markdown' 
      });
      
      // Предлагаем задать еще вопрос
      const keyboard = Markup.inlineKeyboard([
        [Markup.button.callback('🔄 Задать еще вопрос', 'ai_advice')],
        [Markup.button.callback('🏠 Главное меню', 'main_menu')]
      ]);
      
      await ctx.reply('💭 Есть еще вопросы? Или вернемся в главное меню?', keyboard);
      
    } catch (aiError) {
      console.error('Ошибка при обращении к AI:', aiError);
      
      // Fallback - случайный факт
      const fallbackResponse = await apiService.getRandomFact();
      
      await ctx.reply(`🤖 *Извините, AI временно недоступен*\n\nНо вот интересный факт:\n\n${fallbackResponse}`, { 
        parse_mode: 'Markdown' 
      });
      
      const keyboard = Markup.inlineKeyboard([
        [Markup.button.callback('🔄 Попробовать снова', 'ai_advice')],
        [Markup.button.callback('🏠 Главное меню', 'main_menu')]
      ]);
      
      await ctx.reply('Попробуйте еще раз или вернитесь в главное меню.', keyboard);
    }
    
    // Сбрасываем состояние AI
    ctx.session.aiState = null;
    
  } catch (error) {
    console.error('Ошибка в обработчике ai_text:', error);
    await ctx.reply('Произошла ошибка при обработке вопроса. Попробуйте позже.');
    if (ctx.session) {
      ctx.session.aiState = null;
    }
  }
};

module.exports = {
  aiAdviceHandler,
  aiTextHandler
};
