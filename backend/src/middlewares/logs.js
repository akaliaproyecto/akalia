const fs = require('fs');
const path = require('path')

exports.generateLog = (filename, logData) => {
  const filePath = path.join(__dirname, '../../logs', filename);

  fs.appendFile(filePath, logData + '\n', (err) => {
    if (err) throw err;
    console.log('Log saved: ', logData);
  });
};