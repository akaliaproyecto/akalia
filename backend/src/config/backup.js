/* eslint-disable no-unused-vars */
const { exec } = require('child_process'); //sive parta hacer procesos o hilos de ejecución 
const path = require('path');
process.loadEnvFile('./.env');

exports.backupDatabase = async () => {
  const dbName = 'akaliaproject_db';
  const outputPath = './backup';

  const command = `mongodump --uri "${process.env.MONGO_URI}" --out ${outputPath} --gzip`;

  await exec(command, (error, stdout, stderr) => {
    if (error) {
      console.error(`Error en el respaldo: ${error.message}`);
      return;
    }
    console.log(`Respaldo completado con éxito ${stdout}`);
  });
};
