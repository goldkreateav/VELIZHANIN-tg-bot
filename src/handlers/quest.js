const { Markup } = require('telegraf');
const apiService = require('../services/api');
const db = require('../services/db');

// Функция для показа вопроса квеста
async function showQuestQuestion(ctx, questionIndex) {
  const questions = ctx.session.questQuestions;
  const question = questions[questionIndex];
  
  const message = `🎯 *Вопрос ${questionIndex + 1} из ${questions.length}*\n\n${question.question}`;
  
  const keyboard = {
    inline_keyboard: question.options.map((option, index) => [
      {
        text: `${String.fromCharCode(65 + index)}. ${option}`,
        callback_data: `quest_answer_${questionIndex}_${index}`
      }
    ])
  };
  
  await ctx.reply(message, { 
    parse_mode: 'Markdown',
    reply_markup: keyboard 
  });
}

// Функция для завершения квеста
async function finishQuest(ctx) {
  // Проверяем, что у нас есть все необходимые данные
  if (!ctx.session || !ctx.session.questQuestions || !ctx.session.questAnswers) {
    await ctx.reply('Ошибка: данные квеста не найдены. Начните новый квест.');
    return;
  }
  
  const questions = ctx.session.questQuestions;
  const answers = ctx.session.questAnswers;
  
  // Рассчитываем результат
  const result = apiService.calculateQuestScore(answers, questions);
  
  // Получаем пользователя из базы данных
  const user = await db.getUserByTelegramId(ctx.from.id);
  if (user) {
    // Сохраняем результат в базу данных
    await db.saveQuestResult(user.id, result.score, result.results);
  }
  
  // Формируем сообщение с результатами
  let resultMessage = `🎉 *Квест завершен!*\n\n`;
  resultMessage += `📊 *Ваш результат: ${result.score}/${questions.length * 10} очков*\n\n`;
  
  resultMessage += `📝 *Подробные результаты:*\n`;
  result.results.forEach((item, index) => {
    const emoji = item.isCorrect ? '✅' : '❌';
    const userAnswerText = questions[index].options[item.userAnswer];
    const correctAnswerText = questions[index].options[item.correctAnswer];
    
    resultMessage += `${emoji} *Вопрос ${index + 1}:* ${item.question}\n`;
    resultMessage += `Ваш ответ: ${userAnswerText}\n`;
    if (!item.isCorrect) {
      resultMessage += `Правильный ответ: ${correctAnswerText}\n`;
    }
    resultMessage += `${item.explanation}\n\n`;
  });
  
  // Определяем оценку
  const percentage = (result.score / (questions.length * 10)) * 100;
  let grade = '';
  if (percentage >= 80) grade = 'Отлично! 🏆';
  else if (percentage >= 60) grade = 'Хорошо! 👍';
  else if (percentage >= 40) grade = 'Удовлетворительно 📚';
  else grade = 'Нужно подучиться 📖';
  
  resultMessage += `🎯 *Оценка: ${grade}*\n\n`;
  resultMessage += `💡 Хотите попробовать еще раз или перейти к другим функциям?`;
  
  const keyboard = {
    inline_keyboard: [
      [
        { text: '🔄 Пройти квест снова', callback_data: 'quest_start' },
        { text: '🏆 Таблица лидеров', callback_data: 'leaderboard' }
      ],
      [
        { text: '🏠 Главное меню', callback_data: 'main_menu' }
      ]
    ]
  };
  
  await ctx.reply(resultMessage, { 
    parse_mode: 'Markdown',
    reply_markup: keyboard 
  });
  
  // Очищаем состояние квеста
  ctx.session.questState = 'completed';
}

// Обработчик запуска квеста
const questStartHandler = async (ctx) => {
  try {
    await ctx.answerCbQuery();
    
    // Инициализируем сессию для квеста
    if (!ctx.session) {
      ctx.session = {};
    }
    ctx.session.questState = 'starting';
    ctx.session.questAnswers = [];
    ctx.session.questCurrentQuestion = 0;
    
    // Получаем вопросы из API
    const questions = apiService.generateQuestQuestions();
    ctx.session.questQuestions = questions;
    
    // Показываем первый вопрос
    await showQuestQuestion(ctx, 0);
    
  } catch (error) {
    console.error('Ошибка в обработчике quest_start:', error);
    await ctx.reply('Произошла ошибка при запуске квеста. Попробуйте позже.');
  }
};

// Обработчик ответов на вопросы квеста
const questAnswerHandler = async (ctx) => {
  try {
    await ctx.answerCbQuery();
    
    // Проверяем и инициализируем сессию
    if (!ctx.session) {
      ctx.session = {};
    }
    
    // Проверяем, что квест активен
    if (!ctx.session.questState || ctx.session.questState !== 'starting') {
      await ctx.reply('Квест не активен. Начните новый квест с главного меню.');
      return;
    }
    
    const callbackData = ctx.callbackQuery.data;
    const [, , questionIndex, answerIndex] = callbackData.split('_');
    
    const questionIdx = parseInt(questionIndex);
    const answerIdx = parseInt(answerIndex);
    
    // Инициализируем массив ответов если его нет
    if (!ctx.session.questAnswers) {
      ctx.session.questAnswers = [];
    }
    
    // Сохраняем ответ
    ctx.session.questAnswers[questionIdx] = answerIdx;
    
    // Проверяем, что у нас есть вопросы
    if (!ctx.session.questQuestions || ctx.session.questQuestions.length === 0) {
      await ctx.reply('Ошибка: вопросы квеста не загружены. Начните новый квест.');
      return;
    }
    
    // Проверяем, есть ли еще вопросы
    if (questionIdx + 1 < ctx.session.questQuestions.length) {
      // Переходим к следующему вопросу
      ctx.session.questCurrentQuestion = questionIdx + 1;
      await showQuestQuestion(ctx, questionIdx + 1);
    } else {
      // Завершаем квест
      await finishQuest(ctx);
    }
    
  } catch (error) {
    console.error('Ошибка в обработчике quest_answer:', error);
    await ctx.reply('Произошла ошибка при обработке ответа. Попробуйте позже.');
  }
};

module.exports = {
  questStartHandler,
  questAnswerHandler,
  showQuestQuestion,
  finishQuest
};
