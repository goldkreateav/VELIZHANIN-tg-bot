const { Markup } = require('telegraf');
const db = require('../services/db');

// Обработчик запуска формы обратной связи
const feedbackStartHandler = async (ctx) => {
  try {
    await ctx.answerCbQuery();
    
    // Инициализируем сессию для обратной связи
    if (!ctx.session) {
      ctx.session = {};
    }
    ctx.session.feedbackState = 'waiting_name';
    
    const message = `💬 *Обратная связь*\n\nПоделитесь своими впечатлениями о боте!\n\nДля начала введите ваше имя:`;
    
    const keyboard = Markup.inlineKeyboard([
      [Markup.button.callback('🏠 Главное меню', 'main_menu')]
    ]);
    
    await ctx.reply(message, { 
      parse_mode: 'Markdown',
      ...keyboard 
    });
    
  } catch (error) {
    console.error('Ошибка в обработчике feedback_start:', error);
    await ctx.reply('Произошла ошибка при запуске формы обратной связи. Попробуйте позже.');
  }
};

// Обработчик текстовых сообщений для обратной связи
const feedbackTextHandler = async (ctx) => {
  try {
    // Проверяем, что пользователь в режиме обратной связи
    if (!ctx.session || !ctx.session.feedbackState) {
      return;
    }
    
    const text = ctx.message.text.trim();
    
    switch (ctx.session.feedbackState) {
      case 'waiting_name':
        ctx.session.feedbackName = text;
        ctx.session.feedbackState = 'waiting_message';
        
        await ctx.reply('📝 Отлично! Теперь напишите ваше сообщение или отзыв:');
        break;
        
      case 'waiting_message':
        ctx.session.feedbackMessage = text;
        ctx.session.feedbackState = 'waiting_rating';
        
        const ratingMessage = `⭐ Оцените бота от 1 до 5 звезд:\n\n1⭐ - Плохо\n2⭐ - Не очень\n3⭐ - Нормально\n4⭐ - Хорошо\n5⭐ - Отлично!\n\nОтправьте цифру от 1 до 5:`;
        
        await ctx.reply(ratingMessage);
        break;
        
      case 'waiting_rating':
        const rating = parseInt(text);
        
        if (isNaN(rating) || rating < 1 || rating > 5) {
          await ctx.reply('❌ Пожалуйста, введите цифру от 1 до 5:');
          return;
        }
        
        ctx.session.feedbackRating = rating;
        
        // Сохраняем отзыв
        try {
          const user = await db.getUserByTelegramId(ctx.from.id);
          const userId = user ? user.id : null;
          
          await db.saveFeedback(userId, ctx.session.feedbackName, ctx.session.feedbackMessage, rating);
          
          const thankMessage = `🎉 *Спасибо за отзыв!*\n\nВаше мнение очень важно для нас!\n\n*Имя:* ${ctx.session.feedbackName}\n*Оценка:* ${'⭐'.repeat(rating)}\n*Сообщение:* ${ctx.session.feedbackMessage}`;
          
          const keyboard = Markup.inlineKeyboard([
            [Markup.button.callback('🏠 Главное меню', 'main_menu')]
          ]);
          
          await ctx.reply(thankMessage, { 
            parse_mode: 'Markdown',
            ...keyboard 
          });
          
        } catch (error) {
          console.error('Ошибка при сохранении отзыва:', error);
          await ctx.reply('Произошла ошибка при сохранении отзыва. Попробуйте позже.');
        }
        
        // Очищаем состояние
        ctx.session.feedbackState = null;
        ctx.session.feedbackName = null;
        ctx.session.feedbackMessage = null;
        ctx.session.feedbackRating = null;
        break;
    }
    
  } catch (error) {
    console.error('Ошибка в обработчике feedback_text:', error);
    await ctx.reply('Произошла ошибка при обработке отзыва. Попробуйте позже.');
    if (ctx.session) {
      ctx.session.feedbackState = null;
    }
  }
};

module.exports = {
  feedbackStartHandler,
  feedbackTextHandler
};
