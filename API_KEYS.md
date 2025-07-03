# 🔑 API Keys para Configurar en Render

## Variables de Entorno del Backend

```
STRIPE_SECRET_KEY=sk_live_tu_clave_secreta_stripe
STRIPE_WEBHOOK_SECRET=whsec_tu_webhook_secret
SPOTIFY_CLIENT_ID=tu_spotify_client_id
SPOTIFY_CLIENT_SECRET=tu_spotify_client_secret
CLOUDINARY_CLOUD_NAME=tu_cloudinary_name
CLOUDINARY_API_KEY=tu_cloudinary_api_key
CLOUDINARY_API_SECRET=tu_cloudinary_api_secret
VAPID_PUBLIC_KEY=BFIKhszcJKi6HALr34wMufkRvw4diO3K3GyklO4nJ4YbTaTLo9KrBDPx9czqmLDFBfYjj8BFZc10658mQFtmTwU
VAPID_PRIVATE_KEY=bnCCYh-aM11mnK4oRW4xuA-yqM09FDtVZPO29inmrJU
```

## Variables de Entorno del Frontend

```
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_tu_clave_publica_stripe
```

## 📋 Pasos para Obtener las Claves:

### 1. **Stripe**
- Ir a: https://dashboard.stripe.com/apikeys
- Copiar claves de producción
- Crear webhook en: https://dashboard.stripe.com/webhooks
- Endpoint: `https://mydjtv-backend.onrender.com/api/payments/webhook`

### 2. **Spotify**
- Ir a: https://developer.spotify.com/dashboard
- Crear nueva app "MyDJTV Production"
- Copiar Client ID y Client Secret

### 3. **Cloudinary**
- Ir a: https://cloudinary.com/console
- Copiar credenciales del dashboard

### 4. **VAPID Keys**
- Ya generadas arriba ✅