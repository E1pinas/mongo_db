# 🎵 Sistema de Upload de Canciones a R2

## 📦 Configuración

### 1. Variables de Entorno

Copia `.env.example` a `.env` y configura:

```env
# Cloudflare R2
R2_ENDPOINT=https://[tu-account-id].r2.cloudflarestorage.com
R2_ACCESS_KEY_ID=tu_access_key_id
R2_SECRET_ACCESS_KEY=tu_secret_access_key
R2_BUCKET_NAME=nombre-de-tu-bucket
R2_PUBLIC_URL=https://tu-dominio-publico.com

# MongoDB
MONGODB_URI=mongodb://localhost:27017/tcg_music

# JWT
JWT_SECRET=tu_secret_super_secreto_aqui

# Server
PORT=3001
```

### 2. Configurar Cloudflare R2

1. **Crear Bucket:**

   - Ve a Cloudflare Dashboard → R2
   - Crea un nuevo bucket (ej: `tcg-music`)
   - Configura el bucket como público

2. **Obtener Credenciales:**

   - Ve a R2 → Manage R2 API Tokens
   - Crea un token con permisos de lectura/escritura
   - Copia el Access Key ID y Secret Access Key

3. **Configurar Dominio Público:**
   - En tu bucket, ve a Settings → Public Access
   - Conecta un dominio personalizado o usa el que proporciona R2
   - Actualiza `R2_PUBLIC_URL` con tu dominio

### 3. Instalar Dependencias

```bash
npm install
```

### 4. Iniciar Servidor

```bash
npm run dev
```

---

## 🚀 Endpoints de Upload

### 1. Subir Solo Audio

**Endpoint:** `POST /api/upload/audio`

**Headers:**

```
Authorization: Bearer {token}
```

**Body (form-data):**

```
audio: archivo.mp3
```

**Respuesta:**

```json
{
  "ok": true,
  "message": "Audio subido correctamente",
  "audioUrl": "https://tu-dominio.com/audio/uuid.mp3",
  "metadatos": {
    "nombreOriginal": "archivo.mp3",
    "tamanioMB": "4.52",
    "formato": "audio/mpeg"
  }
}
```

**Curl Example:**

```bash
curl -X POST http://localhost:3001/api/upload/audio \
  -H "Authorization: Bearer tu_token" \
  -F "audio=@/ruta/a/tu/audio.mp3"
```

---

### 2. Subir Solo Imagen (Portada)

**Endpoint:** `POST /api/upload/imagen`

**Headers:**

```
Authorization: Bearer {token}
```

**Body (form-data):**

```
imagen: portada.jpg
```

**Respuesta:**

```json
{
  "ok": true,
  "message": "Imagen subida correctamente",
  "imagenUrl": "https://tu-dominio.com/images/uuid.jpg",
  "metadatos": {
    "nombreOriginal": "portada.jpg",
    "tamanioKB": "850.25",
    "formato": "image/jpeg"
  }
}
```

**Curl Example:**

```bash
curl -X POST http://localhost:3001/api/upload/imagen \
  -H "Authorization: Bearer tu_token" \
  -F "imagen=@/ruta/a/tu/portada.jpg"
```

---

### 3. Subir Canción Completa (Audio + Metadata + Portada)

**Endpoint:** `POST /api/upload/cancion-completa`

**Headers:**

```
Authorization: Bearer {token}
```

**Body (form-data):**

```
audio: archivo.mp3 (requerido)
portada: imagen.jpg (opcional)
titulo: "Nombre de la Canción" (requerido)
duracionSegundos: 210 (requerido)
generos: "rock,indie,alternative" (opcional)
esPrivada: false (opcional)
esExplicita: false (opcional)
album: 673d2a1b5f8e9c001234abcd (opcional, ObjectId)
```

**Respuesta:**

```json
{
  "ok": true,
  "message": "Canción subida y creada correctamente",
  "cancion": {
    "_id": "673d2a1b5f8e9c001234abcd",
    "titulo": "Nombre de la Canción",
    "artistas": [
      {
        "_id": "user_id",
        "nick": "usuario123",
        "nombre": "Usuario",
        "avatarUrl": "https://..."
      }
    ],
    "album": null,
    "esSingle": true,
    "duracionSegundos": 210,
    "generos": ["rock", "indie", "alternative"],
    "audioUrl": "https://tu-dominio.com/audio/uuid.mp3",
    "portadaUrl": "https://tu-dominio.com/covers/uuid.jpg",
    "esPrivada": false,
    "esExplicita": false,
    "reproduccionesTotales": 0,
    "likes": [],
    "estaEliminada": false,
    "createdAt": "2025-11-28T10:00:00.000Z",
    "updatedAt": "2025-11-28T10:00:00.000Z"
  }
}
```

**Curl Example:**

```bash
curl -X POST http://localhost:3001/api/upload/cancion-completa \
  -H "Authorization: Bearer tu_token" \
  -F "audio=@/ruta/a/tu/audio.mp3" \
  -F "portada=@/ruta/a/tu/portada.jpg" \
  -F "titulo=Mi Nueva Canción" \
  -F "duracionSegundos=210" \
  -F "generos=rock,indie" \
  -F "esExplicita=false" \
  -F "esPrivada=false"
```

---

## 📝 Workflow Recomendado

