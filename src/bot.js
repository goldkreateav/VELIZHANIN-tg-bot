const { Telegraf, session } = require('telegraf');
const { authMiddleware } = require('./middlewares/auth');
const { loggerMiddleware } = require('./middlewares/logger');

// Импорт команд
const startCommand = require('./commands/start');
const helpCommand = require('./commands/help');
const pingCommand = require('./commands/ping');

// Импорт утилит
const { safeMarkdownMessage } = require('./utils/format');

// Создание экземпляра бота
const bot = new Telegraf(process.env.BOT_TOKEN);

// Middleware для сессий
bot.use(session());

// Middleware для логирования
bot.use(loggerMiddleware);

// Middleware для аутентификации (опционально)
bot.use(authMiddleware);

// Регистрация команд
bot.command('start', startCommand);
bot.command('help', helpCommand);
bot.command('ping', pingCommand);

// Обработчики callback-кнопок
bot.action('quest_start', async (ctx) => {
  try {
    await ctx.answerCbQuery();
    await ctx.reply('🎯 Квест скоро будет доступен! Пока что можете попробовать другие функции.');
  } catch (error) {
    console.error('Ошибка в обработчике quest_start:', error);
  }
});

bot.action('ai_advice', async (ctx) => {
  try {
    await ctx.answerCbQuery();
    await ctx.reply('🤖 AI-советник скоро будет доступен! Пока что можете попробовать команду /help.');
  } catch (error) {
    console.error('Ошибка в обработчике ai_advice:', error);
  }
});

bot.action('about', async (ctx) => {
  try {
    await ctx.answerCbQuery();
    const aboutMessage = `ℹ️ *О боте VELIZHANIN*

🎯 *Возможности:*
• Интерактивный квест с вопросами
• AI-советник на базе OpenAI
• Таблица лидеров
• Мини-приложение для обратной связи

🚀 *Технологии:*
• Node.js + Telegraf
• SQLite база данных
• OpenAI GPT-3.5
• Telegram Mini App

👨‍💻 *Разработано для:* Студия VELIZHANIN

💬 *Поддержка:* ana_freud`;
    
    await ctx.reply(aboutMessage, safeMarkdownMessage(aboutMessage));
  } catch (error) {
    console.error('Ошибка в обработчике about:', error);
    // Fallback без Markdown
    await ctx.reply(`ℹ️ О боте VELIZHANIN

🎯 Возможности:
• Интерактивный квест с вопросами
• AI-советник на базе OpenAI
• Таблица лидеров
• Мини-приложение для обратной связи

🚀 Технологии:
• Node.js + Telegraf
• SQLite база данных
• OpenAI GPT-3.5
• Telegram Mini App

👨‍💻 Разработано для: Студия VELIZHANIN

💬 Поддержка: @goldreateav`);
  }
});

// Обработка ошибок
bot.catch((err, ctx) => {
  console.error('Ошибка в боте:', err);
  ctx.reply('Произошла ошибка. Попробуйте позже.');
});

module.exports = { bot };
