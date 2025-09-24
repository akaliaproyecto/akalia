# 📋 Documentación de Validaciones Frontend

## 🎯 Resumen General

Se han implementado validaciones completas en JavaScript para todos los formularios del aplicativo Akalia, siguiendo las especificaciones de los modelos del backend y las mejores prácticas de UX.

## 📁 Archivos de Validación

### `validaciones-login-signup.js`
**Formularios cubiertos:**
- ✅ **Registro de Usuario**
- ✅ **Login de Usuario** 
- ✅ **Editar Perfil de Usuario**

### `validaciones-emprendimientos.js`
**Formularios cubiertos:**
- ✅ **Crear Emprendimiento**
- 🔧 **Editar Emprendimiento** (estructura base implementada)

### `validaciones-productos.js`
**Formularios cubiertos:**
- ✅ **Crear Producto**
- 🔧 **Editar Producto** (estructura base implementada)

### `validaciones-generales.js`
**Formularios cubiertos:**
- ✅ **Contacto**
- ✅ **Mensajes en Pedidos**
- ✅ **Reportes**

### `validaciones-admin.js`
**Formularios cubiertos:**
- ✅ **Crear/Editar Categorías**
- ✅ **Crear/Editar Etiquetas**
- ✅ **Crear Pedidos/Carrito**

## 🔍 Validaciones Implementadas por Modelo

### 👤 **Usuario** (usuarios.model.js)
| Campo | Validaciones | Mensaje Error |
|-------|-------------|---------------|
| **nombreUsuario** | Requerido, 2+ chars, solo letras/espacios/tildes | "El nombre debe tener al menos 2 caracteres" |
| **apellidoUsuario** | Requerido, 2+ chars, solo letras/espacios/tildes | "El apellido debe tener al menos 2 caracteres" |
| **correo** | Requerido, formato válido, existencia (registro) | "Formato de email inválido" |
| **contrasena** | 8+ chars, mayúscula, número, símbolo | "La contraseña debe incluir mayúscula, número y símbolo" |
| **telefono** | Opcional, exactamente 10 dígitos | "El teléfono debe contener exactamente 10 números" |
| **direcciones** | Dirección (5-100 chars), depto/ciudad requeridos | "La dirección debe tener al menos 5 caracteres" |

### 🏢 **Emprendimiento** (emprendimiento.model.js)
| Campo | Validaciones | Mensaje Error |
|-------|-------------|---------------|
| **nombreEmprendimiento** | Requerido, 3-100 chars | "El nombre debe tener al menos 3 caracteres" |
| **descripcionEmprendimiento** | Opcional, máx 500 chars | "No puede superar los 500 caracteres" |
| **ubicacionEmprendimiento.ciudad** | Requerido, solo letras/espacios/tildes | "Solo puede contener letras y espacios" |
| **ubicacionEmprendimiento.departamento** | Requerido, solo letras/espacios/tildes | "Solo puede contener letras y espacios" |
| **logo** | Opcional, imagen válida, máx 5MB | "Solo se permiten imágenes (JPG, PNG, GIF...)" |

### 📦 **Producto** (productos.model.js)
| Campo | Validaciones | Mensaje Error |
|-------|-------------|---------------|
| **tituloProducto** | Requerido, 3-100 chars | "El título debe tener al menos 3 caracteres" |
| **descripcionProducto** | Requerido, 3-1000 chars | "La descripción debe tener al menos 3 caracteres" |
| **precio** | Requerido, número ≥ 0, máx 2 decimales | "El precio no puede ser negativo" |
| **imagenes** | 1-10 imágenes, formatos válidos, máx 5MB c/u | "Debe seleccionar entre 1 y 10 imágenes" |
| **idEmprendimiento** | Requerido, select válido | "Debe seleccionar un emprendimiento" |
| **categoria** | Requerido, select válido | "Debe seleccionar una categoría" |
| **etiquetas** | 1-10 etiquetas | "Debe seleccionar entre 1 y 10 etiquetas" |

### 📝 **Pedido/Mensaje** (pedidos.model.js)
| Campo | Validaciones | Mensaje Error |
|-------|-------------|---------------|
| **contenidoMensaje** | Requerido, 1-1000 chars | "El mensaje no puede estar vacío" |
| **unidades** | Requerido, entero 1-999 | "Debe haber al menos 1 unidad" |
| **descripcionPedido** | Requerido, 3-255 chars | "La descripción debe tener al menos 3 caracteres" |

### 🚨 **Reportes**
| Campo | Validaciones | Mensaje Error |
|-------|-------------|---------------|
| **motivoReporte** | Requerido, enum válido | "Debe seleccionar un motivo de reporte" |
| **descripcionReporte** | Requerido, 20-500 chars | "La descripción debe tener al menos 20 caracteres" |

