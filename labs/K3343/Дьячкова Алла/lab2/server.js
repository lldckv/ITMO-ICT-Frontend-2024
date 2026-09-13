const jsonServer = require('json-server');
const auth = require('json-server-auth');

const server = jsonServer.create();
const router = jsonServer.router('db.json');
const middlewares = jsonServer.defaults();

server.db = router.db;

server.use(middlewares);
server.use(jsonServer.bodyParser);

server.use(auth);

server.post('/book', (req, res) => {
    try {
        const { userId, propertyId, start_date, end_date, timestamp } = req.body;

        if (!userId || !propertyId || !start_date || !end_date || !timestamp) {
            return res.status(400).json({ error: 'all params required' });
        }
        const userQuery = router.db.get('users').find({ id: Number(userId) });
        const rentalHistory = userQuery.get('rentalHistory').value() || [];

        const nextId = rentalHistory.length > 0
            ? Math.max(...rentalHistory.map(item => Number(item.id))) + 1
            : 1;

        const newRent = {
            id: nextId,
            propertyId: Number(propertyId) || null,
            isApproved: false,
            creationDate: timestamp,
            startOfRent: start_date,
            endOfRent: end_date
        };

        userQuery.update('rentalHistory', (rentalHistory) => {
            const list = rentalHistory || [];
            return [...list, newRent];
        }).write();

        res.status(200).json(newRent);
    } catch (err) {
        console.error('Error : booking', err);
        res.status(500).json({
            success: false,
            message: 'Internal server error during booking'
        });
    }
});

server.delete('/book/:id', (req, res) => {
    try {
        const userId = Number(req.query.userId);
        const bookingId = Number(req.params.id);

        const userQuery = router.db.get('users').find({ id: Number(userId) });
        const booking = userQuery.get('rentalHistory').find({ id: bookingId }).value();

        if (!booking) {
            return res.status(404).json({ error: 'Бронирование не найдено' });
        }
        userQuery.get('rentalHistory').remove({ id: bookingId }).write();
        res.status(200).json({ success: true, message: 'Бронирование успешно удалено' });

    } catch (err) {
        console.error('Error during booking deletion:', err);
        res.status(500).json({
            success: false,
            message: 'Внутренняя ошибка сервера при удалении бронирования'
        });
    }
});


server.use(router);

server.listen(3000, () => {
    console.log('JSON Server with auth running on http://localhost:3000');
});