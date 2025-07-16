# Acceso a Archivos en /storage - GICPhotoAI Backend

## 📍 URL de Acceso para Archivos

### ✅ URL Correcta para tu servidor en 192.168.100.184:3002:
```
http://192.168.100.184:3002/storage/mi_archivo.jpg
```

## 🔧 Configuración del Servidor

### Archivos Estáticos Configurados en `index.js` (líneas 25-27):
```javascript
//Image Path - Static file serving
app.use(express.static(path.join(__dirname, "public")));
app.use("/storage", express.static(path.join(__dirname, "storage")));
```

### Puerto Configurado en `config.js`:
```javascript
PORT: process.env.PORT || 3002, // Different port from flirtzy-backend
baseURL: "http://192.168.100.184:3002/",
```

## 📂 Estructura de Acceso

- **Carpeta física**: `gicphotoai-backend/storage/`
- **Ruta web**: `/storage/`
- **URL completa**: `http://192.168.100.184:3002/storage/[nombre_archivo]`

## 🌐 Ejemplos de URLs

### Para diferentes tipos de archivos en /storage:
- **Imagen JPG**: `http://192.168.100.184:3002/storage/mi_archivo.jpg`
- **Imagen PNG**: `http://192.168.100.184:3002/storage/imagen.png`
- **Video MP4**: `http://192.168.100.184:3002/storage/video.mp4`
- **Audio MP3**: `http://192.168.100.184:3002/storage/audio.mp3`
- **Documento PDF**: `http://192.168.100.184:3002/storage/documento.pdf`

### Para archivos en subcarpetas:
- **Subcarpeta**: `http://192.168.100.184:3002/storage/uploads/archivo.jpg`
- **Múltiples niveles**: `http://192.168.100.184:3002/storage/GenerativeReplicate/images/imagen.webp`

## 🔍 Verificación de Configuración

### Middleware de Express configurado correctamente:
- ✅ Puerto: 3002
- ✅ Ruta estática: `/storage`
- ✅ Carpeta física: `./storage`
- ✅ Base URL: `http://192.168.100.184:3002/`

### Diferencias con flirtzy-backend:
- **gicphotoai-backend**: Puerto 3002
- **flirtzy-backend**: Puerto 3001

## 🚀 Uso en la Aplicación

Los archivos almacenados en la carpeta `/storage` son accesibles directamente vía HTTP sin necesidad de:
- Autenticación
- Endpoints especiales
- Headers adicionales

Simplemente usando la URL directa en:
- Navegadores web
- Aplicaciones móviles
- Llamadas AJAX/fetch
- Tags HTML `<img>`, `<video>`, `<audio>`

## ✅ Respuesta Final

**Para el archivo `mi_archivo.jpg` en la carpeta `/storage` con tu servidor en 192.168.100.184:3002:**

```
http://192.168.100.184:3002/storage/mi_archivo.jpg
```