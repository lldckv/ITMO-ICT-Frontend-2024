fetch('components/header.html')
    .then(response => response.text())
    .then(data => {
        document.getElementById('header').innerHTML = data;
        checkUserStatus();
        initThemeToggle();
    });

fetch('components/footer.html')
    .then(response => response.text())
    .then(data => {
        document.getElementById('footer').innerHTML = data;
    });

function checkUserStatus() {
    const loggedInUserId = localStorage.getItem('loggedInUserId');

    const authLinks = document.getElementById('authLinks');
    const userLinks = document.getElementById('userLinks');
    const logoutButton = document.getElementById('logoutButton');

    if (loggedInUserId) {
        authLinks.style.display = 'none';
        userLinks.style.display = 'block';
    } else {
        authLinks.style.display = 'block';
        userLinks.style.display = 'none';
    }

    if (logoutButton) {
        logoutButton.addEventListener('click', function () {
            localStorage.removeItem('loggedInUserId');
            window.location.href = 'login.html';
        });
    }
}

function initThemeToggle() {
    const toggleBtn = document.getElementById('toggle-mode');
    if (!toggleBtn) return;

    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-mode');
        toggleBtn.textContent = '☀️';
        toggleBtn.setAttribute('aria-label', 'Переключить на светлую тему');
    } else {
        toggleBtn.textContent = '🌙';
        toggleBtn.setAttribute('aria-label', 'Переключить на тёмную тему');
    }

    toggleBtn.addEventListener('click', () => {
        const isDark = document.body.classList.toggle('dark-mode');
        localStorage.setItem('theme', isDark ? 'dark' : 'light');

        toggleBtn.textContent = isDark ? '☀️' : '🌙';
        toggleBtn.setAttribute('aria-label', isDark ? 'Переключить на светлую тему' : 'Переключить на тёмную тему');
    });
}