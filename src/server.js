const express = require('express');
const cors = require('cors');
const path = require('path');
const db = require('./services/db');

const app = express();
const PORT = process.env.PORT || 3000;
const API_BASE_PATH = process.env.API_BASE_PATH || '/api';

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

// API Routes
const api = express.Router();

// Проверка здоровья сервисов
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    services: {
      database: 'connected',
      server: 'running'
    }
  });
});

// Public config for frontend
app.get('/config', (req, res) => {
  res.json({
    apiBasePath: API_BASE_PATH
  });
});

// Получение таблицы лидеров (JSON)
api.get('/leaderboard', async (req, res) => {
  try {
    const leaderboard = await db.getQuestLeaderboard(20);
    res.json({
      success: true,
      data: leaderboard,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Ошибка при получении таблицы лидеров:', error);
    res.status(500).json({
      success: false,
      error: 'Ошибка при загрузке таблицы лидеров'
    });
  }
});

// Отправка обратной связи
api.post('/feedback', async (req, res) => {
  try {
    const { name, message, rating, userId } = req.body;
    
    if (!name || !message) {
      return res.status(400).json({
        success: false,
        error: 'Имя и сообщение обязательны'
      });
    }
    
    console.log('Получен отзыв:', { name, message, rating, userId });
    
    // Если userId не передан, создаем анонимную запись
    const result = await db.saveFeedback(userId || null, name, message, rating || 5);
    
    console.log('Отзыв сохранен с ID:', result);
    
    res.json({
      success: true,
      message: 'Спасибо за обратную связь!',
      id: result
    });
  } catch (error) {
    console.error('Ошибка при сохранении обратной связи:', error);
    res.status(500).json({
      success: false,
      error: 'Ошибка при сохранении обратной связи'
    });
  }
});

// Получение всех отзывов
api.get('/feedback', async (req, res) => {
  try {
    const feedback = await db.getFeedback();
    res.json({
      success: true,
      data: feedback,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Ошибка при получении отзывов:', error);
    res.status(500).json({
      success: false,
      error: 'Ошибка при загрузке отзывов'
    });
  }
});

// Статистика бота
api.get('/stats', async (req, res) => {
  try {
    const leaderboard = await db.getQuestLeaderboard(100);
    const feedback = await db.getFeedback();
    
    const totalPlayers = leaderboard.length;
    const totalFeedback = feedback.length;
    const averageScore = leaderboard.length > 0 
      ? Math.round(leaderboard.reduce((sum, player) => sum + player.score, 0) / leaderboard.length)
      : 0;
    
    res.json({
      success: true,
      data: {
        totalPlayers,
        totalFeedback,
        averageScore,
        topPlayer: leaderboard[0] || null
      }
    });
  } catch (error) {
    console.error('Ошибка при получении статистики:', error);
    res.status(500).json({
      success: false,
      error: 'Ошибка при загрузке статистики'
    });
  }
});

// Mount API router
app.use(API_BASE_PATH, api);

// Главная страница Mini App
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Обработка 404
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Страница не найдена'
  });
});

// Обработка ошибок
app.use((error, req, res, next) => {
  console.error('Ошибка сервера:', error);
  res.status(500).json({
    success: false,
    error: 'Внутренняя ошибка сервера'
  });
});

// Запуск сервера
app.listen(PORT, () => {
  console.log(`🌐 Сервер запущен на порту ${PORT}`);
  console.log(`📱 Mini App доступен по адресу: http://localhost:${PORT}`);
});

module.exports = app;
