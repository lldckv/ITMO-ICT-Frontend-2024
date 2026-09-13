const API = 'http://localhost:3000';

document.addEventListener('DOMContentLoaded', function () {
    fillUserInfo();
    fillRentalHistory();
    fillUserDialogs();

    const editModal = document.getElementById('editUserInfoModal');
    editModal.addEventListener('show.bs.modal', loadEditForm);
});

function authHeader() {
    const token = localStorage.getItem('token');
    return token ? { Authorization: 'Bearer ' + token } : {};
}

function requireAuth() {
    const loggedInUserId = localStorage.getItem('loggedInUserId');
    const token = localStorage.getItem('token');
    if (!loggedInUserId || !token) {
        alert('No user logged in.');
        window.location.href = 'login.html';
        return null;
    }
    return loggedInUserId;
}
function fetchCurrentUser() {
    const loggedInUserId = localStorage.getItem('loggedInUserId');
    return fetch(`${API}/users/${loggedInUserId}`, { headers: authHeader() })
        .then(response => {
            if (!response.ok) throw new Error(`Server error: ${response.status}`);
            return response.json();
        });
}
function fillUserInfo() {
    const loggedInUserId = requireAuth();
    if (!loggedInUserId) return;

    fetchCurrentUser()
        .then(userData => {
            document.getElementById('firstName').textContent = userData.firstName || 'Не указано';
            document.getElementById('lastName').textContent = userData.lastName || 'Не указано';
            document.getElementById('dob').textContent = userData.dob || 'Не указано';
            document.getElementById('phone').textContent = userData.phone || 'Не указано';
            document.getElementById('email').textContent = userData.email || 'Не указано';
        })
        .catch(error => {
            console.error('Error fetching user data:', error);
            alert('An error occurred while fetching your data.');
        });
}

function loadEditForm() {
    fetchCurrentUser()
        .then(data => {
            document.getElementById('editFirstName').value = data.firstName || '';
            document.getElementById('editLastName').value = data.lastName || '';
            document.getElementById('editDob').value = data.dob || '';
            document.getElementById('editPhone').value = data.phone || '';
            document.getElementById('editEmail').value = data.email || '';
        })
        .catch(error => console.error('Error fetching user data for edit:', error));
}

function validateUserInfo() {
    const phone = document.getElementById('editPhone').value;
    const phonePattern = /^\+?[0-9\s\-\(\)]{10,15}$/;
    if (!phonePattern.test(phone)) {
        alert('Некорректный номер телефона');
        return false;
    }

    const email = document.getElementById('editEmail').value;
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) {
        alert('Некорректный формат email');
        return false;
    }

    const userData = {
        firstName: document.getElementById('editFirstName').value,
        lastName: document.getElementById('editLastName').value,
        dob: document.getElementById('editDob').value,
        phone: phone,
        email: email
    };

    const loggedInUserId = localStorage.getItem('loggedInUserId');

    fetch(`${API}/users/${loggedInUserId}`, {
        method: 'PATCH',
        headers: {
            ...authHeader(),
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData)
    })
        .then(response => {
            if (!response.ok) throw new Error(`Server error: ${response.status}`);
            return response.json();
        })
        .then(data => {
            console.log('User info updated:', data);
            fillUserInfo();
            alert('Информация успешно обновлена');

            // Close the modal properly via Bootstrap API
            const modalEl = document.getElementById('editUserInfoModal');
            bootstrap.Modal.getInstance(modalEl)?.hide();
        })
        .catch(error => {
            console.error('Error updating user data:', error);
            alert('Ошибка обновления информации');
        });

    return false;
}

function validatePassword() {
    const newPassword = document.getElementById('newPassword').value;
    if (newPassword.length < 6) {
        alert('Пароль должен быть не менее 6 символов');
        return false;
    }

    const loggedInUserId = localStorage.getItem('loggedInUserId');

    fetch(`${API}/users/${loggedInUserId}`, {
        method: 'PATCH',
        headers: {
            ...authHeader(),
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ password: newPassword })
    })
        .then(response => {
            if (!response.ok) throw new Error(`Server error: ${response.status}`);
            return response.json();
        })
        .then(data => {
            alert('Пароль успешно обновлен');
            document.getElementById('changePasswordForm').reset();

            const modalEl = document.getElementById('changePasswordModal');
            bootstrap.Modal.getInstance(modalEl)?.hide();
        })
        .catch(error => {
            console.error('Error updating password:', error);
            alert('Ошибка обновления пароля');
        });

    return false;
}

