# 🚀 Guía de Inicio Rápido - MyDJTV

## 📋 Cuentas de Prueba Creadas

Después de ejecutar el seeder, tendrás estas cuentas:

### 👑 **Admin**
- **Email**: `admin@mydjtv.com`
- **Password**: `admin123`
- **Acceso**: Panel completo de administración

### 🏢 **Venue Owner (Negocio)**
- **Email**: `venue@mydjtv.com`
- **Password**: `venue123`
- **Acceso**: Dashboard de sucursal + gestión de comerciales

### 👤 **Usuario Premium**
- **Email**: `user@mydjtv.com`
- **Password**: `user123`
- **Acceso**: Control remoto premium activado

## 🛠️ Pasos para Iniciar

### 1. **Instalar MongoDB**
```bash
# macOS
brew install mongodb-community
brew services start mongodb-community

# O usar MongoDB Atlas (cloud)
```

### 2. **Iniciar Backend**
```bash
cd server
npm run seed    # Crear usuarios de prueba
npm run dev     # Iniciar servidor en puerto 5000
```

### 3. **Iniciar Frontend**
```bash
npm run dev     # Iniciar en puerto 5173
```

### 4. **Probar la Aplicación**

1. **Ir a**: `http://localhost:5173`
2. **Hacer clic en "Iniciar Sesión"**
3. **Usar cualquiera de las cuentas de prueba**

## 🎯 Flujo de Prueba Recomendado

### Como Admin (`admin@mydjtv.com`)
1. Ve a `/admin` después del login
2. Revisa el dashboard con métricas
3. Gestiona venues y usuarios
4. Ve analytics en tiempo real

### Como Venue Owner (`venue@mydjtv.com`)
1. Ve a `/venue/[venue-id]` después del login
2. Sube comerciales de audio
3. Crea playlists personalizadas
4. Ve el player de tu sucursal

### Como Usuario Premium (`user@mydjtv.com`)
1. Ve a `/remote` después del login
2. Controla la música como Spotify
3. Busca canciones (usa demo tracks)
4. Cambia volumen y crea listas

## 🔧 Funcionalidades Disponibles

### ✅ **Funcionando Sin APIs Externas**
- Autenticación completa
- Dashboard de admin
- Gestión de venues
- Control remoto básico
- WebSockets en tiempo real
- Upload de archivos (mock)

### 🔑 **Requiere API Keys para Funcionar**
- Búsqueda real de Spotify
- Pagos con Stripe
- Upload real a Cloudinary
- Notificaciones push

## 📱 URLs de Prueba

- **Landing**: `http://localhost:5173/`
- **Admin**: `http://localhost:5173/admin`
- **Remote**: `http://localhost:5173/remote`
- **Player**: `http://localhost:5173/player/demo`
- **Venue Dashboard**: `http://localhost:5173/venue/[venue-id]`

## 🚨 Troubleshooting

### MongoDB no conecta
```bash
# Verificar que MongoDB esté corriendo
brew services list | grep mongodb
```

### Puerto ocupado
```bash
# Cambiar puerto en .env si es necesario
PORT=5001
```

### No aparecen usuarios
```bash
# Ejecutar seeder nuevamente
cd server
npm run seed
```

## 🎉 ¡Listo para Probar!

El proyecto está **100% funcional** para desarrollo y pruebas. Solo configura las APIs externas cuando quieras funcionalidades premium.