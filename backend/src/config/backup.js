/* eslint-disable no-unused-vars */
const { exec } = require('child_process'); //sive parta hacer procesos o hilos de ejecución 
const path = require('path');
const dotenv = require('dotenv');

dotenv.config();

const fs = require('fs');
const archiver = require('archiver');
const { configEmail } = require('../servicios/mailer');

exports.backupDatabase = async () => {
  const outputPath = path.resolve('./backup');
  const zipPath = path.resolve('./backup.zip');

  console.log(' Generando respaldo...');
  const command = `mongodump --uri "${process.env.MONGO_URI}" --out ${outputPath} --gzip`;

  await exec(command, (error, stdout, stderr) => {
    if (error) {
      console.error(`Error en el respaldo: ${error.message}`);
      return;
    }
    console.log(`Respaldo completado con éxito ${stdout}`);
  

   // Crear archivo ZIP
    const output = fs.createWriteStream(zipPath);
    const archive = archiver('zip', { zlib: { level: 9 } });

    output.on('close', async () => {
      console.log(` Archivo comprimido (${archive.pointer()} bytes). Enviando correo...`);
      
      });

    archive.on('error', err => { throw err; });

    archive.pipe(output);
    archive.directory(outputPath, false);
    archive.finalize();

    // Enviar correo
    const infoCorreo = {
      to: process.env.EMAIL_USER,
      subject: 'AKALIA | Backup',
      attachments: [
        {
          filename: 'backup.zip',
          path: zipPath
        }
      ]
    }
    
    configEmail(infoCorreo);
  });
};

