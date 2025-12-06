# 🚀 Guía de Despliegue - TCG Music Platform

## Prerrequisitos

1. Cuenta en GitHub
2. Cuenta en Render.com (para backend)
3. Cuenta en Vercel.com (para frontend)
4. Cuenta en MongoDB Atlas (base de datos)

## 📦 Paso 1: Configurar MongoDB Atlas

1. Ve a https://www.mongodb.com/cloud/atlas
2. Crea una cuenta gratuita
3. Crea un nuevo cluster (M0 Sandbox - FREE)
4. En "Database Access", crea un usuario con contraseña
5. En "Network Access", añade `0.0.0.0/0` (permitir todas las IPs)
6. Obtén tu connection string:
   - Click en "Connect"
   - Selecciona "Connect your application"
   - Copia el string: `mongodb+srv://usuario:password@cluster.mongodb.net/tcg`

## 📤 Paso 2: Subir código a GitHub

```bash
# En la carpeta raíz del proyecto
git init
git add .
git commit -m "Initial commit"

# Crear repositorio en GitHub y conectar
git remote add origin https://github.com/TU_USUARIO/tcg-music.git
git branch -M main
git push -u origin main
```

## 🖥️ Paso 3: Desplegar Backend en Render

1. Ve a https://render.com y crea una cuenta
2. Click en "New +" → "Web Service"
3. Conecta tu repositorio de GitHub
4. Configura:

   - **Name**: `tcg-backend`
   - **Root Directory**: `backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Instance Type**: `Free`

5. Agregar variables de entorno (Environment Variables):

   ```
   NODE_ENV=production
   PORT=3900
   MONGODB_URI=mongodb+srv://usuario:password@cluster.mongodb.net/tcg
   JWT_SECRET=tu_secreto_super_seguro_aqui
   FRONTEND_URL=https://tu-app.vercel.app

   # Cloudflare R2 (opcional, para imágenes)
   R2_ACCOUNT_ID=tu_account_id
   R2_ACCESS_KEY_ID=tu_access_key
   R2_SECRET_ACCESS_KEY=tu_secret_key
   R2_BUCKET_NAME=tcg-uploads
   R2_PUBLIC_URL=https://tu-bucket.r2.dev
   ```

6. Click en "Create Web Service"
7. Espera a que termine el deploy (5-10 minutos)
8. Copia la URL de tu backend: `https://tcg-backend.onrender.com`

## 🌐 Paso 4: Desplegar Frontend en Vercel

1. Ve a https://vercel.com y crea una cuenta
2. Click en "Add New..." → "Project"
3. Importa tu repositorio de GitHub
4. Configura:

   - **Framework Preset**: `Vite`
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

5. Agregar variables de entorno:

   ```
   VITE_API_URL=https://tcg-backend.onrender.com
   ```

6. Click en "Deploy"
7. Espera a que termine (2-3 minutos)
8. Tu app estará en: `https://tu-app.vercel.app`

## 🔧 Paso 5: Actualizar configuración del Frontend

En `frontend/src/services/api.ts`, asegúrate de que esté así:

```typescript
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3900";
```

## 📝 Notas Importantes

### Limitaciones del Plan Gratuito:

- **Render**: El backend se "duerme" después de 15 min de inactividad
- **MongoDB Atlas**: 512MB de almacenamiento
- **Vercel**: 100GB bandwidth/mes

### Almacenamiento de Archivos:

Por defecto, el proyecto usa almacenamiento local. Para producción, necesitas:

1. **Cloudflare R2** (recomendado - 10GB gratis/mes)
2. O cambiar a **AWS S3**, **Google Cloud Storage**, etc.

### CORS:

El backend ya tiene configurado CORS para aceptar peticiones del frontend.
Asegúrate de que `FRONTEND_URL` en las variables de entorno apunte a tu dominio de Vercel.

## 🔄 Actualizar el Proyecto

```bash
# Hacer cambios en tu código
git add .
git commit -m "Descripción de los cambios"
git push

# Render y Vercel detectarán los cambios y desplegarán automáticamente
```

## 🐛 Solución de Problemas

### El backend no inicia:

1. Revisa los logs en Render
2. Verifica que todas las variables de entorno estén configuradas
3. Asegúrate de que MongoDB Atlas permita conexiones desde cualquier IP

### El frontend no conecta con el backend:

1. Verifica que `VITE_API_URL` esté configurada correctamente
2. Revisa la consola del navegador para errores de CORS
3. Asegúrate de que `FRONTEND_URL` en el backend coincida con tu dominio de Vercel

### Imágenes no se cargan:

1. Si usas almacenamiento local, las imágenes se perderán en cada deploy
2. Necesitas configurar Cloudflare R2 o similar para persistencia

## 📧 Soporte

Si tienes problemas:

- Render: https://render.com/docs
- Vercel: https://vercel.com/docs
- MongoDB Atlas: https://docs.atlas.mongodb.com

## 🎉 ¡Listo!

Tu aplicación estará disponible en:

- **Frontend**: https://tu-app.vercel.app
- **Backend**: https://tcg-backend.onrender.com
