const API = 'http://localhost:3000';

function authHeader() {
    const token = localStorage.getItem('token');
    return token ? { Authorization: 'Bearer ' + token } : {};
}

function getPropertyIdFromUrl() {
    const params = new URLSearchParams(window.location.search);
    return params.get('propertyId');
}

document.addEventListener('DOMContentLoaded', function () {
    loadConversation();

    document.getElementById('sendMessageForm').addEventListener('submit', function (e) {
        e.preventDefault();
        sendMessage();
    });
});

document.addEventListener('DOMContentLoaded', function () {
    loadConversation();
});

function loadConversation() {
    const loggedInUserId = localStorage.getItem('loggedInUserId');
    const propertyId = getPropertyIdFromUrl();
    const container = document.getElementById('messageList');

    if (!container) return;

    fetch(`${API}/users/${loggedInUserId}`, { headers: authHeader() })
        .then(res => {
            if (!res.ok) throw new Error(`Server error: ${res.status}`);
            return res.json();
        })
        .then(userData => {
            const messages = (userData.messages || []).filter(m => String(m.propertyId) === String(propertyId));
            container.innerHTML = '';

            if (messages.length === 0) {
                container.innerHTML = '<p>Нет сообщений по этому объекту.</p>';
                return;
            }

            messages.forEach(msg => {
                const el = document.createElement('div');

                el.className = `list-group-item ${msg.sender ? 'message-sent' : 'message-received'}`;
                el.setAttribute('role', 'listitem');

                const senderLabel = msg.sender ? 'Вы' : `<a href="property.html?id=${propertyId}" class="owner-link">Владелец</a>`;
                el.innerHTML = `<strong>${senderLabel}:</strong><p>${msg.content}</p><small class="text-muted">${msg.timestamp}</small>`;
                container.appendChild(el);
            });

            container.scrollTop = container.scrollHeight;
        })
        .catch(err => {
            console.error('Error loading conversation:', err);
            container.innerHTML = '<p>Ошибка загрузки сообщений.</p>';
        });
}

async function sendMessage() {
    const messageText = document.getElementById('messageText').value.trim();
    if (!messageText) return false;

    const loggedInUserId = localStorage.getItem('loggedInUserId');
    const propertyId = getPropertyIdFromUrl();

    if (!loggedInUserId) {
        alert('Вы не авторизованы.');
        return false;
    }
    if (!propertyId) {
        alert('Не указан объект недвижимости.');
        return false;
    }

    try {
        const userRes = await fetch(`${API}/users/${loggedInUserId}`, { headers: authHeader() });
        if (!userRes.ok) throw new Error(`Server error: ${userRes.status}`);
        const userData = await userRes.json();

        const existingMessages = userData.messages || [];

        const newMessage = {
            propertyId: propertyId,
            content: messageText,
            timestamp: new Date().toISOString(),
            sender: 1
        };
        const updatedMessages = [...existingMessages, newMessage];

        const patchRes = await fetch(`${API}/users/${loggedInUserId}`, {
            method: 'PATCH',
            headers: {
                ...authHeader(),
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ messages: updatedMessages })
        });

        if (!patchRes.ok) throw new Error(`Server error: ${patchRes.status}`);

        document.getElementById('messageText').value = '';
        loadConversation(); // refresh

    } catch (err) {
        console.error('Error sending message:', err);
        alert('Ошибка отправки сообщения.');
    }

    return false;
}

function cancelMessage() {
    document.getElementById('messageText').value = '';
}