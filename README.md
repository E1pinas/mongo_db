# TCG Music Platform 🎵

Plataforma de música social con sistema de seguimiento, playlists, álbumes y posts tipo Twitter.

## 🚀 Despliegue

Ver [DEPLOY.md](DEPLOY.md) para instrucciones completas de despliegue en producción.

## 🛠️ Desarrollo Local

### Backend

```bash
cd backend
npm install
npm start
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

## 📦 Tecnologías

- **Frontend**: React + TypeScript + Vite + TailwindCSS
- **Backend**: Node.js + Express + MongoDB
- **Autenticación**: JWT
- **Almacenamiento**: Cloudflare R2 (producción) / Local (desarrollo)

## ✨ Características

- Sistema de usuarios con perfiles de artistas
- Subida de canciones, álbumes y playlists
- Sistema de seguidores y amistades
- Posts tipo Twitter con likes, comentarios y reposts
- Notificaciones en tiempo real
- Biblioteca personal (canciones, álbumes, playlists guardados)
- Reproductor de música integrado
- Sistema de búsqueda avanzado

## 📄 Licencia

MIT
