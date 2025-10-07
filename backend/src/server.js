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
<<<<<<< HEAD
    origin: process.env.CLIENT_URL || 'https://akalia-app.onrender.com', 
=======
    origin: process.env.CLIENT_URL || 'http://localhost:4666', 
>>>>>>> 7e71b1f (Se finaliza el añadir cookies de session a las peticiones del SSR;)
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
<<<<<<< HEAD
  console.log('aqui io.use user session: ',req.session)
=======
  
>>>>>>> 7e71b1f (Se finaliza el añadir cookies de session a las peticiones del SSR;)
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
  console.log("✅ Usuario conectado", socket.user.id);
});

mongoose.connect(process.env.MONGO_URI,)
  .then(() => {
    server.listen(PORT, '0.0.0.0', () => {
      console.log(`✅ API backend iniciada exitosamente en puerto ${PORT}`);
    });
  })
  .catch(err => console.error(' Error conectando a Mongo:', err));

module.exports = mongoose;
