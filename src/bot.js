const { Telegraf, session, Markup } = require('telegraf');
const { authMiddleware } = require('./middlewares/auth');
const { loggerMiddleware } = require('./middlewares/logger');

// Импорт команд
const startCommand = require('./commands/start');
const helpCommand = require('./commands/help');
const pingCommand = require('./commands/ping');

// Импорт обработчиков
const { questStartHandler, questAnswerHandler } = require('./handlers/quest');
const { aiAdviceHandler, aiTextHandler } = require('./handlers/ai');
const { leaderboardHandler } = require('./handlers/leaderboard');
const { mainMenuHandler } = require('./handlers/mainMenu');
const { feedbackStartHandler, feedbackTextHandler } = require('./handlers/feedback');

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
bot.action('quest_start', questStartHandler);
bot.action(/^quest_answer_/, questAnswerHandler);
bot.action('ai_advice', aiAdviceHandler);
bot.action('leaderboard', leaderboardHandler);
bot.action('main_menu', mainMenuHandler);
bot.action('feedback_start', feedbackStartHandler);

// Обработчик информации о Mini App
bot.action('mini_app_info', async (ctx) => {
  try {
    await ctx.answerCbQuery();
    
    const message = `📱 *Информация о Mini App*

Mini App работает только с HTTPS ссылками в продакшене.

🔧 *Для локальной разработки:*
• Откройте браузер
• Перейдите по адресу: http://localhost:3000
• Протестируйте все функции

🚀 *Для продакшена:*
• Задеплойте приложение на Heroku/Vercel
• Получите HTTPS URL
• Добавьте URL в переменную MINI_APP_URL

📊 *Возможности Mini App:*
• Таблица лидеров в реальном времени
• Форма обратной связи
• Статистика бота
• Адаптивный дизайн под Telegram`;

    const keyboard = Markup.inlineKeyboard([
      [Markup.button.callback('🏠 Главное меню', 'main_menu')]
    ]);
    
    await ctx.reply(message, { 
      parse_mode: 'Markdown',
      ...keyboard 
    });
    
  } catch (error) {
    console.error('Ошибка в обработчике mini_app_info:', error);
    await ctx.reply('Произошла ошибка. Попробуйте позже.');
  }
});

// Обработчик текстовых сообщений
bot.on('text', async (ctx) => {
  // Проверяем, в каком режиме находится пользователь
  if (ctx.session && ctx.session.feedbackState) {
    // Обрабатываем как обратную связь
    await feedbackTextHandler(ctx);
  } else {
    // Обрабатываем как AI запрос
    await aiTextHandler(ctx);
  }
});

bot.action('about', async (ctx) => {
  try {
    await ctx.answerCbQuery();
    
    // Используем простой текст без Markdown для избежания ошибок парсинга
    const aboutMessage = `ℹ️ О боте VELIZHANIN

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

💬 Поддержка: @goldreateav`;
    
    await ctx.reply(aboutMessage);
  } catch (error) {
    console.error('Ошибка в обработчике about:', error);
    await ctx.reply('Произошла ошибка при загрузке информации о боте.');
  }
});

// Обработка ошибок
bot.catch((err, ctx) => {
  console.error('Ошибка в боте:', err);
  ctx.reply('Произошла ошибка. Попробуйте позже.');
});

module.exports = { bot };
