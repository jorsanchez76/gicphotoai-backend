# GICPhotoAI Backend

Proyecto paralelo basado en Flirtzy Backend, migrado a SQLite local.

## Características

- **Base de datos**: SQLite local (sin dependencias externas)
- **Puerto**: 3002 (diferente de flirtzy-backend)
- **Módulos incluidos**:
  - Settings (configuraciones)
  - User (gestión de usuarios)
  - Notification (notificaciones y FCM)
  - Gichub (manejo de archivos)

## Endpoints Disponibles

### Settings
- `GET /api/setting` - Obtener configuraciones
- `POST /api/setting` - Crear configuraciones
- `PATCH /api/setting` - Actualizar configuraciones
- `PUT /api/setting` - Toggle switches

### User
- `GET /api/user/userProfile?id=1` - Obtener perfil de usuario
- `POST /api/user/create` - Crear usuario
- `PATCH /api/user/update` - Actualizar usuario
- `GET /api/user/all` - Obtener todos los usuarios

### Notification
- `POST /api/notification/updateFCM` - Actualizar token FCM
- `GET /api/notification/userList?userId=1` - Notificaciones de usuario
- `GET /api/notification/hostList?hostId=1` - Notificaciones de host
- `POST /api/notification/create` - Crear notificación

### Gichub (Manejo de archivos)
- `POST /api/gichub/gichubUpload` - Subir archivo
- `POST /api/gichub/gichubMove` - Mover archivo
- `POST /api/gichub/gichubList` - Listar archivos
- `POST /api/gichub/gichubDelete` - Eliminar archivo

## Instalación

1. Instalar dependencias:
\`\`\`bash
npm install
\`\`\`

2. Iniciar servidor:
\`\`\`bash
npm start
# o
npm run dev
\`\`\`

3. El servidor estará disponible en: http://localhost:3002

## Autenticación

Todos los endpoints requieren el header:
\`\`\`
key: {aBcDeFgHiJKlMnO}
\`\`\`

## Health Check

- `GET /health` - Verificar estado del servidor y base de datos

## Base de datos

- Archivo SQLite: `gicphotoai.db` (se crea automáticamente)
- Tablas: settings, users, hosts, notifications
- Inicialización automática al iniciar el servidor

## Estructura del proyecto

\`\`\`
gicphotoai-backend/
├── config.js              # Configuración
├── index.js               # Servidor principal
├── route.js               # Rutas principales
├── checkAccess.js         # Middleware de autenticación
├── server/
│   ├── database/
│   │   └── sqlite.js      # Conexión SQLite
│   ├── setting/           # Módulo de configuraciones
│   ├── user/              # Módulo de usuarios
│   ├── notification/      # Módulo de notificaciones
│   └── gichub/           # Módulo de archivos
├── util/                  # Utilidades
├── storage/               # Almacén de archivos
└── gicphotoai.db         # Base de datos SQLite
\`\`\`