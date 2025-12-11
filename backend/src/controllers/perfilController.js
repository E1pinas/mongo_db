// src/controllers/perfilController.js
import { Usuario } from "../models/usuarioModels.js";
import {
  subirArchivoR2,
  eliminarArchivoR2,
  esImagenValida,
  validarTamanio,
} from "../services/r2Service.js";

/**
 * Subir avatar (foto de perfil circular)
 * POST /api/perfil/avatar
 * Form-data: avatar (file)
 */
export const subirAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        ok: false,
        mensaje: "No se recibió ninguna imagen",
      });
    }

    const { buffer, mimetype, originalname, size } = req.file;

    // Validar tipo de archivo
    if (!esImagenValida(mimetype)) {
      return res.status(400).json({
        ok: false,
        mensaje: "Formato de imagen no válido. Usa JPG, PNG o WebP",
      });
    }

    // Validar tamaño (2 MB para avatares)
    if (!validarTamanio(size, 2)) {
      return res.status(400).json({
        ok: false,
        mensaje: "La imagen excede el tamaño máximo de 2 MB",
      });
    }

    // Obtener usuario
    const usuario = await Usuario.findById(req.userId);
    if (!usuario) {
      return res.status(404).json({
        ok: false,
        mensaje: "Usuario no encontrado",
      });
    }

    // Subir nuevo avatar a R2
    const avatarUrl = await subirArchivoR2(
      buffer,
      originalname,
      "usuarios/avatares",
      mimetype
    );

    // Eliminar avatar anterior si existe
    if (usuario.avatarUrl) {
      await eliminarArchivoR2(usuario.avatarUrl);
    }

    // Actualizar usuario
    usuario.avatarUrl = avatarUrl;
    await usuario.save();

    return res.status(200).json({
      ok: true,
      mensaje: "Avatar actualizado correctamente",
      avatarUrl,
    });
  } catch (error) {
    console.error("Error al subir avatar:", error);

    // Detectar error de timeout/conexión
    if (error.code === "ETIMEDOUT" || error.name === "TimeoutError") {
      return res.status(503).json({
        ok: false,
        mensaje:
          "No se pudo conectar con el servicio de almacenamiento. Verifica tu conexión a internet.",
      });
    }

    return res.status(500).json({
      ok: false,
      mensaje: "Error al subir el avatar",
    });
  }
};

/**
 * Subir banner (portada de perfil)
 * POST /api/perfil/banner
 * Form-data: banner (file)
 */
export const subirBanner = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        ok: false,
        mensaje: "No se recibió ninguna imagen",
      });
    }

    const { buffer, mimetype, originalname, size } = req.file;

    // Validar tipo de archivo
    if (!esImagenValida(mimetype)) {
      return res.status(400).json({
        ok: false,
        mensaje: "Formato de imagen no válido. Usa JPG, PNG o WebP",
      });
    }

    // Validar tamaño (5 MB para banners)
    if (!validarTamanio(size, 5)) {
      return res.status(400).json({
        ok: false,
        mensaje: "La imagen excede el tamaño máximo de 5 MB",
      });
    }

    // Obtener usuario
    const usuario = await Usuario.findById(req.userId);
    if (!usuario) {
      return res.status(404).json({
        ok: false,
        mensaje: "Usuario no encontrado",
      });
    }

    // Subir nuevo banner a R2
    const bannerUrl = await subirArchivoR2(
      buffer,
      originalname,
      "usuarios/banners",
      mimetype
    );

    // Eliminar banner anterior si existe
    if (usuario.bannerUrl) {
      await eliminarArchivoR2(usuario.bannerUrl);
    }

    // Actualizar usuario
    usuario.bannerUrl = bannerUrl;
    await usuario.save();

    return res.status(200).json({
      ok: true,
      mensaje: "Banner actualizado correctamente",
      bannerUrl,
    });
  } catch (error) {
    console.error("Error al subir banner:", error);

    // Detectar error de timeout/conexión
    if (error.code === "ETIMEDOUT" || error.name === "TimeoutError") {
      return res.status(503).json({
        ok: false,
        mensaje:
          "No se pudo conectar con el servicio de almacenamiento. Verifica tu conexión a internet.",
      });
    }

    return res.status(500).json({
      ok: false,
      mensaje: "Error al subir el banner",
    });
  }
};

/**
 * Eliminar avatar
 * DELETE /api/perfil/avatar
 */
