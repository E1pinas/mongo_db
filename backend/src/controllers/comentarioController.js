// src/controllers/comentarioController.js
import { Comentario } from "../models/comentarioModels.js";
import { Usuario } from "../models/usuarioModels.js";
import { Notificacion } from "../models/notificacionModels.js";

/**
 * Crear comentario en un perfil
 * POST /api/comentarios
 * Body: { perfilDestino, texto }
 */
export const crearComentario = async (req, res) => {
  try {
    const { perfilDestino, texto } = req.body;

    if (!perfilDestino || !texto?.trim()) {
      return res.status(400).json({
        ok: false,
        mensaje: "Faltan campos obligatorios: perfilDestino, texto",
      });
    }

    // Verificar que el perfil destino existe
    const perfilExiste = await Usuario.findById(perfilDestino);
    if (!perfilExiste) {
      return res.status(404).json({
        ok: false,
        mensaje: "El perfil destino no existe",
      });
    }

    const comentario = await Comentario.create({
      autor: req.userId,
      perfilDestino,
      texto: texto.trim(),
    });

    await comentario.populate("autor", "nick nombre avatarUrl");

    // Notificar al dueño del perfil (si no es el mismo que comenta)
    if (req.userId !== perfilDestino) {
      const autor = await Usuario.findById(req.userId).select(
        "nick nombreArtistico"
      );
      const nombreMostrar = autor.nombreArtistico || autor.nick;
      await Notificacion.create({
        usuarioDestino: perfilDestino,
        usuarioOrigen: req.userId,
        tipo: "comentario_en_perfil",
        mensaje: `${nombreMostrar} ha comentado en tu perfil`,
        recurso: {
          tipo: "comment",
          id: comentario._id,
        },
      });
    }

    return res.status(201).json({
      ok: true,
      mensaje: "Comentario creado correctamente",
      comentario,
    });
  } catch (error) {
    console.error("Error al crear comentario:", error);
    return res.status(500).json({
      ok: false,
      mensaje: "Error al crear el comentario",
    });
  }
};

/**
 * Obtener comentarios de un perfil (solo raíz, sin padres)
 * GET /api/comentarios/perfil/:perfilId
 */
export const obtenerComentariosPerfil = async (req, res) => {
  try {
    const { perfilId } = req.params;
    const { pagina = 1, limite = 20 } = req.query;

    // Solo traer comentarios raíz (sin padre)
    const comentarios = await Comentario.find({
      perfilDestino: perfilId,
      comentarioPadre: null,
      estaEliminado: false,
    })
      .populate("autor", "nick nombre avatarUrl")
      .sort({ createdAt: -1 })
      .limit(Number(limite))
      .skip((Number(pagina) - 1) * Number(limite));

    // Para cada comentario, traer sus respuestas recursivamente
    const comentariosConRespuestas = await Promise.all(
      comentarios.map(async (comentario) => {
        const respuestas = await obtenerRespuestasRecursivas(comentario._id);
        return {
          ...comentario.toObject(),
          respuestas,
        };
      })
    );

    const total = await Comentario.countDocuments({
      perfilDestino: perfilId,
      comentarioPadre: null,
      estaEliminado: false,
    });

    return res.status(200).json({
      ok: true,
      comentarios: comentariosConRespuestas,
      paginacion: {
        total,
        pagina: Number(pagina),
        limite: Number(limite),
        totalPaginas: Math.ceil(total / Number(limite)),
      },
    });
  } catch (error) {
    console.error("Error al obtener comentarios:", error);
    return res.status(500).json({
      ok: false,
      mensaje: "Error al obtener comentarios",
    });
  }
};

/**
 * Responder a un comentario (crear comentario hijo)
 * POST /api/comentarios/:id/responder
 * Body: { texto }
 */
export const responderComentario = async (req, res) => {
  try {
    const { id } = req.params;
    const { texto } = req.body;

    if (!texto?.trim()) {
      return res.status(400).json({
        ok: false,
        mensaje: "El texto de la respuesta es obligatorio",
      });
    }

    const comentarioPadre = await Comentario.findById(id);
    if (!comentarioPadre) {
      return res.status(404).json({
        ok: false,
        mensaje: "Comentario no encontrado",
      });
    }

    // Crear nueva respuesta como comentario independiente
    const respuesta = await Comentario.create({
      autor: req.userId,
      texto: texto.trim(),
      comentarioPadre: id,
      cancionDestino: comentarioPadre.cancionDestino,
      perfilDestino: comentarioPadre.perfilDestino,
    });

    await respuesta.populate("autor", "nick nombreArtistico avatarUrl");

    // Notificación de respuesta deshabilitada

    return res.status(201).json({
      ok: true,
      mensaje: "Respuesta agregada correctamente",
      respuesta,
    });
  } catch (error) {
    console.error("Error al responder comentario:", error);
    return res.status(500).json({
      ok: false,
      mensaje: "Error al responder comentario",
    });
  }
};

