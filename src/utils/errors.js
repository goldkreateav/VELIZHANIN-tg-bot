/**
 * Утилиты для обработки ошибок
 */

/**
 * Класс пользовательских ошибок бота
 */
class BotError extends Error {
  constructor(message, code = 'BOT_ERROR', statusCode = 500) {
    super(message);
    this.name = 'BotError';
    this.code = code;
    this.statusCode = statusCode;
  }
}

/**
 * Класс ошибок API
 */
class APIError extends Error {
  constructor(message, service = 'UNKNOWN', statusCode = 500) {
    super(message);
    this.name = 'APIError';
    this.service = service;
    this.statusCode = statusCode;
  }
}

/**
 * Обработчик ошибок для бота
 */
function handleBotError(error, ctx) {
  console.error('Ошибка в боте:', {
    error: error.message,
    stack: error.stack,
    userId: ctx.from?.id,
    username: ctx.from?.username,
    timestamp: new Date().toISOString()
  });

  // Отправляем пользователю понятное сообщение
  let userMessage = '❌ Произошла ошибка. Попробуйте позже.';
  
  if (error instanceof BotError) {
    switch (error.code) {
      case 'INVALID_INPUT':
        userMessage = '❌ Неверный формат данных. Попробуйте еще раз.';
        break;
      case 'QUEST_NOT_FOUND':
        userMessage = '❌ Квест не найден. Начните новый квест.';
        break;
      case 'AI_SERVICE_ERROR':
        userMessage = '🤖 Сервис ИИ временно недоступен. Попробуйте позже.';
        break;
      case 'DATABASE_ERROR':
        userMessage = '💾 Ошибка базы данных. Попробуйте позже.';
        break;
      default:
        userMessage = `❌ ${error.message}`;
    }
  } else if (error instanceof APIError) {
    switch (error.service) {
      case 'OPENAI':
        userMessage = '🤖 Сервис ИИ недоступен. Попробуйте позже.';
        break;
      case 'DATABASE':
        userMessage = '💾 Ошибка базы данных. Попробуйте позже.';
        break;
      default:
        userMessage = '🌐 Внешний сервис недоступен. Попробуйте позже.';
    }
  }

  // Отправляем сообщение пользователю
  ctx.reply(userMessage).catch(console.error);
}

/**
 * Валидация входных данных
 */
function validateInput(data, rules) {
  const errors = [];

  for (const [field, rule] of Object.entries(rules)) {
    const value = data[field];

    if (rule.required && (!value || value.toString().trim() === '')) {
      errors.push(`Поле "${field}" обязательно для заполнения`);
    }

    if (value && rule.minLength && value.length < rule.minLength) {
      errors.push(`Поле "${field}" должно содержать минимум ${rule.minLength} символов`);
    }

    if (value && rule.maxLength && value.length > rule.maxLength) {
      errors.push(`Поле "${field}" должно содержать максимум ${rule.maxLength} символов`);
    }

    if (value && rule.pattern && !rule.pattern.test(value)) {
      errors.push(`Поле "${field}" имеет неверный формат`);
    }

    if (value && rule.type) {
      switch (rule.type) {
        case 'number':
          if (isNaN(value)) {
            errors.push(`Поле "${field}" должно быть числом`);
          }
          break;
        case 'email':
          if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
            errors.push(`Поле "${field}" должно быть валидным email`);
          }
          break;
      }
    }
  }

  return errors;
}

/**
 * Безопасное выполнение асинхронных операций
 */
async function safeAsync(fn, fallback = null) {
  try {
    return await fn();
  } catch (error) {
    console.error('Ошибка в safeAsync:', error);
    return fallback;
  }
}

/**
 * Retry механизм для повторных попыток
 */
async function retry(fn, maxAttempts = 3, delay = 1000) {
  let lastError;
  
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      console.log(`Попытка ${attempt}/${maxAttempts} неудачна:`, error.message);
      
      if (attempt < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, delay * attempt));
      }
    }
  }
  
  throw lastError;
}

/**
 * Проверка доступности сервиса
 */
async function checkServiceHealth(serviceName, checkFn) {
  try {
    await checkFn();
    return { service: serviceName, status: 'healthy', timestamp: new Date().toISOString() };
  } catch (error) {
    return { 
      service: serviceName, 
      status: 'unhealthy', 
      error: error.message,
      timestamp: new Date().toISOString() 
    };
  }
}

/**
 * Форматирование ошибки для логирования
 */
function formatErrorForLog(error, context = {}) {
  return {
    name: error.name,
    message: error.message,
    stack: error.stack,
    code: error.code,
    service: error.service,
    statusCode: error.statusCode,
    context,
    timestamp: new Date().toISOString()
  };
}

module.exports = {
  BotError,
  APIError,
  handleBotError,
  validateInput,
  safeAsync,
  retry,
  checkServiceHealth,
  formatErrorForLog
};
