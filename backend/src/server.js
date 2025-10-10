const mongoose = require('mongoose');
const { app, sessionMiddleware } = require('./app');
const dotenv = require('dotenv');
const path = require('path');
dotenv.config({ path: path.resolve(__dirname, '../.env') });
const PORT = process.env.PORT || process.env.PORT_BACKEND || 4006;
const http = require('http');
const server = http.createServer(app);
const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const backup = require('./config/backup')
const cron = require('node-cron');

const io = new Server(server, {
  cors: { 
    origin: process.env.CLIENT_URL || 'https://akalia-app.onrender.com', 
    credentials: true,
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type", "Authorization"]
  },
  allowEIO3: true,
  transports: ['websocket', 'polling']
})

// convertir para socket
io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  if (!token) {
    return next(new Error('Token requerido'));
  }
  
  try {
    console.log(token)
    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    console.log('Token decodificado:', decoded); 
    socket.user = decoded; // guardamos info del usuario
  
    next();
  } catch (err) {
    next(new Error('Token inválido'));
  }
});

require('./sockets/chat')(io); 

io.on("connection", (socket) => {
  console.log("Usuario conectado", socket.user.id);
});


cron.schedule('0 0 1,15 * *', async () => {
    console.log('Realizando Backup de la Base de datos');
    backup.backupDatabase();
});



mongoose.connect(process.env.MONGO_URI,)
  .then(() => {
    server.listen(PORT, '0.0.0.0', () => {
      console.log(`API backend iniciada exitosamente en puerto ${PORT}`);
    });
  })
  .catch(err => console.error(' Error conectando a Mongo:', err));

module.exports = mongoose;
