/**
 * @file backup.js
 * @description Genera un respaldo (dump) de la base de datos usando `mongodump`, comprime
 * la carpeta de respaldo en un ZIP y envía el archivo por correo.
 *
 * Notas sencillas para un estudiante:
 * - Usa `mongodump` para crear el volcado en `./backup`.
 * - Luego crea `backup.zip` y lo adjunta en un correo usando `configEmail`.
 * - Este archivo ejecuta procesos del sistema; requiere que `mongodump` esté disponible.
 */
/* eslint-disable no-unused-vars */
const { exec } = require('child_process'); //sive parta hacer procesos o hilos de ejecución 
const path = require('path');
process.loadEnvFile('./.env');

const fs = require('fs');
const archiver = require('archiver');
const { configEmail } = require('../servicios/mailer');

/**
 * Genera un respaldo de la base de datos, lo comprime y lo envía por correo.
 * - Esta función ejecuta `mongodump` con la URI desde `process.env.MONGO_URI`.
 * - Crea un ZIP con la carpeta de salida y lo adjunta en un correo a `process.env.EMAIL_USER`.
 * @returns {Promise<void>} - Resuelve cuando el proceso de respaldo y envío se dispara.
 */
exports.backupDatabase = async () => {
  const dbName = 'akaliaproject_db';
  const outputPath = path.resolve('./backup');
  const zipPath = path.resolve('./backup.zip');

  console.log('⏳ Generando respaldo...');
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
      console.log(`📦 Archivo comprimido (${archive.pointer()} bytes). Enviando correo...`);
      
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