### 🏷️ **Categoría** (categorias.model.js)
| Campo | Validaciones | Mensaje Error |
|-------|-------------|---------------|
| **nombreCategoria** | Requerido, 2-50 chars, alfanumérico | "Solo puede contener letras, números y espacios" |
| **imagen** | Opcional, imagen válida, máx 5MB | "Solo se permiten imágenes válidas" |

### 🔖 **Etiqueta** (etiquetas.model.js)
| Campo | Validaciones | Mensaje Error |
|-------|-------------|---------------|
| **nombreEtiqueta** | Requerido, 2-50 chars, alfanumérico | "Solo puede contener letras, números y espacios" |

## ⚡ Características Técnicas

### **🔧 Funciones Utilitarias Reutilizables**
- `mostrarError(campo, elementoError, mensaje)` - Aplica estilos de error
- `mostrarExito(campo, elementoError)` - Aplica estilos de éxito  
- `validarFormatoEmail(email)` - Validación regex de email
- `validarFormatoNombreApellido(valor)` - Solo letras y tildes
- `validarFormatoTelefono(telefono)` - Exactamente 10 dígitos
- `validarTextoAlfanumerico(texto)` - Letras, números, espacios

### **🎨 Feedback Visual**
- **Bootstrap Classes**: `is-valid` / `is-invalid`
- **Elementos Error**: `.invalid-feedback` con mensajes específicos
- **Toast Notifications**: Integración con sistema de toasts existente
- **Validación en Tiempo Real**: Eventos `blur`, `input`, `change`

### **📱 Compatibilidad**
- **Verificación de Existencia**: Todos los elementos verificados antes de usar
- **Manejo de Errores**: Try-catch en llamadas API, fallbacks con alert
- **Formularios Opcionales**: Solo se validan si existen en el DOM
- **Responsive**: Toast notifications adaptativas móvil/desktop

## 🎯 IDs de Elementos Esperados

### **Login/Registro**
```html
<!-- Login -->
<form id="loginForm">
  <input id="correoLogin">
  <input id="contrasenaLogin">
  <div id="emailLoginError" class="invalid-feedback"></div>
  <div id="contrasenaLoginError" class="invalid-feedback"></div>
</form>

<!-- Registro -->
<form id="registerForm">
  <input id="email">
  <input id="nombreUsuario">
  <input id="apellidoUsuario">
  <input id="telefono">
  <input id="contrasena">
  <input id="confirmarContrasena">
</form>
```

### **Emprendimientos**
```html
<form id="form-crear-emprendimiento">
  <input id="nombreEmprendimiento">
  <textarea id="descripcionEmprendimiento">
  <input id="ubicacionCiudad">
  <input id="ubicacionDepartamento">
  <input id="logo" type="file">
</form>
```

### **Productos**
```html
<form id="form-crear-producto">
  <input id="titulo">
  <textarea id="descripcion">
  <input id="precio" type="number">
  <input id="imagenes" type="file" multiple>
  <select id="emprendimiento">
  <select id="categoria">
  <input id="etiquetasHidden" type="hidden">
</form>
```

### **Contacto**
```html
<form> <!-- En página contactanos -->
  <input id="mensaje">
  <input id="correo" type="email">
</form>
```

## 🚀 Implementación

### **1. Incluir Scripts**
```html
<script src="/js/validaciones-login-signup.js"></script>
<script src="/js/validaciones-emprendimientos.js"></script>
<script src="/js/validaciones-productos.js"></script>
<script src="/js/validaciones-generales.js"></script>
<script src="/js/validaciones-admin.js"></script>
```

### **2. Dependencias**
- **mostrarToast()**: Función global del archivo `login_signup.js`
- **API_BASE**: Variable global con la URL base de la API
- **Bootstrap**: Classes y componentes para estilos de validación

### **3. Integración con Backend**
- **Verificación Email**: `GET /api/usuarios/verificar-email/{email}`
- **Submits**: Los formularios se envían normalmente después de validación
- **Toasts**: Feedback inmediato mientras se procesa en backend

## 📋 Estado de Implementación

### ✅ **Completamente Implementado**
- Registro/Login/Editar perfil usuarios
- Crear emprendimientos
- Crear productos  
- Contacto
- Mensajes en pedidos
- Reportes
- Administración categorías/etiquetas
- Pedidos/carrito básico

### 🔧 **Estructura Base (Expandible)**
- Editar emprendimientos
- Editar productos
- Formularios de administración avanzados

### 📈 **Extensiones Futuras**
- Validación de direcciones con API de geolocalización
- Validación de archivos con vista previa
- Validaciones asíncronas con debouncing
- Integración con sistema de notificaciones push

---

**✨ Sistema de validaciones completo y listo para producción**
