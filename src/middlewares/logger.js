/**
 * Middleware для логирования действий пользователей
 */

const loggerMiddleware = (ctx, next) => {
  const timestamp = new Date().toISOString();
  const userId = ctx.from?.id || 'unknown';
  const username = ctx.from?.username || ctx.from?.first_name || 'unknown';
  const messageType = ctx.message?.text ? 'text' : ctx.callbackQuery ? 'callback' : 'other';
  const messageContent = ctx.message?.text || ctx.callbackQuery?.data || 'unknown';

  // Логируем входящие сообщения
  console.log(`[${timestamp}] User ${username} (${userId}): ${messageType} - "${messageContent}"`);

  // Добавляем обработку ошибок для логирования
  const originalReply = ctx.reply;
  ctx.reply = async function(...args) {
    try {
      const result = await originalReply.apply(this, args);
      console.log(`[${timestamp}] Bot reply to ${username} (${userId})`);
      return result;
    } catch (error) {
      console.error(`[${timestamp}] Error replying to ${username} (${userId}):`, error);
      throw error;
    }
  };

  return next();
};

module.exports = { loggerMiddleware };
