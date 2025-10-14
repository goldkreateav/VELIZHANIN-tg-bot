/**
 * Middleware для базовой аутентификации пользователей
 */

const authMiddleware = (ctx, next) => {
  // Проверяем, что пользователь авторизован в Telegram
  if (!ctx.from) {
    console.log('Попытка доступа без авторизации Telegram');
    return ctx.reply('❌ Ошибка авторизации. Пожалуйста, начните с команды /start');
  }

  // Логируем информацию о пользователе
  const userInfo = {
    id: ctx.from.id,
    username: ctx.from.username,
    firstName: ctx.from.first_name,
    lastName: ctx.from.last_name
  };

  // Сохраняем информацию о пользователе в контексте
  ctx.user = userInfo;

  // Проверяем, есть ли пользователь в базе данных
  // В первой итерации просто пропускаем всех авторизованных пользователей
  console.log(`Пользователь ${userInfo.firstName} (ID: ${userInfo.id}) использует бота`);
  
  return next();
};

module.exports = { authMiddleware };
