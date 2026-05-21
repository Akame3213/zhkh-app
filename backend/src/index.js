require('dotenv').config();
const express = require('express');
const cors = require('cors');
const http = require('http');
const { sequelize } = require('./models');
const { initWebSocket } = require('./websocket/wsServer');

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const apartmentRoutes = require('./routes/apartments');
const meterRoutes = require('./routes/meters');
const readingRoutes = require('./routes/readings');
const billRoutes = require('./routes/bills');

const app = express();
const server = http.createServer(app);

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/apartments', apartmentRoutes);
app.use('/api/meters', meterRoutes);
app.use('/api/readings', readingRoutes);
app.use('/api/bills', billRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Маршрут не найден' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Внутренняя ошибка сервера' });
});

// Init WebSocket
initWebSocket(server);

const PORT = process.env.PORT || 5000;

// Sync DB and start server
sequelize.sync({ alter: true })
  .then(() => {
    console.log('✅ База данных синхронизирована');
    server.listen(PORT, () => {
      console.log(`🚀 Сервер запущен на порту ${PORT}`);
      console.log(`🔌 WebSocket готов`);
    });
  })
  .catch(err => {
    console.error('❌ Ошибка подключения к БД:', err);
    process.exit(1);
  });

module.exports = { app, server };
