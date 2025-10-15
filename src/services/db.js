const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

class DatabaseService {
  constructor() {
    // Создаем папку для данных, если её нет
    const dataDir = path.dirname(process.env.DB_PATH || './data/bot.db');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    this.dbPath = process.env.DB_PATH || './data/bot.db';
    this.db = new sqlite3.Database(this.dbPath);
    this.init();
  }

  init() {
    // Создаем таблицы при первом запуске
    this.db.serialize(() => {
      // Таблица пользователей
      this.db.run(`
        CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY,
          telegram_id INTEGER UNIQUE NOT NULL,
          username TEXT,
          first_name TEXT,
          last_name TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          last_activity DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Таблица результатов квеста
      this.db.run(`
        CREATE TABLE IF NOT EXISTS quest_results (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER,
          score INTEGER DEFAULT 0,
          answers TEXT, -- JSON с ответами
          completed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users (id)
        )
      `);

      // Таблица запросов к ИИ
      this.db.run(`
        CREATE TABLE IF NOT EXISTS ai_requests (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER,
          question TEXT,
          answer TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users (id)
        )
      `);

      // Таблица для мини-приложения (обратная связь)
      this.db.run(`
        CREATE TABLE IF NOT EXISTS feedback (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER,
          name TEXT NOT NULL,
          message TEXT NOT NULL,
          rating INTEGER DEFAULT 5,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);
    });
  }

  // Методы для работы с пользователями
  async createOrUpdateUser(telegramUser) {
    return new Promise((resolve, reject) => {
      const stmt = this.db.prepare(`
        INSERT OR REPLACE INTO users (telegram_id, username, first_name, last_name, last_activity)
        VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
      `);
      
      stmt.run([
        telegramUser.id,
        telegramUser.username || null,
        telegramUser.first_name || null,
        telegramUser.last_name || null
      ], function(err) {
        if (err) reject(err);
        else resolve(this.lastID);
      });
      
      stmt.finalize();
    });
  }

  async getUserByTelegramId(telegramId) {
    return new Promise((resolve, reject) => {
      this.db.get(
        'SELECT * FROM users WHERE telegram_id = ?',
        [telegramId],
        (err, row) => {
          if (err) reject(err);
          else resolve(row);
        }
      );
    });
  }

  // Методы для квеста
  async saveQuestResult(userId, score, answers) {
    return new Promise((resolve, reject) => {
      const stmt = this.db.prepare(`
        INSERT INTO quest_results (user_id, score, answers)
        VALUES (?, ?, ?)
      `);
      
      stmt.run([userId, score, JSON.stringify(answers)], function(err) {
        if (err) reject(err);
        else resolve(this.lastID);
      });
      
      stmt.finalize();
    });
  }

  async getQuestLeaderboard(limit = 10) {
    return new Promise((resolve, reject) => {
      this.db.all(`
        SELECT u.first_name, u.username, qr.score, qr.completed_at
        FROM quest_results qr
        JOIN users u ON qr.user_id = u.id
        ORDER BY qr.score DESC, qr.completed_at ASC
        LIMIT ?
      `, [limit], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }

  // Методы для ИИ
  async saveAIRequest(userId, question, answer) {
    return new Promise((resolve, reject) => {
      const stmt = this.db.prepare(`
        INSERT INTO ai_requests (user_id, question, answer)
        VALUES (?, ?, ?)
      `);
      
      stmt.run([userId, question, answer], function(err) {
        if (err) reject(err);
        else resolve(this.lastID);
      });
      
      stmt.finalize();
    });
  }

  // Методы для обратной связи
  async saveFeedback(userId, name, message, rating) {
    return new Promise((resolve, reject) => {
      const stmt = this.db.prepare(`
        INSERT INTO feedback (user_id, name, message, rating)
        VALUES (?, ?, ?, ?)
      `);
      
      stmt.run([userId, name, message, rating], function(err) {
        if (err) reject(err);
        else resolve(this.lastID);
      });
      
      stmt.finalize();
    });
  }

  async getFeedback() {
    return new Promise((resolve, reject) => {
      this.db.all(`
        SELECT f.name, f.message, f.rating, f.created_at, u.first_name
        FROM feedback f
        JOIN users u ON f.user_id = u.id
        ORDER BY f.created_at DESC
      `, (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }

  close() {
    this.db.close();
  }
}

module.exports = new DatabaseService();
