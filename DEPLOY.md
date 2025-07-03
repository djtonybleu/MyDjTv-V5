# 🚀 Guía de Despliegue en Render - MyDJTV

## 📋 Requisitos Previos

### 1. **Cuentas Necesarias**
- [Render](https://render.com) - Hosting
- [Stripe](https://stripe.com) - Pagos
- [Spotify for Developers](https://developer.spotify.com) - API Musical
- [Cloudinary](https://cloudinary.com) - Almacenamiento de archivos

### 2. **Configurar APIs Externas**

#### **Stripe (Pagos)**
1. Crear cuenta en Stripe
2. Obtener claves de producción:
   - `STRIPE_SECRET_KEY` (sk_live_...)
   - `STRIPE_PUBLISHABLE_KEY` (pk_live_...)
3. Configurar webhook endpoint: `https://mydjtv-backend.onrender.com/api/payments/webhook`
4. Obtener `STRIPE_WEBHOOK_SECRET`

#### **Spotify API**
1. Crear app en Spotify for Developers
2. Obtener:
   - `SPOTIFY_CLIENT_ID`
   - `SPOTIFY_CLIENT_SECRET`
3. Configurar redirect URIs si es necesario

#### **Cloudinary (Archivos)**
1. Crear cuenta en Cloudinary
2. Obtener:
   - `CLOUDINARY_CLOUD_NAME`
   - `CLOUDINARY_API_KEY`
   - `CLOUDINARY_API_SECRET`

#### **VAPID Keys (Push Notifications)**
```bash
npx web-push generate-vapid-keys
```

## 🌐 Despliegue en Render

### 1. **Subir a GitHub**
```bash
git add .
git commit -m "Production ready MyDJTV platform"
git remote add origin https://github.com/tu-usuario/MyDjTv-V5.git
git push -u origin main
```

### 2. **Configurar en Render**
1. Conectar repositorio de GitHub
2. Render detectará automáticamente `render.yaml`
3. Se crearán automáticamente:
   - Backend (Node.js)
   - Frontend (Static Site)
   - Base de datos PostgreSQL

### 3. **Configurar Variables de Entorno**
En el dashboard de Render, configurar:

**Backend:**
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `SPOTIFY_CLIENT_ID`
- `SPOTIFY_CLIENT_SECRET`
- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`
- `VAPID_PUBLIC_KEY`
- `VAPID_PRIVATE_KEY`

**Frontend:**
- `VITE_STRIPE_PUBLISHABLE_KEY`

### 4. **Inicializar Base de Datos**
Una vez desplegado el backend:
```bash
# Ejecutar seeder desde Render Shell
npm run seed
```

## 🎯 URLs de Producción

- **Frontend**: `https://mydjtv-frontend.onrender.com`
- **Backend API**: `https://mydjtv-backend.onrender.com/api`
- **Admin Panel**: `https://mydjtv-frontend.onrender.com/admin`

## 👥 Cuentas Iniciales

Después del seeder:
- **Admin**: `admin@mydjtv.com` / `MyDJTV2024!`
- **Venue**: `venue@mydjtv.com` / `Venue2024!`

## 🔧 Funcionalidades en Producción

### ✅ **Completamente Funcionales**
- Autenticación JWT
- Base de datos PostgreSQL
- WebSockets tiempo real
- Búsqueda musical con Spotify
- Pagos con Stripe
- Upload de archivos a Cloudinary
- Push notifications
- Analytics en tiempo real
- QR code generation
- Sistema de suscripciones

### 💰 **Modelo de Negocio Activo**
- Suscripción Premium: $9.99/mes
- Revenue sharing automático
- Analytics de conversión
- Métricas de engagement

## 🚨 Post-Despliegue

### 1. **Verificar Funcionalidades**
- [ ] Login/registro funciona
- [ ] Búsqueda de música
- [ ] Procesamiento de pagos
- [ ] Upload de comerciales
- [ ] WebSockets conectados

### 2. **Configurar Webhooks**
- Stripe webhook apuntando a `/api/payments/webhook`
- Verificar que los eventos se procesen correctamente

### 3. **Monitoreo**
- Logs en Render dashboard
- Métricas de base de datos
- Performance de la aplicación

## 🎉 ¡Listo para Producción!

La plataforma MyDJTV está completamente configurada para producción con todas las funcionalidades empresariales activas.