/**
 * Dar/quitar like a un comentario
 * POST /api/comentarios/:id/like
 */
export const toggleLikeComentario = async (req, res) => {
  try {
    const { id } = req.params;
    const comentario = await Comentario.findById(id);

    if (!comentario) {
      return res.status(404).json({
        ok: false,
        mensaje: "Comentario no encontrado",
      });
    }

    const yaLeDioLike = comentario.likes.includes(req.userId);

    if (yaLeDioLike) {
      comentario.likes = comentario.likes.filter(
        (like) => like.toString() !== req.userId
      );
    } else {
      comentario.likes.push(req.userId);
      // Notificación de like deshabilitada
    }

    await comentario.save();

    return res.status(200).json({
      ok: true,
      mensaje: yaLeDioLike ? "Like eliminado" : "Like agregado",
      totalLikes: comentario.likes.length,
    });
  } catch (error) {
    console.error("Error al dar like a comentario:", error);
    return res.status(500).json({
      ok: false,
      mensaje: "Error al dar like",
    });
  }
};

/**
 * Eliminar comentario (borrado lógico)
 * DELETE /api/comentarios/:id
 */
export const eliminarComentario = async (req, res) => {
  try {
    const { id } = req.params;
    const comentario = await Comentario.findById(id);

    if (!comentario) {
      return res.status(404).json({
        ok: false,
        mensaje: "Comentario no encontrado",
      });
    }

    // Solo el autor o admin puede eliminar
    if (
      comentario.autor.toString() !== req.userId &&
      req.userRole !== "admin"
    ) {
      return res.status(403).json({
        ok: false,
        mensaje: "No tienes permiso para eliminar este comentario",
      });
    }

    comentario.estaEliminado = true;
    await comentario.save();

    return res.status(200).json({
      ok: true,
      mensaje: "Comentario eliminado correctamente",
    });
  } catch (error) {
    console.error("Error al eliminar comentario:", error);
    return res.status(500).json({
      ok: false,
      mensaje: "Error al eliminar comentario",
    });
  }
};

/**
 * Editar comentario
 * PUT /api/comentarios/:id
 * Body: { texto }
 */
export const editarComentario = async (req, res) => {
  try {
    const { id } = req.params;
    const { texto } = req.body;

    if (!texto?.trim()) {
      return res.status(400).json({
        ok: false,
        mensaje: "El texto es obligatorio",
      });
    }

    const comentario = await Comentario.findById(id);

    if (!comentario) {
      return res.status(404).json({
        ok: false,
        mensaje: "Comentario no encontrado",
      });
    }

    // Solo el autor puede editar
    if (comentario.autor.toString() !== req.userId) {
      return res.status(403).json({
        ok: false,
        mensaje: "No tienes permiso para editar este comentario",
      });
    }

    comentario.texto = texto.trim();
    comentario.estaEditado = true;
    await comentario.save();

    return res.status(200).json({
      ok: true,
      mensaje: "Comentario editado correctamente",
      comentario,
    });
  } catch (error) {
    console.error("Error al editar comentario:", error);
    return res.status(500).json({
      ok: false,
      mensaje: "Error al editar comentario",
    });
  }
};

/**
 * Obtener comentarios de una canción (solo raíz, sin padres)
 * GET /api/comentarios/cancion/:cancionId
 */
