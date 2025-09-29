# Sistema de Validaciones del Backend

Este documento describe el sistema de validaciones implementado en el backend de Akalia.

## 🏗️ Arquitectura

Las validaciones han sido separadas de los controladores para mantener una arquitectura limpia y modular. Cada módulo principal tiene su propio archivo de validaciones:

```
backend/src/
├── usuarios/
│   ├── usuarios.controller.js
│   ├── usuarios.model.js
│   ├── usuarios.routes.js
│   └── usuarios.validations.js ✨
├── productos/
│   ├── productos.controller.js
│   ├── productos.model.js
│   ├── productos.routes.js
│   └── productos.validations.js ✨
├── emprendimientos/
│   ├── emprendimiento.controller.js
│   ├── emprendimiento.model.js
│   ├── emprendimiento.route.js
│   └── emprendimiento.validations.js ✨
├── pedidos/
│   ├── pedido.controller.js
│   ├── pedidos.model.js
│   ├── pedido.routes.js
│   └── pedidos.validations.js ✨
└── middlewares/
    └── validaciones.generales.js ✨
```

## 📋 Módulos de Validación

### 1. **usuarios.validations.js**
Validaciones específicas para usuarios:
- ✅ Formato de email
- ✅ Existencia de email en BD
- ✅ Formato de nombre/apellido (solo letras y acentos)
- ✅ Formato de teléfono (exactamente 10 números)
- ✅ Formato de contraseña (8+ caracteres, mayúscula, número, símbolo)
- ✅ Validación de IDs de MongoDB
- ✅ Existencia de usuario en BD

**Funciones principales:**
- `validarDatosCreacionUsuario()`
- `validarDatosActualizacionUsuario()`
- `emailExiste()`
- `validarFormatoContrasena()`

### 2. **productos.validations.js**
Validaciones específicas para productos:
- ✅ Nombre del producto (3-100 caracteres)
- ✅ Descripción del producto (10-500 caracteres)
- ✅ Precio del producto (número positivo)
- ✅ Categoría del producto
- ✅ Etiquetas (máximo 10, 2-30 caracteres cada una)
- ✅ Imágenes (máximo 5)
- ✅ ID de emprendimiento válido

**Funciones principales:**
- `validarDatosCreacionProducto()`
- `validarDatosActualizacionProducto()`
- `productoExistePorId()`

### 3. **emprendimiento.validations.js**
Validaciones específicas para emprendimientos:
- ✅ Nombre del emprendimiento (3-100 caracteres)
- ✅ Descripción del emprendimiento (20-1000 caracteres)
- ✅ Categoría del emprendimiento
- ✅ Teléfono y email opcionales
- ✅ Dirección (5-200 caracteres)
- ✅ Redes sociales
- ✅ Imagen del emprendimiento

**Funciones principales:**
- `validarDatosCreacionEmprendimiento()`
- `validarDatosActualizacionEmprendimiento()`
- `emprendimientoExistePorId()`

### 4. **pedidos.validations.js**
Validaciones específicas para pedidos:
- ✅ Estado del pedido
- ✅ Productos del pedido (1-50 productos)
- ✅ Cantidad de productos (números enteros positivos)
- ✅ Total del pedido
- ✅ Información de contacto
- ✅ Observaciones (máximo 500 caracteres)
- ✅ Fecha de entrega (futura, máximo 1 año)

**Funciones principales:**
- `validarDatosCreacionPedido()`
- `validarDatosActualizacionPedido()`
- `validarProductosPedido()`

### 5. **validaciones.generales.js**
Validaciones comunes reutilizables:
- ✅ IDs de MongoDB
- ✅ Formato de email
- ✅ Formato de teléfono
- ✅ Longitud de texto
- ✅ Solo letras
- ✅ Rangos numéricos
- ✅ Fechas
- ✅ URLs
- ✅ Arrays
- ✅ Sanitización de texto
- ✅ Validación múltiple de campos

## 🚀 Uso en Controladores

### Antes (Validaciones en controlador):
```javascript
exports.crearUsuario = async (req, res) => {
  try {
    const { correo } = req.body;
    
    // Validaciones mezcladas con lógica de negocio
    if (!correo) {
      return res.status(400).json({ error: 'Email requerido' });
    }
    
    const usuarioExistente = await modeloUsuario.findOne({ correo });
    if (usuarioExistente) {
      return res.status(400).json({ error: 'Email ya registrado' });
    }
    
    // Más lógica...
  } catch (error) {
    // Manejo de errores
  }
};
```

### Después (Validaciones separadas):
```javascript
const { validarDatosCreacionUsuario } = require('./usuarios.validations');

exports.crearUsuario = async (req, res) => {
  try {
    // Validar datos usando función específica
    const validacion = await validarDatosCreacionUsuario(req.body);
    
    if (!validacion.valido) {
      return res.status(400).json({
        error: 'Datos inválidos',
        errores: validacion.errores
      });
    }
    
    // Lógica de negocio limpia
    const nuevoUsuario = new modeloUsuario(req.body);
    // ...
  } catch (error) {
    // Manejo de errores
  }
};
```

## ✨ Beneficios del Sistema

### 🎯 **Separación de Responsabilidades**
- Los controladores se enfocan en lógica de negocio
- Las validaciones están centralizadas y organizadas
- Fácil mantenimiento y testing

### 🔄 **Reutilización**
- Validaciones comunes en `validaciones.generales.js`
- Funciones específicas por módulo
- Evita duplicación de código

### 🛡️ **Consistencia**
- Mismo formato de respuesta de errores
- Validaciones uniformes en toda la aplicación
- Mensajes de error estandarizados

### 🧪 **Testeable**
- Funciones puras fáciles de testear
- Validaciones aisladas del contexto HTTP
- Mocks más simples

### 📈 **Escalabilidad**
- Fácil agregar nuevas validaciones
- Estructura clara para nuevos módulos
- Mantenimiento simplificado

## 🔧 Integración con Frontend

Las validaciones del frontend (`login_signup.js`) se conectan con las validaciones del backend a través de la API:

```javascript
// Frontend valida en tiempo real
const respuesta = await fetch(`/api/usuarios/verificar-email/${email}`, {
  headers: { 'akalia-api-key': 'akalia-api-key-2025' }
});

// Backend usa validaciones separadas
exports.verificarEmail = async (req, res) => {
  const existe = await emailExiste(email);
  res.json({ existe, mensaje: existe ? 'Ya registrado' : 'Disponible' });
};
```

## 📝 Convenciones

### Formato de Respuesta de Validación:
```javascript
{
  valido: boolean,
  errores: string[]
}
```

### Nombres de Funciones:
- `validar[Campo]()` - Valida un campo específico
- `validarDatos[Operacion][Modulo]()` - Valida datos completos
- `[entidad]ExistePorId()` - Verifica existencia en BD

### Estructura de Archivos:
- Importaciones al inicio
- Funciones de validación específicas
- Funciones de validación completas
- Exportaciones al final

Este sistema asegura que todas las validaciones estén centralizadas, sean reutilizables y mantengan la calidad de los datos en toda la aplicación.
