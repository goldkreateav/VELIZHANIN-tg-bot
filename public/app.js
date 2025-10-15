// Telegram Web App API
const tg = window.Telegram.WebApp;

// Инициализация приложения
document.addEventListener('DOMContentLoaded', function() {
    // Инициализируем Telegram Web App
    tg.ready();
    tg.expand();
    
    // Настраиваем тему
    document.body.style.setProperty('--tg-theme-bg-color', tg.themeParams.bg_color || '#ffffff');
    document.body.style.setProperty('--tg-theme-text-color', tg.themeParams.text_color || '#000000');
    document.body.style.setProperty('--tg-theme-button-color', tg.themeParams.button_color || '#2481cc');
    document.body.style.setProperty('--tg-theme-button-text-color', tg.themeParams.button_text_color || '#ffffff');
    document.body.style.setProperty('--tg-theme-secondary-bg-color', tg.themeParams.secondary_bg_color || '#f8f9fa');
    document.body.style.setProperty('--tg-theme-hint-color', tg.themeParams.hint_color || '#999999');
    
    // Загружаем начальные данные
    loadLeaderboard();
    loadFeedback();
    loadStats();
    
    // Настраиваем обработчики форм
    setupEventListeners();

    // Навигация без inline-обработчиков
    document.querySelectorAll('.nav-btn').forEach((btn) => {
        btn.addEventListener('click', (ev) => {
            const tabName = btn.getAttribute('data-tab');
            showTab(tabName, ev);
        });
    });

    // Кнопки обновления
    const lbRefresh = document.getElementById('leaderboard-refresh');
    if (lbRefresh) lbRefresh.addEventListener('click', loadLeaderboard);
    const statsRefresh = document.getElementById('stats-refresh');
    if (statsRefresh) statsRefresh.addEventListener('click', loadStats);
});

// Навигация по табам
function showTab(tabName, ev) {
    // Скрываем все табы
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Убираем активный класс с кнопок
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Показываем выбранный таб
    document.getElementById(tabName).classList.add('active');
    
    // Активируем соответствующую кнопку
    if (ev && ev.target) {
        ev.target.classList.add('active');
    } else {
        const btn = document.querySelector(`.nav-btn[data-tab="${tabName}"]`);
        if (btn) btn.classList.add('active');
    }
    
    // Загружаем данные для таба
    switch(tabName) {
        case 'leaderboard':
            document.body.classList.remove('doom-active');
            loadLeaderboard();
            break;
        case 'feedback':
            document.body.classList.remove('doom-active');
            loadFeedback();
            break;
        case 'stats':
            document.body.classList.remove('doom-active');
            loadStats();
            break;
        case 'doom':
            // Растягиваем контейнер на весь экран для удобства
            document.body.classList.add('doom-active');
            break;
    }
}

// Загрузка таблицы лидеров
async function loadLeaderboard() {
    const content = document.getElementById('leaderboard-content');
    content.innerHTML = '<div class="loading">Загрузка...</div>';
    
    try {
        const response = await fetch('/api/leaderboard');
        const data = await response.json();
        
        if (data.success && data.data.length > 0) {
            content.innerHTML = data.data.map((player, index) => {
                const rankClass = index === 0 ? 'first' : index === 1 ? 'second' : index === 2 ? 'third' : '';
                const date = new Date(player.completed_at).toLocaleDateString('ru-RU');
                
                return `
                    <div class="leaderboard-item">
                        <div class="rank ${rankClass}">${index + 1}</div>
                        <div class="player-info">
                            <div class="player-name">${player.first_name || player.username || 'Аноним'}</div>
                            <div class="player-score">${player.score} очков</div>
                            <div class="player-date">${date}</div>
                        </div>
                    </div>
                `;
            }).join('');
        } else {
            content.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">🏆</div>
                    <p>Пока никто не прошел квест.<br>Станьте первым!</p>
                </div>
            `;
        }
    } catch (error) {
        console.error('Ошибка при загрузке таблицы лидеров:', error);
        content.innerHTML = '<div class="message error">Ошибка при загрузке данных</div>';
    }
}

// Загрузка отзывов
async function loadFeedback() {
    const content = document.getElementById('feedback-content');
    content.innerHTML = '<div class="loading">Загрузка отзывов...</div>';
    
    try {
        const response = await fetch('/api/feedback');
        const data = await response.json();
        
        if (data.success && data.data.length > 0) {
            content.innerHTML = data.data.map(feedback => {
                const date = new Date(feedback.created_at).toLocaleDateString('ru-RU');
                const stars = '⭐'.repeat(feedback.rating || 5);
                
                return `
                    <div class="feedback-item">
                        <div class="feedback-header">
                            <div class="feedback-name">${feedback.name}</div>
                            <div class="feedback-rating">${stars}</div>
                        </div>
                        <div class="feedback-message">${feedback.message}</div>
                        <div class="feedback-date">${date}</div>
                    </div>
                `;
            }).join('');
        } else {
            content.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">💬</div>
                    <p>Пока нет отзывов.<br>Оставьте первый!</p>
                </div>
            `;
        }
    } catch (error) {
        console.error('Ошибка при загрузке отзывов:', error);
        content.innerHTML = '<div class="message error">Ошибка при загрузке отзывов</div>';
    }
}