export const eliminarAvatar = async (req, res) => {
  try {
    const usuario = await Usuario.findById(req.userId);
    if (!usuario) {
      return res.status(404).json({
        ok: false,
        mensaje: "Usuario no encontrado",
      });
    }

    if (!usuario.avatarUrl) {
      return res.status(400).json({
        ok: false,
        mensaje: "No tienes avatar para eliminar",
      });
    }

    // Eliminar de R2
    await eliminarArchivoR2(usuario.avatarUrl);

    // Actualizar usuario
    usuario.avatarUrl = "";
    await usuario.save();

    return res.status(200).json({
      ok: true,
      mensaje: "Avatar eliminado correctamente",
    });
  } catch (error) {
    console.error("Error al eliminar avatar:", error);
    return res.status(500).json({
      ok: false,
      mensaje: "Error al eliminar el avatar",
    });
  }
};

/**
 * Eliminar banner
 * DELETE /api/perfil/banner
 */
export const eliminarBanner = async (req, res) => {
  try {
    const usuario = await Usuario.findById(req.userId);
    if (!usuario) {
      return res.status(404).json({
        ok: false,
        mensaje: "Usuario no encontrado",
      });
    }

    if (!usuario.bannerUrl) {
      return res.status(400).json({
        ok: false,
        mensaje: "No tienes banner para eliminar",
      });
    }

    // Eliminar de R2
    await eliminarArchivoR2(usuario.bannerUrl);

    // Actualizar usuario
    usuario.bannerUrl = "";
    await usuario.save();

    return res.status(200).json({
      ok: true,
      mensaje: "Banner eliminado correctamente",
    });
  } catch (error) {
    console.error("Error al eliminar banner:", error);
    return res.status(500).json({
      ok: false,
      mensaje: "Error al eliminar el banner",
    });
  }
};

/**
 * Obtener perfil completo con avatar y banner
 * GET /api/perfil/:id
 */
export const obtenerPerfilCompleto = async (req, res) => {
  try {
    const { id } = req.params;

    const usuario = await Usuario.findOne({ nick: nickLowerCase })
      .select("-password")
      .populate({
        path: "misCanciones",
        select:
          "titulo audioUrl portadaUrl duracionSegundos artistas generos reproduccionesTotales likes esPrivada esExplicita oculta razonOculta",
        populate: {
          path: "artistas",
          select: "nick nombreArtistico avatarUrl",
        },
      })
      .populate({
        path: "misAlbumes",
        select:
          "titulo portadaUrl descripcion canciones artistas fechaLanzamiento generos esPrivado",
        populate: [
          {
            path: "artistas",
            select: "nick nombreArtistico avatarUrl",
          },
          {
            path: "canciones",
            select:
              "titulo audioUrl portadaUrl duracionSegundos artistas esPrivada esExplicita",
            populate: {
              path: "artistas",
              select: "nick nombreArtistico avatarUrl",
            },
          },
        ],
      })
      .populate({
        path: "playlistsCreadas",
        select:
          "titulo portadaUrl descripcion canciones esPublica creador seguidores",
        populate: {
          path: "creador",
          select: "nick nombreArtistico avatarUrl",
        },
      });

    if (!usuario) {
      return res.status(404).json({
        ok: false,
        mensaje: "Usuario no encontrado",
      });
    }

    // Filtrar canciones, álbumes y playlists que no existan (null)
    if (usuario.misCanciones) {
      usuario.misCanciones = usuario.misCanciones.filter((c) => c !== null);
    }
    if (usuario.misAlbumes) {
      usuario.misAlbumes = usuario.misAlbumes.filter((a) => a !== null);
    }
    if (usuario.playlistsCreadas) {
      usuario.playlistsCreadas = usuario.playlistsCreadas.filter(
        (p) => p !== null
      );
    }

    // Determinar si el usuario actual es el dueño del perfil
    const esPropietario = usuarioId && usuarioId === usuario._id.toString();

    // Calcular si el usuario solicitante es menor de edad
    let esMenorDeEdad = false;
    if (usuarioId) {
      const { calcularEdad } = await import("../helpers/edadHelper.js");
      const usuarioSolicitante = await Usuario.findById(usuarioId).select(
        "fechaNacimiento"
      );
      if (usuarioSolicitante?.fechaNacimiento) {
        esMenorDeEdad = calcularEdad(usuarioSolicitante.fechaNacimiento) < 18;
        console.log(
          `👶 Usuario solicitante es menor de edad: ${esMenorDeEdad}`
        );
      }
    }

    // Filtrar canciones ocultas por moderación (siempre)
    if (usuario.misCanciones) {
      usuario.misCanciones = usuario.misCanciones.filter(
        (cancion) => !cancion.oculta
      );
    }

    // Si NO es el propietario, filtrar canciones privadas
    if (!esPropietario && usuario.misCanciones) {
      usuario.misCanciones = usuario.misCanciones.filter(
        (cancion) => !cancion.esPrivada
      );
    }

    // Filtrar canciones explícitas si el usuario solicitante es menor de edad
    if (esMenorDeEdad && usuario.misCanciones) {
      usuario.misCanciones = usuario.misCanciones.filter(
        (cancion) => !cancion.esExplicita
      );
      console.log(
        `🔞 Canciones filtradas para menor de edad en perfil completo: ${usuario.misCanciones.length} canciones disponibles`
      );
    }

    // Filtrar álbumes privados si no es el propietario
    if (!esPropietario && usuario.misAlbumes) {
      usuario.misAlbumes = usuario.misAlbumes.filter(
        (album) => !album.esPrivado
      );
      // También filtrar canciones privadas dentro de álbumes públicos
      usuario.misAlbumes.forEach((album) => {
        if (album.canciones) {
          album.canciones = album.canciones.filter(
            (cancion) => cancion && !cancion.esPrivada
          );
        }
      });
    }

    // Filtrar canciones explícitas de álbumes si el usuario solicitante es menor de edad
    if (esMenorDeEdad && usuario.misAlbumes) {
      usuario.misAlbumes.forEach((album) => {
        if (album.canciones) {
          album.canciones = album.canciones.filter(
            (cancion) => cancion && !cancion.esExplicita
          );
        }
      });
      console.log(
        `🔞 Canciones explícitas filtradas de álbumes para menor de edad en perfil completo`
      );
    }

    // Filtrar playlists privadas si no es el propietario
    if (!esPropietario && usuario.playlistsCreadas) {
      usuario.playlistsCreadas = usuario.playlistsCreadas.filter(
        (playlist) => playlist.esPublica
      );
    }

    return res.status(200).json({
      ok: true,
      usuario,
    });
  } catch (error) {
    console.error("Error al obtener perfil:", error);
    return res.status(500).json({
      ok: false,
      mensaje: "Error al obtener perfil",
    });
  }
};

