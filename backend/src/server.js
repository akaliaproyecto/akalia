const mongoose = require('mongoose');
const app = require('./app');
const dotenv = require('dotenv');
const path = require('path');
dotenv.config({ path: path.resolve(__dirname, '../.env') });

// Debug de variables de entorno
console.log('🔍 Environment variables:');
console.log('- PORT:', process.env.PORT);
console.log('- PORT_BACKEND:', process.env.PORT_BACKEND);
console.log('- NODE_ENV:', process.env.NODE_ENV);

const PORT = process.env.PORT || process.env.PORT_BACKEND || 4006;
console.log(`🚀 Intentando iniciar servidor en puerto: ${PORT}`);

mongoose.connect(process.env.MONGO_URI,)
  .then(() => {
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`✅ API backend iniciada exitosamente en puerto ${PORT}`);
      console.log(`🌐 Servidor escuchando en todas las interfaces (0.0.0.0:${PORT})`);
    });
  })
  .catch(err => console.error('❌ Error conectando a Mongo:', err));

module.exports = mongoose;
