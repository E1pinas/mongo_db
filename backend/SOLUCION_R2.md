# 🔧 Solución al problema de conexión con R2 (Cloudflare)

## Problema Actual

```
Error: connect ETIMEDOUT 172.64.66.1:443
```

Esto significa que tu servidor no puede conectarse a Cloudflare R2.

## Posibles causas:

### 1. **Problema de red/firewall**

- Tu firewall o antivirus está bloqueando las conexiones salientes al puerto 443
- Tu ISP está bloqueando conexiones a Cloudflare

### 2. **Credenciales incorrectas**

- Verifica que las variables de entorno en `.env` sean correctas:
  - `R2_ENDPOINT`
  - `R2_ACCESS_KEY_ID`
  - `R2_SECRET_ACCESS_KEY`
  - `R2_BUCKET_NAME`
  - `R2_PUBLIC_URL`

### 3. **Región/Endpoint incorrecto**

- Verifica que el endpoint de R2 sea el correcto para tu cuenta

## Soluciones:

### Opción 1: Verificar configuración de R2

1. Ve a tu dashboard de Cloudflare: https://dash.cloudflare.com
2. Navega a R2 Object Storage
3. Verifica:
   - Que el bucket `proyect-oto` exista
   - Que las credenciales API sean válidas
   - Que el endpoint sea correcto (debe ser algo como `https://<account-id>.r2.cloudflarestorage.com`)

### Opción 2: Probar con almacenamiento local (temporal)

Mientras solucionas R2, puedes usar almacenamiento local:

```bash
# En backend/
mkdir -p public/uploads/avatares
mkdir -p public/uploads/banners
```

Crea `backend/src/services/localStorageService.js`:

```javascript
import fs from "fs/promises";
import path from "path";
import crypto from "crypto";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");

export const subirArchivoLocal = async (
  fileBuffer,
  originalName,
  folder = "audio",
  mimeType
) => {
  try {
    const extension = path.extname(originalName);
    const nombreUnico = `${crypto.randomUUID()}${extension}`;
    const folderPath = path.join(UPLOAD_DIR, folder);

    // Crear carpeta si no existe
    await fs.mkdir(folderPath, { recursive: true });

    const filePath = path.join(folderPath, nombreUnico);
    await fs.writeFile(filePath, fileBuffer);

    // Retornar URL local
    return `http://localhost:3000/uploads/${folder}/${nombreUnico}`;
  } catch (error) {
    console.error("Error al guardar archivo localmente:", error);
    throw new Error("Error al guardar el archivo");
  }
};

export const eliminarArchivoLocal = async (fileUrl) => {
  try {
    if (!fileUrl.includes("localhost")) return;

    const relativePath = fileUrl.replace("http://localhost:3000/", "");
    const filePath = path.join(process.cwd(), "public", relativePath);

    await fs.unlink(filePath);
    console.log(`✅ Archivo eliminado: ${relativePath}`);
  } catch (error) {
    console.error("Error al eliminar archivo:", error);
  }
};
```

Luego modifica `perfilController.js` para usar almacenamiento local como fallback:

```javascript
import { subirArchivoLocal, eliminarArchivoLocal } from "../services/localStorageService.js";

// En subirAvatar, reemplazar:
const avatarUrl = await subirArchivoR2(...);

// Por:
let avatarUrl;
try {
  avatarUrl = await subirArchivoR2(buffer, originalname, "usuarios/avatares", mimetype);
} catch (error) {
  console.warn('R2 no disponible, usando almacenamiento local');
  avatarUrl = await subirArchivoLocal(buffer, originalname, "avatares", mimetype);
}
```

### Opción 3: Verificar conectividad

Ejecuta estos comandos para probar la conexión:

```bash
# Windows
ping 172.64.66.1

# Probar conectividad HTTPS
curl https://pub-577a03f8525e47808cf630b416018152.r2.dev
```

### Opción 4: Usar VPN o cambiar DNS

A veces los ISP bloquean ciertos servicios. Intenta:

- Usar una VPN
- Cambiar DNS a 1.1.1.1 (Cloudflare) o 8.8.8.8 (Google)

## Cambios realizados ahora:

✅ **Frontend** - Ahora continúa guardando el perfil (nick/bio) incluso si las imágenes fallan
✅ **Backend** - Timeout reducido de 30s a 10s para fallar más rápido
✅ **Backend** - Mensajes de error más claros sobre problemas de conexión

## Prueba ahora:

1. Reinicia el backend: `npm start`
2. Intenta editar solo el nick y bio (sin imágenes)
3. Debería guardar correctamente aunque R2 no funcione

## Para seguir usando R2:

Contacta con soporte de Cloudflare si el problema persiste:
https://dash.cloudflare.com/?to=/:account/support
