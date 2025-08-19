const mongoose = require('mongoose');
const app = require('./app');
const dotenv = require('dotenv');
const path = require('path');
dotenv.config({ path: path.resolve(__dirname, '../.env') });
const PORT = process.env.PORT || 3000;

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
  .then(() => {
    app.listen(PORT, () => console.log(`API en http://localhost:${PORT}`));
  })
  .catch(err => console.error('Error conectando a Mongo:', err));

module.exports = mongoose;

// const URI = `mongodb+srv://${process.env.USER_DB}:${process.env.PASS}@cluster0.2voyn.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;

// mongoose.connect(URI).then(() => {
//   app.listen(PORT, () => console.log(`API en http://localhost:${PORT}`));
// }).catch(err => {
//   console.error('Error conectando a Mongo:', err);
// });

// module.exports = mongoose;

// // Importar mongoose para manejar la conexión a MongoDB
// const mongoose = require("mongoose");

// // Importar dotenv para leer variables de entorno desde el archivo .env
// require("dotenv").config();

// // Construir la URI de conexión usando las variables de entorno
// //const URI = `mongodb+srv://${process.env.USER_BD}:${process.env.PASS_BD}@cluster0.buuk8nn.mongodb.net/${process.env.DB_NAME}`;

// // Conectar a MongoDB
// mongoose.connect(URI);

// // Exportar la instancia de mongoose para usarla en los modelos
// module.exports = mongoose;