/**
 * Obtener perfil por nick
 * GET /api/perfil/nick/:nick
 */
export const obtenerPerfilPorNick = async (req, res) => {
  try {
    const { nick } = req.params;
    const usuarioActualId = req.userId; // Puede ser undefined si no está autenticado

    console.log("🔍 Buscando perfil por nick:", nick);
    console.log("👤 Usuario actual ID:", usuarioActualId);

    const usuario = await Usuario.findOne({
      nick: nick.toLowerCase(),
      esVisible: { $ne: false }, // Permitir undefined o true, excluir solo false
      role: { $ne: "admin" }, // Excluir solo admins
    })
      .select("-password")
      .populate({
        path: "misCanciones",
        select:
          "titulo audioUrl portadaUrl duracionSegundos artistas generos reproduccionesTotales likes esPrivada esExplicita",
        populate: {
          path: "artistas",
          select: "nick nombreArtistico avatarUrl",
        },
      })
      .populate({
        path: "misAlbumes",
        select:
          "titulo portadaUrl descripcion canciones artistas fechaLanzamiento generos esPrivado",
        populate: [
          {
            path: "artistas",
            select: "nick nombreArtistico avatarUrl",
          },
          {
            path: "canciones",
            select:
              "titulo audioUrl portadaUrl duracionSegundos artistas esPrivada esExplicita",
            populate: {
              path: "artistas",
              select: "nick nombreArtistico avatarUrl",
            },
          },
        ],
      })
      .populate({
        path: "playlistsCreadas",
        select:
          "titulo portadaUrl descripcion canciones esPublica creador seguidores",
        populate: {
          path: "creador",
          select: "nick nombreArtistico avatarUrl",
        },
      });

    if (!usuario) {
      return res.status(404).json({
        ok: false,
        mensaje: "Usuario no encontrado",
      });
    }

    // Filtrar canciones, álbumes y playlists que fueron eliminados (null)
    if (usuario.misCanciones) {
      usuario.misCanciones = usuario.misCanciones.filter((c) => c !== null);
    }
    if (usuario.misAlbumes) {
      usuario.misAlbumes = usuario.misAlbumes.filter((a) => a !== null);
    }
    if (usuario.playlistsCreadas) {
      usuario.playlistsCreadas = usuario.playlistsCreadas.filter(
        (p) => p !== null
      );
    }

    // Determinar si el usuario actual es el dueño del perfil
    const esPropietario =
      usuarioActualId && usuarioActualId === usuario._id.toString();

    // Calcular si el usuario actual es menor de edad
    let esMenorDeEdad = false;
    if (usuarioActualId) {
      const { calcularEdad } = await import("../helpers/edadHelper.js");
      const usuarioActual = await Usuario.findById(usuarioActualId).select(
        "fechaNacimiento"
      );
      if (usuarioActual?.fechaNacimiento) {
        esMenorDeEdad = calcularEdad(usuarioActual.fechaNacimiento) < 18;
        console.log(`👶 Usuario actual es menor de edad: ${esMenorDeEdad}`);
      }
    }

    // Filtrar canciones ocultas por moderación (siempre)
    if (usuario.misCanciones) {
      usuario.misCanciones = usuario.misCanciones.filter(
        (cancion) => !cancion.oculta
      );
    }

    // Si NO es el propietario, filtrar canciones privadas
    if (!esPropietario && usuario.misCanciones) {
      usuario.misCanciones = usuario.misCanciones.filter(
        (cancion) => !cancion.esPrivada
      );
    }

    // Filtrar canciones explícitas si el usuario actual es menor de edad
    if (esMenorDeEdad && usuario.misCanciones) {
      usuario.misCanciones = usuario.misCanciones.filter(
        (cancion) => !cancion.esExplicita
      );
      console.log(
        `🔞 Canciones filtradas para menor de edad: ${usuario.misCanciones.length} canciones disponibles`
      );
    }

    // Filtrar álbumes privados si no es el propietario
    if (!esPropietario && usuario.misAlbumes) {
      usuario.misAlbumes = usuario.misAlbumes.filter(
        (album) => !album.esPrivado
      );
      // También filtrar canciones privadas dentro de álbumes públicos
      usuario.misAlbumes.forEach((album) => {
        if (album.canciones) {
          album.canciones = album.canciones.filter(
            (cancion) => cancion && !cancion.esPrivada
          );
        }
      });
    }

    // Filtrar canciones explícitas de álbumes si el usuario actual es menor de edad
    if (esMenorDeEdad && usuario.misAlbumes) {
      usuario.misAlbumes.forEach((album) => {
        if (album.canciones) {
          album.canciones = album.canciones.filter(
            (cancion) => cancion && !cancion.esExplicita
          );
        }
      });
      console.log(
        `🔞 Canciones explícitas filtradas de álbumes para menor de edad`
      );
    }

    // Filtrar playlists privadas si no es el propietario
    if (!esPropietario && usuario.playlistsCreadas) {
      usuario.playlistsCreadas = usuario.playlistsCreadas.filter(
        (playlist) => playlist.esPublica
      );
    }

    // Verificar privacidad y bloqueos
    if (usuarioActualId && usuarioActualId !== usuario._id.toString()) {
      const { Amistad } = await import("../models/amistadModels.js");

      // 1. Verificar si existe un bloqueo entre los usuarios (en cualquier dirección)
      const bloqueado = await Amistad.findOne({
        $or: [
          {
            solicitante: usuario._id,
            receptor: usuarioActualId,
            estado: "bloqueada",
          },
          {
            solicitante: usuarioActualId,
            receptor: usuario._id,
            estado: "bloqueada",
          },
        ],
      });

      if (bloqueado) {
        console.log(
          "🚫 Acceso denegado - existe un bloqueo entre los usuarios"
        );
        return res.status(403).json({
          ok: false,
          mensaje: "No tienes acceso a este perfil",
          bloqueado: true,
        });
      }

      // 2. Verificar si el perfil es privado
      if (usuario.privacy?.perfilPublico === false) {
        console.log("🔒 Perfil privado, verificando amistad...");

        // Verificar si son amigos
        const sonAmigos = await Amistad.findOne({
          $or: [
            {
              solicitante: usuario._id,
              receptor: usuarioActualId,
              estado: "aceptada",
            },
            {
              solicitante: usuarioActualId,
              receptor: usuario._id,
              estado: "aceptada",
            },
          ],
        });

        if (!sonAmigos) {
          console.log("🚫 Perfil privado - usuario no es amigo");
          return res.status(403).json({
            ok: false,
            mensaje: "Este perfil es privado",
            perfilPrivado: true,
          });
        }

        console.log("✅ Perfil privado pero son amigos - acceso permitido");
      }
    }

    console.log("📦 Enviando perfil completo");
    return res.status(200).json({
      ok: true,
      usuario,
    });
  } catch (error) {
    console.error("Error al obtener perfil por nick:", error);
    return res.status(500).json({
      ok: false,
      mensaje: "Error al obtener perfil",
    });
  }
};
