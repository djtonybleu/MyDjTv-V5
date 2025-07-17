# 🚀 Guía de Inicio Rápido - MyDJTV

## 📋 Cuentas de Prueba Creadas

Después de ejecutar el seeder, tendrás estas cuentas:

### 👑 **Admin**
- **Email**: `admin@mydjtv.com`
- **Password**: `MyDJTV2024!`
- **Acceso**: Panel completo de administración

### 🏢 **Venue Owner (Negocio)**
- **Email**: `venue@mydjtv.com`
- **Password**: `Venue2024!`
- **Acceso**: Dashboard de sucursal + gestión de comerciales

## 🛠️ Pasos para Iniciar

### 1. **Configurar PostgreSQL**
```bash
# macOS
brew install postgresql
brew services start postgresql

# O usar Docker
docker run --name mydjtv-postgres -e POSTGRES_PASSWORD=password -p 5432:5432 -d postgres
```

### 2. **Iniciar Backend**
```bash
cd server
npm install
npx prisma generate
npx prisma db push
npm run seed
npm run dev     # Iniciar servidor en puerto 5000
```

### 3. **Iniciar Frontend**
```bash
cd ..
npm install
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

### PostgreSQL no conecta
```bash
# Verificar que PostgreSQL esté corriendo
brew services list | grep postgres
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