import Post from "../models/postModels.js";
import { Usuario } from "../models/usuarioModels.js";
import { Seguidor } from "../models/seguidorModels.js";
import {
  crearNotificacion,
  notificarNuevoPost,
} from "../helpers/notificacionHelper.js";
import {
  enrichPostsWithUserData,
  getPostPopulateOptions,
  hasUserReposted,
  isPostAuthor,
} from "../helpers/postHelpers.js";
import {
  sendSuccess,
  sendError,
  sendNotFound,
  sendValidationError,
  sendServerError,
  sendCreated,
  sendUnauthorized,
} from "../helpers/responseHelpers.js";
import {
  validateEnum,
  validateRequired,
} from "../helpers/validationHelpers.js";

export const postController = {
  /**
   * Crear un nuevo post
   */
  async crearPost(req, res) {
    try {
      const usuarioId = req.usuario.id;
      const { contenido, tipo, recursoId } = req.body;

      // Validaciones con helpers
      const tiposValidos = [
        "texto",
        "repost_cancion",
        "repost_album",
        "repost_playlist",
      ];

      const tipoValidation = validateEnum(tipo, tiposValidos, "tipo");
      if (!tipoValidation.valid) {
        return sendValidationError(res, tipoValidation.error);
      }

      if (tipo !== "texto" && !recursoId) {
        return sendValidationError(res, "El recurso es requerido para reposts");
      }

      if (tipo === "texto") {
        const contenidoValidation = validateRequired(contenido, "contenido");
        if (!contenidoValidation.valid) {
          return sendValidationError(res, contenidoValidation.error);
        }
      }

      // Determinar tipo de recurso
      let tipoRecurso = null;
      if (tipo === "repost_cancion") tipoRecurso = "Cancion";
      if (tipo === "repost_album") tipoRecurso = "Album";
      if (tipo === "repost_playlist") tipoRecurso = "Playlist";

      const nuevoPost = await Post.create({
        usuario: usuarioId,
        contenido: contenido || null,
        tipo,
        recursoId: recursoId || null,
        tipoRecurso,
      });

      await nuevoPost.populate(
        "usuario",
        "nick nombre nombreArtistico avatarUrl verificado"
      );
      if (recursoId) {
        await nuevoPost.populate("recursoId");
      }

      // Notificar a seguidores y amigos (sin esperar)
      notificarNuevoPost(nuevoPost, usuarioId);

      return sendCreated(res, nuevoPost, "Post creado exitosamente");
    } catch (error) {
      console.error("Error creando post:", error);
      return sendServerError(res, error, "Error al crear el post");
    }
  },

  /**
   * Obtener posts de un usuario
   */
  async obtenerPostsUsuario(req, res) {
    try {
      const { usuarioId } = req.params;
      const limit = parseInt(req.query.limit) || 50;
      const offset = parseInt(req.query.offset) || 0;

      const postsQuery = await Post.find({
        usuario: usuarioId,
        estaEliminado: false,
      })
        .sort({ createdAt: -1 })
        .limit(limit)
        .skip(offset)
        .populate(getPostPopulateOptions());

      // Enriquecer posts con datos del usuario actual
      const posts = enrichPostsWithUserData(postsQuery, req.usuario?.id);

      return sendSuccess(res, { posts });
    } catch (error) {
      console.error("Error obteniendo posts del usuario:", error);
      return sendServerError(res, error, "Error al obtener los posts");
    }
  },

  /**
   * Obtener feed de posts (usuarios seguidos)
   */
  async obtenerFeed(req, res) {
    try {
      const usuarioId = req.usuario.id;
      const limit = parseInt(req.query.limit) || 50;
      const offset = parseInt(req.query.offset) || 0;

      // Obtener IDs de usuarios seguidos
      const seguidos = await Seguidor.find({ seguidor: usuarioId }).select(
        "seguido"
      );
      const seguidosIds = seguidos.map((s) => s.seguido);

      // Agregar el propio usuario para ver sus posts también
      const usuariosParaFeed = [...seguidosIds, usuarioId];

      const postsQuery = await Post.find({
        usuario: { $in: usuariosParaFeed },
        estaEliminado: false,
      })
        .sort({ createdAt: -1 })
        .limit(limit)
        .skip(offset)
        .populate(getPostPopulateOptions());

      // Enriquecer posts con datos del usuario actual
      const posts = enrichPostsWithUserData(postsQuery, usuarioId);

      return sendSuccess(res, { posts });
    } catch (error) {
      console.error("Error obteniendo feed:", error);
      return sendServerError(res, error, "Error al obtener el feed");
    }
  },

  /**
   * Obtener un post específico
   */
  async obtenerPost(req, res) {
    try {
      const { postId } = req.params;
      const postDoc = await Post.findOne({ _id: postId, estaEliminado: false })
        .populate("usuario", "nick nombre nombreArtistico avatarUrl verificado")
        .populate("recursoId")
        .populate(
          "comentarios.usuario",
          "nick nombreArtistico avatarUrl verificado"
        ); // ✅ Poblar usuarios en comentarios

      if (!postDoc) {
        return sendNotFound(res, "Post");
      }

      // Validar que el post tenga usuario
      if (!postDoc.usuario || !postDoc.usuario._id) {
        console.error("⚠️ Post sin usuario:", postId);
        return sendError(
          res,
          500,
          "Post tiene datos incompletos (falta usuario)"
        );
      }

      const usuarioId = req.usuario?.id || req.userId;
      const post = enrichPostsWithUserData([postDoc], usuarioId)[0];

      return sendSuccess(res, { post });
    } catch (error) {
      console.error("Error obteniendo post:", error);
      return sendServerError(res, error, "Error al obtener el post");
    }
  },

  /**
   * Eliminar un post
   */
  async eliminarPost(req, res) {
    try {
      const usuarioId = req.usuario.id;
      const { postId } = req.params;

      const post = await Post.findOneAndUpdate(
        { _id: postId, usuario: usuarioId },
        { estaEliminado: true },
        { new: true }
      );

      if (!post) {
        return sendNotFound(res, "Post");
      }

      return sendSuccess(res, null, "Post eliminado exitosamente");
    } catch (error) {
      console.error("Error eliminando post:", error);
      return sendServerError(res, error, "Error al eliminar el post");
    }
  },

  /**
   * Dar/quitar like a un post
   */
  async toggleLike(req, res) {
    try {
      const usuarioId = req.usuario.id;
      const { postId } = req.params;

      console.log("🔥 Toggle like:", { usuarioId, postId });

      const post = await Post.findById(postId);
      if (!post) {
        return res.status(404).json({
          success: false,
          message: "Post no encontrado",
        });
      }

      if (post.estaEliminado) {
        return res.status(410).json({
          success: false,
          message: "Este post ha sido eliminado",
        });
      }

      const yaLeDioLike = post.likes.includes(usuarioId);
      console.log("🔥 Ya le dio like:", yaLeDioLike);
      console.log("🔥 Likes antes:", post.likes.length);

      if (yaLeDioLike) {
        post.likes.pull(usuarioId);
        await post.save();
        console.log("✅ Like eliminado. Likes después:", post.likes.length);

        res.json({
          success: true,
          message: "Like eliminado",
          liked: false,
        });
      } else {
        post.likes.push(usuarioId);
        await post.save();
        console.log("✅ Like agregado. Likes después:", post.likes.length);

        // Crear notificación si no es el propio usuario
        if (!isPostAuthor(post, usuarioId)) {
          const usuario = await Usuario.findById(usuarioId).select(
            "nick nombreArtistico"
          );
          const nombreUsuario = usuario.nombreArtistico || usuario.nick;

          await crearNotificacion(
            post.usuario,
            usuarioId,
            "like_post",
            `${nombreUsuario} le dio me gusta a tu post`,
            { tipo: "post", id: postId }
          );
        }

        return sendSuccess(res, { liked: true }, "Like agregado");
      }
    } catch (error) {
      console.error("Error en toggle like:", error);
      return sendServerError(res, error, "Error al procesar el like");
    }
  },

  /**
   * Agregar comentario a un post
   */
  async agregarComentario(req, res) {
    try {
      const usuarioId = req.usuario.id;
      const { postId } = req.params;
      const { contenido } = req.body;

      const contenidoValidation = validateRequired(contenido, "contenido");
      if (!contenidoValidation.valid) {
        return sendValidationError(res, contenidoValidation.error);
      }

      const post = await Post.findById(postId);
      if (!post) {
        return sendNotFound(res, "Post");
      }

      if (post.estaEliminado) {
        return res.status(410).json({
          success: false,
          message: "Este post ha sido eliminado",
        });
      }

      post.comentarios.push({
        usuario: usuarioId,
        contenido: contenido.trim(),
      });

      await post.save();

      // Poblar el comentario recién agregado con los datos del usuario
      await post.populate({
        path: "comentarios.usuario",
        select: "nick nombre nombreArtistico avatarUrl verificado",
      });

      const nuevoComentario = post.comentarios[post.comentarios.length - 1];

      // Crear notificación con el ID del comentario específico
      if (!isPostAuthor(post, usuarioId)) {
        const usuario = await Usuario.findById(usuarioId).select(
          "nick nombreArtistico"
        );
        const nombreUsuario = usuario.nombreArtistico || usuario.nick;

        // Obtener el ID del usuario dueño del post (puede ser ObjectId o objeto poblado)
        const postOwnerId =
          typeof post.usuario === "object" && post.usuario._id
            ? post.usuario._id
            : post.usuario;

        await crearNotificacion(
          postOwnerId,
          usuarioId,
          "comentario_post",
          `${nombreUsuario} comentó tu post`,
          {
            tipo: "post",
            id: postId,
            comentarioId: nuevoComentario._id, // ✅ ID del comentario específico
          }
        );
      }

      return sendCreated(res, nuevoComentario, "Comentario agregado");
    } catch (error) {
      console.error("Error agregando comentario:", error);
      return sendServerError(res, error, "Error al agregar comentario");
    }
  },

  /**
   * Obtener comentarios de un post
   */
  async obtenerComentarios(req, res) {
    try {
      const { postId } = req.params;
      const limit = parseInt(req.query.limit) || 50;
      const offset = parseInt(req.query.offset) || 0;

      const post = await Post.findById(postId)
        .select("comentarios estaEliminado")
        .populate(
          "comentarios.usuario",
          "nick nombre nombreArtistico avatarUrl verificado"
        )
        .lean();

      if (!post) {
        return sendNotFound(res, "Post");
      }

      if (post.estaEliminado) {
        return res.status(410).json({
          success: false,
          message: "Este post ha sido eliminado",
        });
      }

      const comentarios = post.comentarios
        .slice(offset, offset + limit)
        .reverse();

      return sendSuccess(res, { comentarios });
    } catch (error) {
      console.error("Error obteniendo comentarios:", error);
      return sendServerError(res, error, "Error al obtener comentarios");
    }
  },

  /**
   * Responder a un comentario
   */
  async responderComentario(req, res) {
    try {
      const usuarioId = req.usuario?.id || req.userId;
      const { postId, comentarioId } = req.params;
      const { contenido } = req.body;

      if (!contenido?.trim()) {
        return sendValidationError(res, "El contenido es requerido");
      }

      const post = await Post.findById(postId);
      if (!post || post.estaEliminado) {
        return sendNotFound(res, "Post");
      }

      const comentario = post.comentarios.id(comentarioId);
      if (!comentario) {
        return sendNotFound(res, "Comentario");
      }

      comentario.respuestas.push({
        usuario: usuarioId,
        contenido: contenido.trim(),
      });

      await post.save();

      // Poblar la respuesta recién agregada
      await post.populate({
        path: "comentarios.respuestas.usuario",
        select: "nick nombreArtistico avatarUrl verificado",
      });

      const nuevaRespuesta =
        comentario.respuestas[comentario.respuestas.length - 1];

      // Crear notificación al dueño del comentario original
      const comentarioOwner =
        typeof comentario.usuario === "object" && comentario.usuario._id
          ? comentario.usuario._id.toString()
          : comentario.usuario.toString();

      if (comentarioOwner !== usuarioId) {
        const { crearNotificacion } = await import(
          "../helpers/notificacionHelper.js"
        );
        const Usuario = (await import("../models/usuarioModels.js")).default;
        const usuario = await Usuario.findById(usuarioId).select(
          "nick nombreArtistico"
        );
        const nombreUsuario = usuario.nombreArtistico || usuario.nick;

        await crearNotificacion(
          comentarioOwner,
          usuarioId,
          "respuesta_comentario",
          `${nombreUsuario} respondió a tu comentario`,
          {
            tipo: "post",
            id: postId,
            comentarioId: comentarioId,
            respuestaId: nuevaRespuesta._id,
          }
        );
      }

      return sendCreated(res, nuevaRespuesta, "Respuesta agregada");
    } catch (error) {
      console.error("Error respondiendo comentario:", error);
      return sendServerError(res, error, "Error al responder comentario");
    }
  },

  /**
   * Dar/quitar like a un comentario
   */
  async toggleLikeComentario(req, res) {
    try {
      const usuarioId = req.usuario?.id || req.userId;
      const { postId, comentarioId } = req.params;

      const post = await Post.findById(postId);
      if (!post || post.estaEliminado) {
        return sendNotFound(res, "Post");
      }

      const comentario = post.comentarios.id(comentarioId);
      if (!comentario) {
        return sendNotFound(res, "Comentario");
      }

      const likeIndex = comentario.likes.indexOf(usuarioId);

      if (likeIndex > -1) {
        // Quitar like
        comentario.likes.splice(likeIndex, 1);
      } else {
        // Agregar like
        comentario.likes.push(usuarioId);
      }

      await post.save();

      return sendSuccess(
        res,
        {
          liked: likeIndex === -1,
          totalLikes: comentario.likes.length,
        },
        "Like actualizado"
      );
    } catch (error) {
      console.error("Error toggle like comentario:", error);
      return sendServerError(res, error, "Error al procesar like");
    }
  },

  /**
   * Crear un repost
   */
  async crearRepost(req, res) {
    try {
      const usuarioId = req.usuario.id;
      const { postId } = req.params;
      const { contenido } = req.body;

      const postOriginal = await Post.findById(postId);
      if (!postOriginal) {
        return sendNotFound(res, "Post original");
      }

      if (postOriginal.estaEliminado) {
        return res.status(410).json({
          success: false,
          message: "Este post ha sido eliminado",
        });
      }

      if (postOriginal.usuario.toString() === usuarioId) {
        return sendError(
          res,
          "No puedes hacer repost de tu propio contenido",
          400
        );
      }

      const yaHizoRepost = await Post.findOne({
        usuario: usuarioId,
        tipo: "repost_post",
        postOriginal: postId,
        estaEliminado: false,
      });

      if (yaHizoRepost) {
        return sendError(res, "Ya has hecho repost de este contenido", 400);
      }

      const nuevoRepost = await Post.create({
        usuario: usuarioId,
        tipo: "repost_post",
        contenido: contenido || null,
        postOriginal: postId,
      });

      postOriginal.reposts.push({
        usuario: usuarioId,
        comentario: contenido || null,
      });
      await postOriginal.save();

      await nuevoRepost.populate([
        {
          path: "usuario",
          select: "nick nombre nombreArtistico avatarUrl verificado",
        },
        {
          path: "postOriginal",
          populate: [
            {
              path: "usuario",
              select: "nick nombre nombreArtistico avatarUrl verificado",
            },
            {
              path: "recursoId",
            },
          ],
        },
      ]);

      if (postOriginal.usuario.toString() !== usuarioId) {
        const usuario = await Usuario.findById(usuarioId).select(
          "nick nombreArtistico"
        );
        const nombreUsuario = usuario.nombreArtistico || usuario.nick;
        const totalReposts = postOriginal.reposts.length;

        let mensaje = `${nombreUsuario} hizo repost de tu publicación`;
        if (
          totalReposts === 10 ||
          totalReposts === 50 ||
          totalReposts === 100
        ) {
          mensaje += ` - ¡Ya llevas ${totalReposts} reposts! 🔥`;
        }

        await crearNotificacion(
          postOriginal.usuario,
          usuarioId,
          "repost",
          mensaje,
          { tipo: "post", id: postId }
        );
      }

      return sendCreated(res, nuevoRepost, "Repost creado exitosamente");
    } catch (error) {
      console.error("Error creando repost:", error);
      return sendServerError(res, error, "Error al crear el repost");
    }
  },

  /**
   * Eliminar un repost
   */
  async eliminarRepost(req, res) {
    try {
      const usuarioId = req.usuario.id;
      const { postId } = req.params;

      const repost = await Post.findOne({
        usuario: usuarioId,
        tipo: "repost_post",
        postOriginal: postId,
        estaEliminado: false,
      });

      if (!repost) {
        return sendNotFound(res, "Repost");
      }

      repost.estaEliminado = true;
      await repost.save();

      const postOriginal = await Post.findById(postId);
      if (postOriginal && !postOriginal.estaEliminado) {
        const repostIndex = postOriginal.reposts.findIndex(
          (r) => r.usuario.toString() === usuarioId
        );
        if (repostIndex !== -1) {
          postOriginal.reposts.splice(repostIndex, 1);
          await postOriginal.save();
        }
      }

      return sendSuccess(res, null, "Repost eliminado");
    } catch (error) {
      console.error("Error eliminando repost:", error);
      return sendServerError(res, error, "Error al eliminar el repost");
    }
  },
};