### Opción 1: Subir Todo de Una Vez (Recomendado)

```javascript
// Frontend: React ejemplo con fetch
const subirCancion = async (audioFile, portadaFile, metadata) => {
  const formData = new FormData();

  formData.append("audio", audioFile);
  if (portadaFile) {
    formData.append("portada", portadaFile);
  }
  formData.append("titulo", metadata.titulo);
  formData.append("duracionSegundos", metadata.duracion);
  formData.append("generos", metadata.generos.join(","));
  formData.append("esExplicita", metadata.esExplicita);
  formData.append("esPrivada", metadata.esPrivada);

  const response = await fetch(
    "http://localhost:3001/api/upload/cancion-completa",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    }
  );

  const data = await response.json();
  return data;
};
```

### Opción 2: Subir en Pasos Separados

```javascript
// 1. Subir audio primero
const subirAudioPrimero = async (audioFile) => {
  const formData = new FormData();
  formData.append("audio", audioFile);

  const response = await fetch("http://localhost:3001/api/upload/audio", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });

  const { audioUrl } = await response.json();
  return audioUrl;
};

// 2. Subir portada (opcional)
const subirPortada = async (imagenFile) => {
  const formData = new FormData();
  formData.append("imagen", imagenFile);

  const response = await fetch("http://localhost:3001/api/upload/imagen", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });

  const { imagenUrl } = await response.json();
  return imagenUrl;
};

// 3. Crear canción con las URLs
const crearCancion = async (audioUrl, portadaUrl, metadata) => {
  const response = await fetch("http://localhost:3001/api/canciones", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      titulo: metadata.titulo,
      audioUrl: audioUrl,
      portadaUrl: portadaUrl,
      duracionSegundos: metadata.duracion,
      generos: metadata.generos,
      esExplicita: metadata.esExplicita,
      esPrivada: metadata.esPrivada,
    }),
  });

  return await response.json();
};
```

---

## 🎯 Obtener Canciones (Para Reproducir)

### Obtener Canción por ID

**Endpoint:** `GET /api/canciones/:id`

**Respuesta:**

```json
{
  "ok": true,
  "cancion": {
    "_id": "673d2a1b5f8e9c001234abcd",
    "titulo": "Mi Canción",
    "audioUrl": "https://tu-dominio.com/audio/uuid.mp3",
    "portadaUrl": "https://tu-dominio.com/covers/uuid.jpg",
    "artistas": [...],
    "duracionSegundos": 210,
    "generos": ["rock", "indie"]
  },
  "restricciones": {
    "puedeReproducir": true,
    "motivoRestriccion": null,
    "esExplicita": false
  }
}
```

### Reproducir Canción en Frontend

```javascript
const reproducirCancion = (cancion) => {
  const audio = new Audio(cancion.audioUrl);
  audio.play();

  // Contar reproducción
  fetch(`http://localhost:3001/api/canciones/${cancion._id}/reproducir`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};
```

---

## 📋 Formatos Permitidos

### Audio

- ✅ MP3 (audio/mpeg)
- ✅ WAV (audio/wav, audio/wave)
- ✅ FLAC (audio/flac)
- ✅ AAC (audio/aac)
- ✅ OGG (audio/ogg)

**Tamaño máximo:** 50 MB

### Imágenes

- ✅ JPG/JPEG (image/jpeg)
- ✅ PNG (image/png)
- ✅ WebP (image/webp)

**Tamaño máximo:** 5 MB

---

## 🔒 Seguridad

- Todos los endpoints requieren autenticación (`Authorization: Bearer {token}`)
- Los archivos son validados por tipo MIME y tamaño
- Nombres de archivo únicos (UUID) para evitar colisiones
- Archivos subidos son públicos y accesibles por URL directa

---

## 🐛 Manejo de Errores

### Error de Autenticación

```json
{
  "ok": false,
  "message": "Token no proporcionado"
}
```

### Error de Formato

```json
{
  "ok": false,
  "message": "Formato de audio no válido. Usa MP3, WAV, FLAC, AAC u OGG"
}
```

### Error de Tamaño

```json
{
  "ok": false,
  "message": "El archivo excede el tamaño máximo permitido"
}
```

### Error de Campos Faltantes

```json
{
  "ok": false,
  "message": "Faltan campos obligatorios: titulo, duracionSegundos"
}
```

---

## 📦 Estructura de Archivos en R2

```
tu-bucket/
├── audio/
│   ├── uuid-1.mp3
│   ├── uuid-2.wav
│   └── uuid-3.flac
├── covers/
│   ├── uuid-1.jpg
│   └── uuid-2.png
└── images/
    ├── uuid-1.jpg
    └── uuid-2.png
```

---

## 🚀 Tips de Optimización

1. **Comprimir audio antes de subir:** Usa herramientas como FFmpeg para optimizar
2. **Optimizar imágenes:** Reduce el tamaño de las portadas (recomendado: 1000x1000px)
3. **Usar WebP para portadas:** Mejor compresión que JPG/PNG
4. **Implementar caché en frontend:** Guarda las URLs de canciones reproducidas recientemente

---

## 📞 Soporte

Si tienes problemas:

1. Verifica que las credenciales de R2 sean correctas
2. Asegúrate que el bucket sea público
3. Revisa los logs del servidor con `npm run dev`
4. Verifica que el token JWT sea válido
