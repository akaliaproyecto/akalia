const mongoose = require('mongoose');
require('dotenv').config();

async function verificarAdmin() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log(' Conectado a MongoDB');

    const Usuario = require('../usuarios/usuarios.model.js');
    
    // Buscar todos los usuarios
    const usuarios = await Usuario.find({});
    
    console.log('\n📋 Usuarios en la base de datos:');
    usuarios.forEach(u => {
      console.log(`\n- Email: ${u.email}`);
      console.log(`  Rol (rolUsuario): ${u.rolUsuario}`);
      console.log(`  Rol (rol): ${u.rol}`);
      console.log(`  Estado: ${u.estadoUsuario}`);
    });
    
    // Buscar usuario admin específico
    const admin = await Usuario.findOne({ 
      $or: [
        { rolUsuario: 'admin' },
        { rolUsuario: 'administrador' },
        { rol: 'admin' },
        { rol: 'administrador' }
      ]
    });
    
    if (admin) {
      console.log('\n Usuario admin encontrado:');
      console.log('Email:', admin.email);
      console.log('rolUsuario:', admin.rolUsuario);
      console.log('rol:', admin.rol);
    } else {
      console.log('\nNO se encontró ningún usuario admin');
      console.log('Creando usuario admin de prueba...');
      
      // Crear usuario admin
      const bcrypt = require('bcrypt');
      const hashedPassword = await bcrypt.hash('Admin123!', 10);
      
      const nuevoAdmin = new Usuario({
        nombreUsuario: 'Admin',
        apellidoUsuario: 'Sistema',
        email: 'admin@akalia.com',
        contrasena: hashedPassword,
        rolUsuario: 'admin',
        estadoUsuario: 'activo'
      });
      
      await nuevoAdmin.save();
      console.log(' Usuario admin creado:');
      console.log('Email: admin@akalia.com');
      console.log('Contraseña: Admin123!');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

verificarAdmin();
