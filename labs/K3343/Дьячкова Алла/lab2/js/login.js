document.querySelector('form').addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
        const res = await fetch('http://localhost:3000/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        if (!res.ok) {
            const err = await res.json();
            throw new Error(err.error || err.message || 'Login failed');
        }

        const data = await res.json();
        console.log(data)
        localStorage.setItem('token', data.accessToken);
        localStorage.setItem('loggedInUserId', data.user.id);

        window.location.href = 'user.html';

    } catch (error) {
        console.error('Login error:', error.message);
        alert(error.message);
    }
});