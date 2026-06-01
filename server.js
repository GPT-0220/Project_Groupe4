const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
require('dotenv').config();

// Set default JWT_SECRET if not in environment
if (!process.env.JWT_SECRET) {
  process.env.JWT_SECRET = 'senguinee_secret_key_development_only';
}

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/senguinee', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('MongoDB connecté'))
.catch(err => console.error('Erreur MongoDB:', err));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/capteurs', require('./routes/capteurs'));
app.use('/api/releves', require('./routes/releves'));
app.use('/api/statistiques', require('./routes/statistiques'));
app.use('/api/alertes', require('./routes/alertes'));
app.use('/api/comparaison', require('./routes/comparaison'));

// WebSocket connection for real-time updates
io.on('connection', (socket) => {
  console.log('Client connecté');
  
  socket.on('disconnect', () => {
    console.log('Client déconnecté');
  });
});

// Make io accessible to routes
app.set('io', io);

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
});

module.exports = { app, io };
