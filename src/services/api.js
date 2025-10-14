const OpenAI = require('openai');
const axios = require('axios');

class APIService {
  constructor() {
    // Инициализация OpenAI
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });
  }

  /**
   * Получение ответа от OpenAI
   */
  async getAIResponse(question, userId = null) {
    try {
      if (!process.env.OPENAI_API_KEY) {
        throw new Error('OpenAI API key не настроен');
      }

      const completion = await this.openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: `Ты - полезный AI-ассистент в Telegram боте VELIZHANIN. 
            Отвечай кратко, дружелюбно и по делу. Максимум 200 слов. 
            Если вопрос не по теме, вежливо предложи перейти к теме бота.`
          },
          {
            role: "user",
            content: question
          }
        ],
        max_tokens: 300,
        temperature: 0.7
      });

      return completion.choices[0].message.content;
    } catch (error) {
      console.error('Ошибка при обращении к OpenAI:', error);
      throw new Error('Не удалось получить ответ от ИИ. Попробуйте позже.');
    }
  }

  /**
   * Получение случайного факта (fallback если нет OpenAI)
   */
  async getRandomFact() {
    try {
      const response = await axios.get('https://api.chucknorris.io/jokes/random');
      return response.data.value;
    } catch (error) {
      console.error('Ошибка при получении случайного факта:', error);
      return 'Сегодня отличный день для изучения чего-то нового! 🌟';
    }
  }

  /**
   * Получение погоды (дополнительная функция)
   */
  async getWeather(city = 'Moscow') {
    try {
      // Здесь можно добавить реальный API погоды
      return {
        city,
        temperature: Math.floor(Math.random() * 30) - 5,
        description: 'Облачно с прояснениями',
        humidity: Math.floor(Math.random() * 100),
        wind: Math.floor(Math.random() * 20)
      };
    } catch (error) {
      console.error('Ошибка при получении погоды:', error);
      return null;
    }
  }

  /**
   * Проверка доступности API
   */
  async checkAPIHealth() {
    const results = {
      openai: false,
      randomFact: false,
      weather: false
    };

    try {
      // Проверка OpenAI
      if (process.env.OPENAI_API_KEY) {
        await this.openai.models.list();
        results.openai = true;
      }
    } catch (error) {
      console.log('OpenAI API недоступен:', error.message);
    }

    try {
      // Проверка Chuck Norris API
      await axios.get('https://api.chucknorris.io/jokes/random', { timeout: 5000 });
      results.randomFact = true;
    } catch (error) {
      console.log('Chuck Norris API недоступен:', error.message);
    }

    try {
      // Проверка погодного API
      await this.getWeather();
      results.weather = true;
    } catch (error) {
      console.log('Weather API недоступен:', error.message);
    }

    return results;
  }

  /**
   * Генерация вопросов для квеста
   */
  generateQuestQuestions() {
    return [
      {
        id: 1,
        question: "Какая планета ближайшая к Солнцу?",
        options: ["Венера", "Меркурий", "Земля", "Марс"],
        correct: 1,
        explanation: "Меркурий - самая близкая к Солнцу планета в нашей солнечной системе."
      },
      {
        id: 2,
        question: "В каком году был создан первый iPhone?",
        options: ["2005", "2006", "2007", "2008"],
        correct: 2,
        explanation: "Первый iPhone был представлен Стивом Джобсом 9 января 2007 года."
      },
      {
        id: 3,
        question: "Сколько костей в теле взрослого человека?",
        options: ["186", "206", "226", "246"],
        correct: 1,
        explanation: "В теле взрослого человека 206 костей. У новорожденных их больше, но многие срастаются."
      }
    ];
  }

  /**
   * Расчет результата квеста
   */
  calculateQuestScore(answers, questions) {
    let score = 0;
    const results = [];

    answers.forEach((answer, index) => {
      const question = questions[index];
      const isCorrect = answer === question.correct;
      
      if (isCorrect) {
        score += 10; // 10 очков за правильный ответ
      }

      results.push({
        question: question.question,
        userAnswer: answer,
        correctAnswer: question.correct,
        isCorrect,
        explanation: question.explanation
      });
    });

    return { score, results };
  }
}

module.exports = new APIService();
