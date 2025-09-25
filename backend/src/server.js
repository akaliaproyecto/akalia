const mongoose = require('mongoose');
const app = require('./app');
const dotenv = require('dotenv');
const path = require('path');
dotenv.config({ path: path.resolve(__dirname, '../.env') });
const PORT = process.env.PORT || process.env.PORT_BACKEND || 4006;

mongoose.connect(process.env.MONGO_URI,)
  .then(() => {
    app.listen(PORT, () => console.log(`API en http://localhost:${PORT}`));
  })
  .catch(err => console.error('Error conectando a Mongo:', err));

module.exports = mongoose;
