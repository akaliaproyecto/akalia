const mongoose = require('mongoose');
const { app, sessionMiddleware } = require('./app');
const dotenv = require('dotenv');
const path = require('path');
dotenv.config({ path: path.resolve(__dirname, '../.env') });
const PORT = process.env.PORT || process.env.PORT_BACKEND || 4006;
const http = require('http');
const server = http.createServer(app);
const { Server } = require('socket.io');

const io = new Server(server, {
  cors: { 
    origin: 'http://localhost:4666', 
    credentials: true,
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type", "Authorization"]
  },
  allowEIO3: true,
  transports: ['websocket', 'polling']
})

// convertir para socket
io.use((socket, next) => {
  sessionMiddleware(socket.request, socket.request.res || {}, next);
});

// Middleware de autenticacion
io.use((socket, next) => {
  const req = socket.request;
  console.log('Verificando autenticación socket...');
  console.log('Session:', req.session);

  if (req.session && req.session.userId) {
    socket.user = { 
      id: req.session.userId.toString() //  Convertir a string
    };
    return next();
  }
  next(new Error('Unauthorized'));
});

require('./sockets/chat')(io); 

io.on("connection", (socket) => {
  console.log("✅ Usuario conectado", socket.id);
});

mongoose.connect(process.env.MONGO_URI,)
  .then(() => {
    server.listen(PORT, '0.0.0.0', () => {
      console.log(`✅ API backend iniciada exitosamente en puerto ${PORT}`);
    });
  })
  .catch(err => console.error(' Error conectando a Mongo:', err));

module.exports = mongoose;