export const obtenerComentariosCancion = async (req, res) => {
  try {
    const { cancionId } = req.params;
    const { pagina = 1, limite = 20 } = req.query;

    // Obtener información de la canción para saber quién es el creador
    const { Cancion } = await import("../models/cancionModels.js");
    const cancion = await Cancion.findById(cancionId).select("artistas");

    if (!cancion) {
      return res.status(404).json({
        ok: false,
        mensaje: "Canción no encontrada",
      });
    }

    // Convertir artistas a strings para comparación
    const artistasIds = cancion.artistas.map((id) => id.toString());

    // Solo traer comentarios raíz (sin padre)
    const comentarios = await Comentario.find({
      cancionDestino: cancionId,
      comentarioPadre: null,
      estaEliminado: false,
    })
      .populate("autor", "nick nombre nombreArtistico avatarUrl")
      .sort({ createdAt: 1 }); // Ordenar del más antiguo al más nuevo

    // Separar comentarios del creador y del resto
    const comentariosDelCreador = [];
    const comentariosDelResto = [];

    for (const comentario of comentarios) {
      const autorId = comentario.autor._id.toString();
      if (artistasIds.includes(autorId)) {
        comentariosDelCreador.push(comentario);
      } else {
        comentariosDelResto.push(comentario);
      }
    }

    // Ordenar: primero los del creador (más antiguo primero), luego el resto (más antiguo primero)
    const comentariosOrdenados = [
      ...comentariosDelCreador,
      ...comentariosDelResto,
    ];

    // Aplicar paginación manualmente
    const inicio = (Number(pagina) - 1) * Number(limite);
    const fin = inicio + Number(limite);
    const comentariosPaginados = comentariosOrdenados.slice(inicio, fin);

    // Para cada comentario, traer sus respuestas recursivamente
    const comentariosConRespuestas = await Promise.all(
      comentariosPaginados.map(async (comentario) => {
        const respuestas = await obtenerRespuestasRecursivas(comentario._id);
        return {
          ...comentario.toObject(),
          respuestas,
        };
      })
    );

    const total = comentariosOrdenados.length;

    return res.status(200).json({
      ok: true,
      comentarios: comentariosConRespuestas,
      paginacion: {
        total,
        pagina: Number(pagina),
        limite: Number(limite),
        totalPaginas: Math.ceil(total / Number(limite)),
      },
    });
  } catch (error) {
    console.error("Error al obtener comentarios:", error);
    return res.status(500).json({
      ok: false,
      mensaje: "Error al obtener comentarios",
    });
  }
};

// Función auxiliar para obtener respuestas recursivamente (SISTEMA PLANO)
async function obtenerRespuestasRecursivas(comentarioId) {
  // Obtener TODAS las respuestas descendientes (incluyendo respuestas a respuestas)
  const todasLasRespuestas = await obtenerTodasRespuestasPlanas(comentarioId);

  // Ordenar por fecha de creación (más antiguo primero)
  todasLasRespuestas.sort(
    (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
  );

  return todasLasRespuestas;
}

// Función auxiliar recursiva para obtener todas las respuestas en forma plana
async function obtenerTodasRespuestasPlanas(comentarioId, resultado = []) {
  const respuestasDirectas = await Comentario.find({
    comentarioPadre: comentarioId,
    estaEliminado: false,
  })
    .populate("autor", "nick nombre nombreArtistico avatarUrl")
    .populate({
      path: "comentarioPadre",
      select: "autor texto",
      populate: {
        path: "autor",
        select: "nick nombre nombreArtistico avatarUrl",
      },
    });

  for (const respuesta of respuestasDirectas) {
    // Agregar la respuesta al resultado
    resultado.push({
      ...respuesta.toObject(),
      respuestas: [], // Sin anidación, todas al mismo nivel
    });

    // Buscar recursivamente respuestas a esta respuesta
    await obtenerTodasRespuestasPlanas(respuesta._id, resultado);
  }

  return resultado;
}

/**
 * Crear comentario en una canción
 * POST /api/comentarios/cancion
 * Body: { cancionDestino, texto }
 */
export const crearComentarioCancion = async (req, res) => {
  try {
    const { cancionDestino, texto } = req.body;

    if (!cancionDestino || !texto?.trim()) {
      return res.status(400).json({
        ok: false,
        mensaje: "Faltan campos obligatorios: cancionDestino, texto",
      });
    }

    const comentario = await Comentario.create({
      autor: req.userId,
      cancionDestino,
      texto: texto.trim(),
    });

    await comentario.populate("autor", "nick nombre nombreArtistico avatarUrl");

    // ✅ Crear notificación al dueño de la canción
    const { Cancion } = await import("../models/cancionModels.js");
    const cancion = await Cancion.findById(cancionDestino).select(
      "artistas titulo"
    );

    if (cancion && cancion.artistas && cancion.artistas.length > 0) {
      const autor = await Usuario.findById(req.userId).select(
        "nick nombreArtistico"
      );
      const nombreAutor = autor?.nombreArtistico || autor?.nick || "Alguien";
      const tituloCancion = cancion.titulo || "una canción";

      // Notificar a cada artista que no sea el autor del comentario
      for (const artistaId of cancion.artistas) {
        const artistaIdStr = artistaId.toString();
        if (artistaIdStr !== req.userId) {
          await Notificacion.create({
            usuarioDestino: artistaId,
            usuarioOrigen: req.userId,
            tipo: "comentario_en_perfil",
            mensaje: `${nombreAutor} comentó tu canción "${tituloCancion}"`,
            recurso: {
              tipo: "song",
              id: cancionDestino,
              comentarioId: comentario._id,
            },
          });
        }
      }
    }

    return res.status(201).json({
      ok: true,
      mensaje: "Comentario creado correctamente",
      comentario,
    });
  } catch (error) {
    console.error("Error al crear comentario:", error);
    return res.status(500).json({
      ok: false,
      mensaje: "Error al crear el comentario",
    });
  }
};
