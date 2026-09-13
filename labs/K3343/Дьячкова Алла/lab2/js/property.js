const API = 'http://localhost:3000';

let pendingAction = null;

function setDates() {
    const today = new Date();
    const minDate = today.toISOString().split('T')[0]; // YYYY-MM-DD    
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    const sixMonthsFromNow = new Date(today);
    sixMonthsFromNow.setMonth(today.getMonth() + 6);
    const sixMonthsFromTmr = new Date(tomorrow);
    sixMonthsFromTmr.setMonth(today.getMonth() + 6);


    const startDateInput = document.getElementById('stdate');
    const endDateInput = document.getElementById('enddate');

    startDateInput.setAttribute('min', minDate);
    startDateInput.setAttribute('max', sixMonthsFromNow.toISOString().split('T')[0]);
    endDateInput.setAttribute('min', tomorrow.toISOString().split('T')[0]);
    endDateInput.setAttribute('max', sixMonthsFromTmr.toISOString().split('T')[0]);

    startDateInput.addEventListener('change', () => {
        if (startDateInput.value) {
            const nextDay = new Date(startDateInput.value);
            nextDay.setDate(nextDay.getDate() + 1);

            const minEndDate = nextDay.toISOString().split('T')[0];
            endDateInput.min = minEndDate;
            if (endDateInput.value && endDateInput.value < minEndDate) {
                endDateInput.value = '';
            }
        }
    });
}

document.addEventListener('DOMContentLoaded', async () => {
    setDates();
    const propertyId = new URLSearchParams(window.location.search).get('id');
    const dialogButton = document.getElementById('dialogButton');
    const loginForm = document.getElementById('modalLoginForm');
    const loginError = document.getElementById('loginError');
    const bookingForm = document.getElementById('modalBookingForm');

    if (!propertyId) {
        throw new Error('Property ID is missing');
    }
    const response = await fetch(`http://localhost:3000/properties/${propertyId}`);
    if (!response.ok) {
        throw new Error('Property not found');
    }

    const property = await response.json();
    document.getElementById('property-details').textContent = property.title || 'Название объекта отсутствует';
    document.getElementById('property-price').textContent = `${property.price?.toLocaleString() || 'Цена не указана'} ₽/мес`;
    document.getElementById('property-location').textContent = property.location || 'Местоположение не указано';
    document.getElementById('property-rooms').textContent = property.roomCount || 'Количество комнат не указано';
    document.getElementById('property-description').textContent = property.description || 'Описание отсутствует';
    const carouselInner = document.querySelector('.carousel-inner');
    if (property.images && property.images.length > 0) {
        carouselInner.innerHTML = property.images.map((image, index) => `
                <div class="carousel-item ${index === 0 ? 'active' : ''}">
                    <img src="images/${image}" class="d-block w-100" alt="Фото объекта: ${property.title}">
                </div>
        `).join('');
    } else {
        carouselInner.innerHTML = `
                <div class="carousel-item active">
                    <img src="images/none.png" class="d-block w-100" alt="Фотография отсутствует">
                </div>
        `;
    }

    const showControls = property.images && property.images.length > 1;
    document.querySelectorAll('.carousel-control-prev, .carousel-control-next')
        .forEach(control => {
            control.style.display = showControls ? 'block' : 'none';
        });
    function isLoggedIn() {
        const token = localStorage.getItem('token');
        const userId = localStorage.getItem('loggedInUserId');
        return Boolean(token && userId && userId !== 'undefined');
    }
    dialogButton.addEventListener('click', (e) => {
        if (isLoggedIn()) {
            e.preventDefault();
            window.location.href = `messages.html?propertyId=${propertyId}`;
        } else {
            pendingAction = 'message';
        }
    });
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        loginError.classList.add('d-none');
        loginError.textContent = '';

        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        try {
            const res = await fetch(`${API}/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            const data = await res.json();
            if (!res.ok) {
                throw new Error(data.error || data.message || 'Неверный email или пароль');
            }

            localStorage.setItem('token', data.accessToken);
            localStorage.setItem('loggedInUserId', data.user.id);

            const loginModalEl = document.getElementById('loginModal');
            bootstrap.Modal.getInstance(loginModalEl)?.hide();

            if (pendingAction === 'booking') {
                // Reopen booking modal so the user can finish where they left off —
                // input values are still intact since the modal was never destroyed.
                new bootstrap.Modal(document.getElementById('bookingModal')).show();
            } else {
                window.location.href = `messages.html?propertyId=${propertyId}`;
            }

            pendingAction = null;

        } catch (err) {
            loginError.textContent = err.message;
            loginError.classList.remove('d-none');
        }
    });

    bookingForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        if (!isLoggedIn()) {
            pendingAction = 'booking';
            bootstrap.Modal.getInstance(document.getElementById('bookingModal'))?.hide();
            new bootstrap.Modal(document.getElementById('loginModal')).show();
            return;
        }

        const userId = Number(localStorage.getItem('loggedInUserId'));
        const token = localStorage.getItem('token');

        if (!propertyId) {
            alert('Не указан объект недвижимости.');
            return;
        }

        const start_date = document.getElementById('stdate').value;
        const end_date = document.getElementById('enddate').value;
        const timestamp = new Date().toISOString();

        try {
            const response = await fetch(`${API}/book`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + token
                },
                body: JSON.stringify({ userId, propertyId, start_date, end_date, timestamp })
            });

            const contentType = response.headers.get('content-type');
            const isJson = contentType && contentType.includes('application/json');
            const data = isJson ? await response.json() : await response.text();

            if (!response.ok) {
                throw new Error(isJson ? (data.error || data.message) : data || `Ошибка сервера: ${response.status}`);
            }

            alert('Заявка подана успешно!');
            bootstrap.Modal.getInstance(document.getElementById('bookingModal'))?.hide();
            location.reload();

        } catch (error) {
            console.error('Booking error:', error);
            alert(error.message || 'Ошибка при бронировании');
        }
    });
});