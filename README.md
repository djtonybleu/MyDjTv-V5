# MyDJTV - Plataforma de Marketing Musical Interactivo

## 🎵 Descripción

MyDJTV es una plataforma innovadora que permite a negocios (restaurantes, gimnasios, hoteles) ofrecer control musical interactivo a sus clientes mientras insertan publicidad estratégica. Los clientes pueden controlar la música como en Spotify desde su celular, mientras el negocio genera ingresos adicionales.

## 🏗️ Arquitectura

### Frontend
- **React 18** + **TypeScript**
- **Vite** para build y desarrollo
- **Tailwind CSS** para estilos
- **Framer Motion** para animaciones
- **Socket.IO Client** para tiempo real
- **Axios** para API calls
- **Stripe** para pagos

### Backend
- **Node.js** + **Express**
- **PostgreSQL** con **Prisma**
- **Socket.IO** para WebSockets
- **JWT** para autenticación
- **Stripe** para suscripciones
- **Cloudinary** para archivos
- **Spotify API** para música

## 🚀 Instalación y Configuración

### 1. Clonar el repositorio
```bash
git clone <repository-url>
cd MyDjTv-V5
```

### 2. Configurar Backend
```bash
cd server
npm install
cp .env.example .env
# Editar .env con tus credenciales
npm run dev
```

### 3. Configurar Frontend
```bash
cd ..
npm install
cp .env.example .env
# Editar .env con tus URLs
npm run dev
```

## 🔧 Variables de Entorno

### Backend (.env)
```
PORT=5000
DATABASE_URL=postgresql://postgres:password@localhost:5432/mydjtv
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters
JWT_REFRESH_SECRET=your-refresh-secret-different-from-jwt
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
SPOTIFY_CLIENT_ID=your_spotify_client_id
SPOTIFY_CLIENT_SECRET=your_spotify_client_secret
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_key
CLOUDINARY_API_SECRET=your_cloudinary_secret
NODE_ENV=development
```

### Frontend (.env)
```
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
```

## 📱 Funcionalidades

### Para Negocios
- ✅ Panel de administración completo
- ✅ Gestión de sucursales
- ✅ Upload de comerciales
- ✅ Analytics en tiempo real
- ✅ Branding personalizado
- ✅ Generación de códigos QR

### Para Usuarios
- ✅ Control remoto móvil estilo Spotify
- ✅ Búsqueda de música integrada
- ✅ Playlists personalizadas
- ✅ Suscripción premium ($9.99/mes)
- ✅ Experiencia sin anuncios

### Técnicas
- ✅ Autenticación JWT
- ✅ WebSockets para tiempo real
- ✅ Integración con Spotify API
- ✅ Procesamiento de pagos con Stripe
- ✅ Upload de archivos a Cloudinary
- ✅ Base de datos PostgreSQL con Prisma

## 🌐 Despliegue en Render

### 1. Preparar para producción
```bash
# Backend
cd server
npm run build

# Frontend
cd ..
npm run build
```

### 2. Configurar Render
1. Crear cuenta en [Render](https://render.com)
2. Conectar repositorio de GitHub
3. Crear Web Service para backend:
   - Build Command: `cd server && npm install`
   - Start Command: `cd server && npm start`
   - Environment: Node.js
4. Crear Static Site para frontend:
   - Build Command: `npm install && npm run build`
   - Publish Directory: `dist`

### 3. Variables de entorno en Render
Configurar todas las variables de entorno en el dashboard de Render.

## 💰 Modelo de Negocio

- **B2B2C Freemium**
- Negocios instalan el player gratuito
- Usuarios pagan $9.99/mes por control premium
- Revenue sharing entre MyDJTV y establecimiento
- Publicidad insertada entre canciones

## 🔄 API Endpoints

### Autenticación
- `POST /api/auth/register` - Registro
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Perfil usuario

### Sucursales
- `GET /api/venues` - Listar sucursales
- `POST /api/venues` - Crear sucursal
- `GET /api/venues/:id` - Obtener sucursal
- `PUT /api/venues/:id` - Actualizar sucursal
- `GET /api/venues/:id/analytics` - Analytics

### Música
- `GET /api/music/search` - Buscar música
- `GET /api/music/tracks/:id` - Obtener track
- `GET /api/music/playlists` - Listar playlists
- `POST /api/music/playlists` - Crear playlist

### Pagos
- `POST /api/payments/create-subscription` - Crear suscripción
- `POST /api/payments/webhook` - Webhook Stripe

### Comerciales
- `GET /api/commercials` - Listar comerciales
- `POST /api/commercials` - Subir comercial
- `PUT /api/commercials/:id` - Actualizar comercial
- `DELETE /api/commercials/:id` - Eliminar comercial

## 🎯 Próximos Pasos

1. **Integración completa con Spotify Web Playback SDK**
2. **Push notifications para móviles**
3. **Analytics avanzados con gráficos**
4. **Sistema de recomendaciones ML**
5. **App móvil nativa**
6. **Integración con Apple Music**

## 🤝 Contribuir

1. Fork el proyecto
2. Crear feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit cambios (`git commit -m 'Add AmazingFeature'`)
4. Push al branch (`git push origin feature/AmazingFeature`)
5. Abrir Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para detalles.

## 📞 Contacto

- **Proyecto**: MyDJTV Marketing Platform
- **Repositorio**: [GitHub](https://github.com/your-username/MyDjTv-V5)
- **Demo**: [Live Demo](https://mydjtv.onrender.com)