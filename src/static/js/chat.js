document.addEventListener('DOMContentLoaded', function() {
    const chatToggle = document.getElementById('chatToggle');
    const chatWindow = document.getElementById('chatWindow');
    const closeChat = document.getElementById('closeChat');
    const messageInput = document.getElementById('messageInput');
    const sendMessage = document.getElementById('sendMessage');
    const chatMessages = document.getElementById('chatMessages');

    // Генерируем уникальный ID для чата
    const chatId = 'chat_' + Math.random().toString(36).substr(2, 9);

    chatToggle.addEventListener('click', () => {
        chatWindow.style.display = chatWindow.style.display === 'none' ? 'block' : 'none';
    });

    closeChat.addEventListener('click', () => {
        chatWindow.style.display = 'none';
    });

    function sendUserMessage() {
        const message = messageInput.value.trim();
        if (!message) return;

        // Добавляем сообщение в чат
        addMessage(message, 'user');

        // Отправляем сообщение на сервер
        fetch('/api/send-message/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCookie('csrftoken')
            },
            body: JSON.stringify({
                chatId: chatId,
                message: message
            })
        });

        messageInput.value = '';
    }

    sendMessage.addEventListener('click', sendUserMessage);
    messageInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') sendUserMessage();
    });

    function addMessage(message, type) {
        const messageElement = document.createElement('div');
        messageElement.className = `message ${type}-message`;
        messageElement.textContent = message;
        chatMessages.appendChild(messageElement);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    // Проверка новых сообщений
    function checkNewMessages() {
        fetch(`/api/check-messages/?chatId=${chatId}`)
            .then(response => response.json())
            .then(data => {
                if (data.messages) {
                    data.messages.forEach(msg => {
                        addMessage(msg.message, 'admin');
                    });
                }
            });
    }

    // Получение CSRF токена
    function getCookie(name) {
        let cookieValue = null;
        if (document.cookie && document.cookie !== '') {
            const cookies = document.cookie.split(';');
            for (let i = 0; i < cookies.length; i++) {
                const cookie = cookies[i].trim();
                if (cookie.substring(0, name.length + 1) === (name + '=')) {
                    cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                    break;
                }
            }
        }
        return cookieValue;
    }

    setInterval(checkNewMessages, 3000);
});