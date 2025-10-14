/**
 * Утилиты для форматирования текста и сообщений
 */

/**
 * Форматирование текста для Telegram
 */
const formatText = {
  bold: (text) => `*${text}*`,
  italic: (text) => `_${text}_`,
  code: (text) => `\`${text}\``,
  pre: (text) => `\`\`\`${text}\`\`\``,
  link: (text, url) => `[${text}](${url})`,
  mention: (username) => `@${username}`
};

/**
 * Форматирование результата квеста
 */
function formatQuestResult(score, totalQuestions, results) {
  const percentage = Math.round((score / (totalQuestions * 10)) * 100);
  const emoji = percentage >= 80 ? '🏆' : percentage >= 60 ? '🥈' : percentage >= 40 ? '🥉' : '📝';
  
  let message = `${emoji} *Результат квеста*\n\n`;
  message += `📊 Очки: ${score}/${totalQuestions * 10}\n`;
  message += `📈 Процент: ${percentage}%\n\n`;
  
  message += `📋 *Детали:*\n`;
  results.forEach((result, index) => {
    const status = result.isCorrect ? '✅' : '❌';
    message += `${status} Вопрос ${index + 1}: ${result.isCorrect ? 'Правильно' : 'Неправильно'}\n`;
  });
  
  if (percentage >= 80) {
    message += `\n🎉 Отличный результат! Вы настоящий знаток!`;
  } else if (percentage >= 60) {
    message += `\n👍 Хороший результат! Есть куда расти.`;
  } else if (percentage >= 40) {
    message += `\n📚 Неплохо! Попробуйте еще раз.`;
  } else {
    message += `\n💪 Не сдавайтесь! Учеба - это процесс.`;
  }
  
  return message;
}

/**
 * Форматирование таблицы лидеров
 */
function formatLeaderboard(leaderboard) {
  if (!leaderboard || leaderboard.length === 0) {
    return '🏆 *Таблица лидеров*\n\nПока никто не прошел квест. Станьте первым!';
  }
  
  let message = '🏆 *Таблица лидеров*\n\n';
  
  leaderboard.forEach((player, index) => {
    const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}.`;
    const name = player.first_name || player.username || 'Аноним';
    const date = new Date(player.completed_at).toLocaleDateString('ru-RU');
    
    message += `${medal} ${name}: ${player.score} очков (${date})\n`;
  });
  
  return message;
}

/**
 * Форматирование ответа ИИ
 */
function formatAIResponse(question, answer) {
  let message = `🤖 *Ответ ИИ*\n\n`;
  message += `❓ *Ваш вопрос:* ${question}\n\n`;
  message += `💡 *Ответ:* ${answer}`;
  
  return message;
}

/**
 * Форматирование информации о боте
 */
function formatAboutBot() {
  return `ℹ️ *О боте VELIZHANIN*

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

💬 *Поддержка:* @ana_freud`;
}

/**
 * Форматирование времени
 */
function formatTime(timestamp) {
  return new Date(timestamp).toLocaleString('ru-RU', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

/**
 * Экранирование специальных символов для Markdown
 */
function escapeMarkdown(text) {
  return text.replace(/[_*[\]()~`>#+=|{}.!-]/g, '\\$&');
}

/**
 * Безопасная отправка сообщения с Markdown
 */
function safeMarkdownMessage(text, parseMode = 'Markdown') {
  try {
    // Проверяем, что текст корректно парсится
    if (parseMode === 'Markdown') {
      // Простая проверка на корректность Markdown
      const asteriskCount = (text.match(/\*/g) || []).length;
      if (asteriskCount % 2 !== 0) {
        console.warn('Несбалансированные символы * в Markdown, отправляем без разметки');
        return { text, parse_mode: undefined };
      }
    }
    return { text, parse_mode: parseMode };
  } catch (error) {
    console.warn('Ошибка парсинга Markdown, отправляем без разметки:', error.message);
    return { text, parse_mode: undefined };
  }
}

/**
 * Обрезка текста
 */
function truncateText(text, maxLength = 100) {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3) + '...';
}

/**
 * Форматирование статистики
 */
function formatStats(stats) {
  return `📊 *Статистика бота*\n\n` +
         `👥 Пользователей: ${stats.users || 0}\n` +
         `🎯 Квестов пройдено: ${stats.quests || 0}\n` +
         `🤖 AI запросов: ${stats.aiRequests || 0}\n` +
         `💬 Отзывов: ${stats.feedback || 0}`;
}

module.exports = {
  formatText,
  formatQuestResult,
  formatLeaderboard,
  formatAIResponse,
  formatAboutBot,
  formatTime,
  escapeMarkdown,
  safeMarkdownMessage,
  truncateText,
  formatStats
};
