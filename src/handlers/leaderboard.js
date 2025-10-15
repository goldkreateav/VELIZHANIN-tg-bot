const { Markup } = require('telegraf');
const db = require('../services/db');

// Обработчик таблицы лидеров
const leaderboardHandler = async (ctx) => {
  try {
    await ctx.answerCbQuery();
    
    const leaderboard = await db.getQuestLeaderboard(10);
    
    if (leaderboard.length === 0) {
      const message = `🏆 *Таблица лидеров*\n\nПока никто не прошел квест.\nСтаньте первым! 🎯`;
      
      const keyboard = Markup.inlineKeyboard([
        [Markup.button.callback('🎯 Пройти квест', 'quest_start')],
        [Markup.button.callback('🏠 Главное меню', 'main_menu')]
      ]);
      
      await ctx.reply(message, { 
        parse_mode: 'Markdown',
        ...keyboard 
      });
      return;
    }
    
    let message = `🏆 *Таблица лидеров*\n\n`;
    
    leaderboard.forEach((player, index) => {
      const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '🏅';
      const name = player.first_name || player.username || 'Аноним';
      const date = new Date(player.completed_at).toLocaleDateString('ru-RU');
      
      message += `${medal} *${index + 1}.* ${name} - ${player.score} очков\n`;
      message += `   📅 ${date}\n\n`;
    });
    
    message += `💡 Хотите попасть в таблицу? Пройдите квест!`;
    
    const keyboard = Markup.inlineKeyboard([
      [Markup.button.callback('🎯 Пройти квест', 'quest_start')],
      [Markup.button.callback('🔄 Обновить таблицу', 'leaderboard')],
      [Markup.button.callback('🏠 Главное меню', 'main_menu')]
    ]);
    
    await ctx.reply(message, { 
      parse_mode: 'Markdown',
      ...keyboard 
    });
    
  } catch (error) {
    console.error('Ошибка в обработчике leaderboard:', error);
    await ctx.reply('Произошла ошибка при загрузке таблицы лидеров. Попробуйте позже.');
  }
};

module.exports = {
  leaderboardHandler
};