// Загрузка статистики
async function loadStats() {
    const content = document.getElementById('stats-content');
    content.innerHTML = '<div class="loading">Загрузка статистики...</div>';
    
    try {
        const response = await fetch('/api/stats');
        const data = await response.json();
        
        if (data.success) {
            const stats = data.data;
            content.innerHTML = `
                <div class="stat-card">
                    <div class="stat-number">${stats.totalPlayers}</div>
                    <div class="stat-label">Игроков</div>
                </div>
                <div class="stat-card">
                    <div class="stat-number">${stats.totalFeedback}</div>
                    <div class="stat-label">Отзывов</div>
                </div>
                <div class="stat-card">
                    <div class="stat-number">${stats.averageScore}</div>
                    <div class="stat-label">Средний балл</div>
                </div>
                <div class="top-player">
                    <h4>🏆 Лидер</h4>
                    ${stats.topPlayer ? `
                        <div class="player-name">${stats.topPlayer.first_name || stats.topPlayer.username || 'Аноним'}</div>
                        <div class="player-score">${stats.topPlayer.score} очков</div>
                    ` : '<p>Пока нет лидера</p>'}
                </div>
            `;
        } else {
            content.innerHTML = '<div class="message error">Ошибка при загрузке статистики</div>';
        }
    } catch (error) {
        console.error('Ошибка при загрузке статистики:', error);
        content.innerHTML = '<div class="message error">Ошибка при загрузке статистики</div>';
    }
}

// Настройка обработчиков событий
function setupEventListeners() {
    // Обработчик формы обратной связи
    const form = document.getElementById('feedback-form');
    form.addEventListener('submit', handleFeedbackSubmit);
    
    // Обработчики рейтинга
    document.querySelectorAll('.star').forEach(star => {
        star.addEventListener('click', function() {
            const rating = parseInt(this.dataset.rating);
            setRating(rating);
        });
    });
}

// Обработка отправки формы обратной связи
async function handleFeedbackSubmit(event) {
    event.preventDefault();
    
    const form = event.target;
    const submitBtn = form.querySelector('.submit-btn');
    const name = form.name.value.trim();
    const message = form.message.value.trim();
    const rating = getSelectedRating();
    
    if (!name || !message) {
        showMessage('Пожалуйста, заполните все поля', 'error');
        return;
    }
    
    // Блокируем кнопку
    submitBtn.disabled = true;
    submitBtn.textContent = '📤 Отправка...';
    
    try {
        const response = await fetch('/api/feedback', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                name,
                message,
                rating,
                userId: tg.initDataUnsafe?.user?.id || null
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            showMessage('Спасибо за отзыв! 🎉', 'success');
            form.reset();
            setRating(5);
            loadFeedback(); // Обновляем список отзывов
        } else {
            showMessage(data.error || 'Ошибка при отправке отзыва', 'error');
        }
    } catch (error) {
        console.error('Ошибка при отправке отзыва:', error);
        showMessage('Ошибка при отправке отзыва', 'error');
    } finally {
        // Разблокируем кнопку
        submitBtn.disabled = false;
        submitBtn.textContent = '📤 Отправить';
    }
}

// Установка рейтинга
function setRating(rating) {
    document.querySelectorAll('.star').forEach((star, index) => {
        if (index < rating) {
            star.classList.add('active');
        } else {
            star.classList.remove('active');
        }
    });
}

// Получение выбранного рейтинга
function getSelectedRating() {
    const activeStars = document.querySelectorAll('.star.active');
    return activeStars.length;
}

// Показ сообщений
function showMessage(text, type) {
    // Удаляем предыдущие сообщения
    document.querySelectorAll('.message').forEach(msg => msg.remove());
    
    const message = document.createElement('div');
    message.className = `message ${type}`;
    message.textContent = text;
    
    // Вставляем сообщение в активный таб
    const activeTab = document.querySelector('.tab-content.active');
    activeTab.insertBefore(message, activeTab.firstChild);
    
    // Автоматически скрываем через 3 секунды
    setTimeout(() => {
        message.remove();
    }, 3000);
}

// Открытие в Telegram
function openInTelegram() {
    tg.close();
}

// Обработка видимости приложения
document.addEventListener('visibilitychange', function() {
    if (!document.hidden) {
        // Обновляем данные при возвращении к приложению
        const activeTab = document.querySelector('.tab-content.active');
        if (activeTab) {
            const tabId = activeTab.id;
            switch(tabId) {
                case 'leaderboard':
                    loadLeaderboard();
                    break;
                case 'feedback':
                    loadFeedback();
                    break;
                case 'stats':
                    loadStats();
                    break;
            }
        }
    }
});
