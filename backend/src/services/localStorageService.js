// src/services/localStorageService.js
import fs from "fs/promises";
import path from "path";
import crypto from "crypto";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const UPLOAD_DIR = path.join(__dirname, "../../public/uploads");

/**
 * Subir archivo al sistema de archivos local
 */
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
    const baseUrl = process.env.BASE_URL || "http://localhost:3000";
    return `${baseUrl}/uploads/${folder}/${nombreUnico}`;
  } catch (error) {
    console.error("Error al guardar archivo localmente:", error);
    throw new Error("Error al guardar el archivo");
  }
};

/**
 * Eliminar archivo del sistema de archivos local
 */
export const eliminarArchivoLocal = async (fileUrl) => {
  try {
    if (!fileUrl || !fileUrl.includes("/uploads/")) {
      return;
    }

    // Extraer la ruta relativa
    const relativePath = fileUrl.split("/uploads/")[1];
    if (!relativePath) return;

    const filePath = path.join(UPLOAD_DIR, relativePath);

    // Verificar si el archivo existe antes de eliminar
    try {
      await fs.access(filePath);
      await fs.unlink(filePath);
      console.log(`✅ Archivo eliminado: ${relativePath}`);
    } catch (err) {
      // Archivo no existe, no hacer nada
      console.log(`⚠️ Archivo no encontrado: ${relativePath}`);
    }
  } catch (error) {
    console.error("Error al eliminar archivo:", error);
  }
};

// Validadores (mismos que R2)
export const esAudioValido = (mimetype) => {
  const tiposPermitidos = [
    "audio/mpeg",
    "audio/mp3",
    "audio/wav",
    "audio/flac",
    "audio/aac",
    "audio/ogg",
  ];
  return tiposPermitidos.includes(mimetype);
};

export const esImagenValida = (mimetype) => {
  const tiposPermitidos = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
  ];
  return tiposPermitidos.includes(mimetype);
};

export const validarTamanio = (tamanio, maxMB) => {
  const maxBytes = maxMB * 1024 * 1024;
  return tamanio <= maxBytes;
};
