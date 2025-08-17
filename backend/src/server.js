const mongoose = require('mongoose');
const app = require('./app');

const URI = `mongodb+srv://${process.env.USER_DB}:${process.env.PASS}@cluster0.2voyn.mongodb.net/${process.env.DB_NAME}`

mongoose.connect(URI).then(() => {
  app.listen(PORT, () => console.log(`API en http://localhost:${PORT}`));
}).catch(err => {
  console.error('Error conectando a Mongo:', err);
});