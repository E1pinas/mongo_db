// src/middlewares/upload.js
import multer from "multer";

// Configurar multer para mantener archivos en memoria
const storage = multer.memoryStorage();

// Filtro para archivos de audio
const audioFilter = (req, file, cb) => {
  const allowedMimes = [
    "audio/mpeg",
    "audio/mp3",
    "audio/wav",
    "audio/wave",
    "audio/x-wav",
    "audio/flac",
    "audio/x-flac",
    "audio/aac",
    "audio/ogg",
  ];

  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error("Formato de audio no permitido. Usa MP3, WAV, FLAC, AAC u OGG"),
      false
    );
  }
};

// Filtro para archivos de imagen
const imageFilter = (req, file, cb) => {
  const allowedMimes = ["image/jpeg", "image/jpg", "image/png"];

  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Formato de imagen no permitido. Usa JPG, PNG o WebP"), false);
  }
};

// Middleware para subir audio
export const uploadAudio = multer({
  storage: storage,
  fileFilter: audioFilter,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50 MB
  },
}).single("audio"); // Campo "audio" en el form-data

// Middleware para subir imagen (portada)
export const uploadImagen = multer({
  storage: storage,
  fileFilter: imageFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 MB
  },
}).single("imagen"); // Campo "imagen" en el form-data

// Middleware para subir audio + portada simultáneamente
export const uploadCancionCompleta = multer({
  storage: storage,
  limits: {
    fileSize: 50 * 1024 * 1024,
  },
}).fields([
  { name: "audio", maxCount: 1 },
  { name: "portada", maxCount: 1 },
]);

// Manejo de errores de multer
export const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        ok: false,
        message: "El archivo excede el tamaño máximo permitido",
      });
    }
    return res.status(400).json({
      ok: false,
      message: `Error al subir archivo: ${err.message}`,
    });
  } else if (err) {
    return res.status(400).json({
      ok: false,
      message: err.message,
    });
  }
  next();
};