function fillRentalHistory() {
    const container = document.getElementById('rentalHistory');
    fetchCurrentUser()
        .then(data => {
            container.innerHTML = '';
            const rentals = data.rentalHistory;
            if (rentals.length === 0) {
                container.innerHTML = '<p>История аренды пуста.</p>';
                return;
            }
            container.style.display = "flex";
            container.style.overflowX = "auto";
            container.style.gap = "1rem";
            container.style.border = "0px solid transparent";
            rentals.sort((a, b) => new Date(a.startDate) - new Date(b.startDate));

            rentals.forEach(async rental => {
                const response = await fetch(`http://localhost:3000/properties/${rental.propertyId}`);
                const property = await response.json();
                const rentalCard = document.createElement("div");
                rentalCard.className = "card mb-3";
                rentalCard.style.minWidth = "300px"; // Ensure cards have a consistent width
                rentalCard.style.flex = "0 0 auto";
                rentalCard.innerHTML = `
                    <div class="card-body">
                        <h5 class="card-title"><a href="property.html?id=${rental.propertyId}">${property.title}</a></h5>
                        <p class="card-text" style="color: ${rental.isApproved ? 'green' : 'red'};">
                        Статус: ${rental.isApproved ? "Одобрено" : "В ожидании"}</p>
                        <p class="card-text">Дата начала аренды: ${rental.startOfRent}</p>
                        <p class="card-text">Дата окончания аренды: ${rental.endOfRent}</p>
                        <button class="btn btn-primary" onclick="location.href='messages.html?property_id=${rental.propertyId}'">Перейти к чату</button>
                        <button class="btn btn-danger delete-booking" data-id="${rental.id}">Удалить бронь</button>
                    </div>
                `;
                container.appendChild(rentalCard);
                rentalCard.querySelector(".delete-booking").addEventListener("click", async (e) => {
                    const bookingId = e.target.dataset.id;
                    try {
                        const deleteResponse = await fetch(`http://localhost:3000/book/${bookingId}?userId=${data.id}`, {
                            method: "DELETE"
                        });
                        console.log(deleteResponse)
                        if (!deleteResponse.ok) {
                            throw new Error("Failed to delete booking");
                        }
                        alert("Бронирование успешно удалено.");
                        rentalCard.remove();
                    } catch (error) {
                        console.error("Error deleting booking:", error);
                        alert("Ошибка при удалении бронирования.");
                    }
                });
            });

        })
        .catch(err => {
            console.error('Error loading rental history:', err);
            container.innerHTML = '<p>Ошибка загрузки истории аренды.</p>';
        });
}

function fillUserDialogs() {
    const container = document.getElementById('userDialogs');

    fetchCurrentUser()
        .then(data => {
            const messages = data.messages || [];
            container.innerHTML = '';

            if (messages.length === 0) {
                container.innerHTML = '<p>У вас нет диалогов.</p>';
                return;
            }
            const byProperty = {};
            messages.forEach(msg => {
                if (!byProperty[msg.propertyId]) byProperty[msg.propertyId] = [];
                byProperty[msg.propertyId].push(msg);
            });

            Object.entries(byProperty).forEach(async ([propertyId, msgs]) => {
                const response = await fetch(`http://localhost:3000/properties/${propertyId}`);
                const property = await response.json();

                if (property) {
                    const button = document.createElement("button");
                    button.className = "btn btn-primary new";
                    button.textContent = `Чат: ${property.title}`;
                    button.onclick = () => location.href = `messages.html?property_id=${propertyId}`;
                    container.appendChild(button);
                }
            });
        })
        .catch(err => {
            console.error('Error loading dialogs:', err);
            container.innerHTML = '<p>Ошибка загрузки диалогов.</p>';
        });
}

document.getElementById('editInfoForm').addEventListener('submit', function (e) {
    e.preventDefault();
    validateUserInfo();
});

document.getElementById('changePasswordForm').addEventListener('submit', function (e) {
    e.preventDefault();
    validatePassword();
});

function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('loggedInUserId');
    localStorage.removeItem('user');
    window.location.href = 'logout.html';
}
