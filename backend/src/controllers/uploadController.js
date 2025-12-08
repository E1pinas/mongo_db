// src/controllers/uploadController.js
import {
  subirArchivoR2,
  esAudioValido,
  esImagenValida,
  validarTamanio,
} from "../services/r2Service.js";
import { Cancion } from "../models/cancionModels.js";
import { Usuario } from "../models/usuarioModels.js";
import { notificarNuevaCancion } from "../helpers/notificacionHelper.js";
import mongoose from "mongoose";

/**
 * Subir archivo de audio a R2
 * POST /api/upload/audio
 * Form-data: audio (file)
 */
export const subirAudio = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        ok: false,
        message: "No se recibió ningún archivo de audio",
      });
    }

    const { buffer, mimetype, originalname, size } = req.file;

    // Validar tipo de archivo
    if (!esAudioValido(mimetype)) {
      return res.status(400).json({
        ok: false,
        message: "Formato de audio no válido. Usa MP3, WAV, FLAC, AAC u OGG",
      });
    }

    // Validar tamaño (50 MB)
    if (!validarTamanio(size, 50)) {
      return res.status(400).json({
        ok: false,
        message: "El archivo de audio excede el tamaño máximo de 50 MB",
      });
    }

    // Subir a R2
    const audioUrl = await subirArchivoR2(
      buffer,
      originalname,
      "audio",
      mimetype
    );

    return res.status(200).json({
      ok: true,
      message: "Audio subido correctamente",
      audioUrl,
      metadatos: {
        nombreOriginal: originalname,
        tamanioMB: (size / (1024 * 1024)).toFixed(2),
        formato: mimetype,
      },
    });
  } catch (error) {
    console.error("Error al subir audio:", error);
    return res.status(500).json({
      ok: false,
      message: "Error al subir el archivo de audio",
    });
  }
};

/**
 * Subir imagen (portada) a R2
 * POST /api/upload/imagen
 * Form-data: imagen (file)
 */
export const subirImagen = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        ok: false,
        message: "No se recibió ningún archivo de imagen",
      });
    }

    const { buffer, mimetype, originalname, size } = req.file;

    // Validar tipo de archivo
    if (!esImagenValida(mimetype)) {
      return res.status(400).json({
        ok: false,
        message: "Formato de imagen no válido. Usa JPG o PNG",
      });
    }

    // Validar tamaño (5 MB)
    if (!validarTamanio(size, 5)) {
      return res.status(400).json({
        ok: false,
        message: "La imagen excede el tamaño máximo de 5 MB",
      });
    }

    // Subir a R2
    const imagenUrl = await subirArchivoR2(
      buffer,
      originalname,
      "images",
      mimetype
    );

    return res.status(200).json({
      ok: true,
      message: "Imagen subida correctamente",
      imagenUrl,
      metadatos: {
        nombreOriginal: originalname,
        tamanioKB: (size / 1024).toFixed(2),
        formato: mimetype,
      },
    });
  } catch (error) {
    console.error("Error al subir imagen:", error);
    return res.status(500).json({
      ok: false,
      message: "Error al subir la imagen",
    });
  }
};

export const subirCancionCompleta = async (req, res) => {
  try {
    if (!req.files || !req.files.audio || req.files.audio.length === 0) {
      return res.status(400).json({
        ok: false,
        message: "No se recibió el archivo de audio",
      });
    }

    const audioFile = req.files.audio[0];
    const portadaFile = req.files.portada ? req.files.portada[0] : null;

    const {
      titulo,
      duracionSegundos,
      generos = "",
      esPrivada = false,
      esExplicita = false,
      album = null,
    } = req.body;

    // Validaciones
    if (!titulo?.trim() || !duracionSegundos) {
      return res.status(400).json({
        ok: false,
        message: "Faltan campos obligatorios: titulo, duracionSegundos",
      });
    }

    if (Number(duracionSegundos) <= 0) {
      return res.status(400).json({
        ok: false,
        message: "La duración debe ser mayor a 0",
      });
    }

    // Validar audio
    if (!esAudioValido(audioFile.mimetype)) {
      return res.status(400).json({
        ok: false,
        message: "Formato de audio no válido",
      });
    }

    if (!validarTamanio(audioFile.size, 50)) {
      return res.status(400).json({
        ok: false,
        message: "El audio excede el tamaño máximo de 50 MB",
      });
    }

    // Validar portada si existe
    if (portadaFile) {
      if (!esImagenValida(portadaFile.mimetype)) {
        return res.status(400).json({
          ok: false,
          message: "Formato de portada no válido",
        });
      }

      if (!validarTamanio(portadaFile.size, 5)) {
        return res.status(400).json({
          ok: false,
          message: "La portada excede el tamaño máximo de 5 MB",
        });
      }
    }

    // Subir audio a R2
    const audioUrl = await subirArchivoR2(
      audioFile.buffer,
      audioFile.originalname,
      "audio",
      audioFile.mimetype
    );

    // Subir portada a R2 si existe
    let portadaUrl = "";
    if (portadaFile) {
      portadaUrl = await subirArchivoR2(
        portadaFile.buffer,
        portadaFile.originalname,
        "covers",
        portadaFile.mimetype
      );
    }

    // Procesar géneros
    const generosArray = generos
      .split(",")
      .map((g) => g.trim())
      .filter(Boolean);

    // Convertir strings booleanos correctamente
    const esPrivadaBool = esPrivada === true || esPrivada === "true";
    const esExplicitaBool = esExplicita === true || esExplicita === "true";

    // Crear canción en la base de datos
    const cancion = await Cancion.create({
      titulo: titulo.trim(),
      artistas: [new mongoose.Types.ObjectId(req.userId)],
      album: album || null,
      esSingle: !album,
      duracionSegundos: Number(duracionSegundos),
      generos: generosArray,
      audioUrl,
      portadaUrl,
      esPrivada: esPrivadaBool,
      esExplicita: esExplicitaBool,
    });

    // Actualizar usuario: añadir a misCanciones e incrementar contador
    await Usuario.findByIdAndUpdate(req.userId, {
      $push: { misCanciones: cancion._id },
      $inc: { "estadisticas.totalCancionesSubidas": 1 },
    });

    // Poblar información para la respuesta
    await cancion.populate("artistas", "nick nombre nombreArtistico avatarUrl");
    if (album) {
      await cancion.populate("album", "titulo portadaUrl");
    }

    // Notificar a seguidores (sin esperar)
    notificarNuevaCancion(cancion, req.userId);

    return res.status(201).json({
      ok: true,
      message: "Canción subida y creada correctamente",
      cancion,
    });
  } catch (error) {
    console.error("Error al subir canción completa:", error);
    return res.status(500).json({
      ok: false,
      message: "Error al subir la canción",
    });
  }
};
