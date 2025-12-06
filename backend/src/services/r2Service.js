// src/services/r2Service.js
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import crypto from "crypto";
import path from "path";

// Variables de configuración (lazy loading)
let r2Client = null;
let BUCKET_NAME = null;
let PUBLIC_URL = null;

// Función para inicializar el cliente R2
const getR2Client = () => {
  if (!r2Client) {
    console.log("🔧 Inicializando cliente R2...");
    console.log("  - R2_ENDPOINT:", process.env.R2_ENDPOINT ? "✓" : "✗");
    console.log(
      "  - R2_ACCESS_KEY_ID:",
      process.env.R2_ACCESS_KEY_ID ? "✓" : "✗"
    );
    console.log(
      "  - R2_SECRET_ACCESS_KEY:",
      process.env.R2_SECRET_ACCESS_KEY ? "✓" : "✗"
    );
    console.log(
      "  - R2_BUCKET_NAME:",
      process.env.R2_BUCKET_NAME || "undefined"
    );
    console.log("  - R2_PUBLIC_URL:", process.env.R2_PUBLIC_URL || "undefined");

    r2Client = new S3Client({
      region: "auto",
      endpoint: process.env.R2_ENDPOINT,
      credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
      },
      requestHandler: {
        requestTimeout: 60000, // 60 segundos
      },
      maxAttempts: 1, // Solo 1 intento para fallar rápido
    });

    BUCKET_NAME = process.env.R2_BUCKET_NAME;
    PUBLIC_URL = process.env.R2_PUBLIC_URL;
  }
  return r2Client;
};

export const subirArchivoR2 = async (
  fileBuffer,
  originalName,
  folder = "audio",
  mimeType = "audio/mpeg"
) => {
  try {
    const client = getR2Client();

    // Generar nombre único
    const extension = path.extname(originalName);
    const nombreUnico = `${crypto.randomUUID()}${extension}`;
    const key = `${folder}/${nombreUnico}`;

    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      Body: fileBuffer,
      ContentType: mimeType,
    });

    await client.send(command);

    // Retornar URL pública
    const publicUrl = `${PUBLIC_URL}/${key}`;
    return publicUrl;
  } catch (error) {
    console.error("Error al subir archivo a R2:", error);
    throw new Error("Error al subir el archivo");
  }
};

export const eliminarArchivoR2 = async (fileUrl) => {
  try {
    if (!fileUrl || !fileUrl.includes(PUBLIC_URL)) {
      return;
    }

    const client = getR2Client();
    const key = fileUrl.replace(`${PUBLIC_URL}/`, "");

    const command = new DeleteObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    });

    await client.send(command);
    console.log(`✅ Archivo eliminado de R2: ${key}`);
  } catch (error) {
    console.error("Error al eliminar archivo de R2:", error);
  }
};

export const generarUrlFirmada = async (fileKey, expiresIn = 3600) => {
  try {
    const client = getR2Client();

    const command = new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: fileKey,
    });

    const signedUrl = await getSignedUrl(client, command, { expiresIn });
    return signedUrl;
  } catch (error) {
    console.error("Error al generar URL firmada:", error);
    throw new Error("Error al generar URL firmada");
  }
};

// Validadores
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
  const tiposPermitidos = ["image/jpeg", "image/jpg", "image/png"];
  return tiposPermitidos.includes(mimetype);
};

export const validarTamanio = (tamanio, maxMB) => {
  const maxBytes = maxMB * 1024 * 1024;
  return tamanio <= maxBytes;
};
