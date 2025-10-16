const fs = require('fs');
const path = require('path')

/**
 * Genera un log en el directorio /logs
 * - Añade una línea al archivo indicado con el texto pasado en logData.
 * @param {string} filename - Nombre del archivo de log (p.ej. 'emprendimiento.log')
 * @param {string} logData - Texto a añadir al log
 */
exports.generateLog = (filename, logData) => {
  const filePath = path.join(__dirname, '../../logs', filename);

  fs.appendFile(filePath, logData + '\n', (err) => {
    if (err) throw err;
    console.log('Log saved: ', logData);
  });
};