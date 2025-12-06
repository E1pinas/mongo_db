import Post from "../models/postModels.js";
import { Usuario } from "../models/usuarioModels.js";
import { Seguidor } from "../models/seguidorModels.js";
import { crearNotificacion } from "../helpers/notificacionHelper.js";

export const postController = {
  /**
   * Crear un nuevo post
   */
  async crearPost(req, res) {
    try {
      const usuarioId = req.usuario.id;
      const { contenido, tipo, recursoId } = req.body;

      // Validaciones
      const tiposValidos = [
        "texto",
        "repost_cancion",
        "repost_album",
        "repost_playlist",
      ];
      if (!tiposValidos.includes(tipo)) {
        return res.status(400).json({
          success: false,
          message: "Tipo de post inválido",
        });
      }

      if (tipo !== "texto" && !recursoId) {
        return res.status(400).json({
          success: false,
          message: "El recurso es requerido para reposts",
        });
      }

      if (tipo === "texto" && (!contenido || contenido.trim() === "")) {
        return res.status(400).json({
          success: false,
          message: "El contenido es requerido para posts de texto",
        });
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

      res.status(201).json({
        success: true,
        message: "Post creado exitosamente",
        data: nuevoPost,
      });
    } catch (error) {
      console.error("Error creando post:", error);
      res.status(500).json({
        success: false,
        message: "Error al crear el post",
      });
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
        .populate("usuario", "nick nombre nombreArtistico avatarUrl verificado")
        .populate("recursoId")
        .populate({
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
        });

      // Convertir a objetos planos con virtuals
      const posts = postsQuery.map((post) => {
        const postObj = post.toObject();

        // Verificar likes y reposts del usuario actual
        const usuarioActualId = req.usuario?.id;
        if (usuarioActualId) {
          postObj.usuario_dio_like = post.likes?.some(
            (like) => like.toString() === usuarioActualId
          );
          postObj.usuario_hizo_repost = post.reposts?.some(
            (repost) => repost.usuario.toString() === usuarioActualId
          );

          // Para repost_post, también verificar likes y reposts del post original
          if (postObj.tipo === "repost_post" && postObj.postOriginal) {
            postObj.postOriginal.usuario_dio_like =
              postObj.postOriginal.likes?.some(
                (like) => like.toString() === usuarioActualId
              );
            postObj.postOriginal.usuario_hizo_repost =
              postObj.postOriginal.reposts?.some(
                (repost) => repost.usuario.toString() === usuarioActualId
              );
          }
        }

        return postObj;
      });

      res.json({
        success: true,
        data: posts,
      });
    } catch (error) {
      console.error("Error obteniendo posts del usuario:", error);
      res.status(500).json({
        success: false,
        message: "Error al obtener los posts",
      });
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
        .populate("usuario", "nick nombre nombreArtistico avatarUrl verificado")
        .populate("recursoId")
        .populate({
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
        });

      // Convertir a objetos planos con virtuals
      const posts = postsQuery.map((post) => {
        const postObj = post.toObject();

        postObj.usuario_dio_like = post.likes?.some(
          (like) => like.toString() === usuarioId
        );
        postObj.usuario_hizo_repost = post.reposts?.some(
          (repost) => repost.usuario.toString() === usuarioId
        );

        // Para repost_post, también verificar likes y reposts del post original
        if (postObj.tipo === "repost_post" && postObj.postOriginal) {
          postObj.postOriginal.usuario_dio_like =
            postObj.postOriginal.likes?.some(
              (like) => like.toString() === usuarioId
            );
          postObj.postOriginal.usuario_hizo_repost =
            postObj.postOriginal.reposts?.some(
              (repost) => repost.usuario.toString() === usuarioId
            );
        }

        return postObj;
      });

      res.json({
        success: true,
        data: posts,
      });
    } catch (error) {
      console.error("Error obteniendo feed:", error);
      res.status(500).json({
        success: false,
        message: "Error al obtener el feed",
      });
    }
  },

  /**
   * Obtener un post específico
   */
  async obtenerPost(req, res) {
    try {
      const { postId } = req.params;
      const post = await Post.findOne({ _id: postId, estaEliminado: false })
        .populate("usuario", "nick nombre nombreArtistico avatarUrl verificado")
        .populate("recursoId")
        .lean();

      if (!post) {
        return res.status(404).json({
          success: false,
          message: "Post no encontrado",
        });
      }

      const usuarioId = req.usuario?.id;
      if (usuarioId) {
        post.usuario_dio_like = post.likes?.some(
          (like) => like.toString() === usuarioId
        );
        post.usuario_hizo_repost = post.reposts?.some(
          (repost) => repost.usuario.toString() === usuarioId
        );
      }

      res.json({
        success: true,
        data: post,
      });
    } catch (error) {
      console.error("Error obteniendo post:", error);
      res.status(500).json({
        success: false,
        message: "Error al obtener el post",
      });
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
        return res.status(404).json({
          success: false,
          message: "Post no encontrado o no tienes permiso",
        });
      }

      res.json({
        success: true,
        message: "Post eliminado exitosamente",
      });
    } catch (error) {
      console.error("Error eliminando post:", error);
      res.status(500).json({
        success: false,
        message: "Error al eliminar el post",
      });
    }
  },

  /**
   * Dar/quitar like a un post
   */
  async toggleLike(req, res) {
    try {
      const usuarioId = req.usuario.id;
      const { postId } = req.params;

      const post = await Post.findById(postId);
      if (!post) {
        return res.status(404).json({
          success: false,
          message: "Post no encontrado",
        });
      }

      const yaLeDioLike = post.likes.includes(usuarioId);

      if (yaLeDioLike) {
        post.likes.pull(usuarioId);
        await post.save();

        res.json({
          success: true,
          message: "Like eliminado",
          liked: false,
        });
      } else {
        post.likes.push(usuarioId);
        await post.save();

        // Crear notificación si no es el propio usuario
        if (post.usuario.toString() !== usuarioId) {
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

        res.json({
          success: true,
          message: "Like agregado",
          liked: true,
        });
      }
    } catch (error) {
      console.error("Error en toggle like:", error);
      res.status(500).json({
        success: false,
        message: "Error al procesar el like",
      });
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

      if (!contenido || contenido.trim() === "") {
        return res.status(400).json({
          success: false,
          message: "El contenido del comentario es requerido",
        });
      }

      const post = await Post.findById(postId);
      if (!post) {
        return res.status(404).json({
          success: false,
          message: "Post no encontrado",
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

      // Crear notificación
      if (post.usuario.toString() !== usuarioId) {
        const usuario = await Usuario.findById(usuarioId).select(
          "nick nombreArtistico"
        );
        const nombreUsuario = usuario.nombreArtistico || usuario.nick;

        await crearNotificacion(
          post.usuario,
          usuarioId,
          "comentario_post",
          `${nombreUsuario} comentó tu post`,
          { tipo: "post", id: postId }
        );
      }

      res.status(201).json({
        success: true,
        message: "Comentario agregado",
        data: post.comentarios[post.comentarios.length - 1],
      });
    } catch (error) {
      console.error("Error agregando comentario:", error);
      res.status(500).json({
        success: false,
        message: "Error al agregar el comentario",
      });
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
        .select("comentarios")
        .populate(
          "comentarios.usuario",
          "nick nombre nombreArtistico avatarUrl verificado"
        )
        .lean();

      if (!post) {
        return res.status(404).json({
          success: false,
          message: "Post no encontrado",
        });
      }

      const comentarios = post.comentarios
        .slice(offset, offset + limit)
        .reverse(); // Más recientes primero

      res.json({
        success: true,
        data: comentarios,
      });
    } catch (error) {
      console.error("Error obteniendo comentarios:", error);
      res.status(500).json({
        success: false,
        message: "Error al obtener los comentarios",
      });
    }
  },

  /**
   * Crear un repost
   */
  async crearRepost(req, res) {
    try {
      const usuarioId = req.usuario.id;
      const { postId } = req.params;
      const { contenido } = req.body; // Comentario opcional al hacer repost

      const postOriginal = await Post.findById(postId);
      if (!postOriginal) {
        return res.status(404).json({
          success: false,
          message: "Post no encontrado",
        });
      }

      // Verificar si el usuario es el autor del post
      if (postOriginal.usuario.toString() === usuarioId) {
        return res.status(400).json({
          success: false,
          message: "No puedes hacer repost de tu propio contenido",
        });
      }

      // Verificar si ya hizo repost (buscar si ya existe un post tipo repost_post con este postOriginal)
      const yaHizoRepost = await Post.findOne({
        usuario: usuarioId,
        tipo: "repost_post",
        postOriginal: postId,
        estaEliminado: false,
      });

      if (yaHizoRepost) {
        return res.status(400).json({
          success: false,
          message: "Ya has hecho repost de este contenido",
        });
      }

      // Crear el nuevo post tipo repost
      const nuevoRepost = await Post.create({
        usuario: usuarioId,
        tipo: "repost_post",
        contenido: contenido || null,
        postOriginal: postId,
      });

      // Agregar también al array reposts del post original (para mantener el contador)
      postOriginal.reposts.push({
        usuario: usuarioId,
        comentario: contenido || null,
      });
      await postOriginal.save();

      // Poblar el repost con los datos necesarios
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

      // Crear notificación
      if (postOriginal.usuario.toString() !== usuarioId) {
        const usuario = await Usuario.findById(usuarioId).select(
          "nick nombreArtistico"
        );
        const nombreUsuario = usuario.nombreArtistico || usuario.nick;

        await crearNotificacion(
          postOriginal.usuario,
          usuarioId,
          "repost",
          `${nombreUsuario} hizo repost de tu publicación`,
          { tipo: "post", id: postId }
        );
      }

      res.status(201).json({
        success: true,
        message: "Repost creado exitosamente",
        data: nuevoRepost,
      });
    } catch (error) {
      console.error("Error creando repost:", error);
      res.status(500).json({
        success: false,
        message: "Error al crear el repost",
      });
    }
  },

  /**
   * Eliminar un repost
   */
  async eliminarRepost(req, res) {
    try {
      const usuarioId = req.usuario.id;
      const { postId } = req.params;

      // Buscar el post de repost que hizo el usuario
      const repost = await Post.findOne({
        usuario: usuarioId,
        tipo: "repost_post",
        postOriginal: postId,
        estaEliminado: false,
      });

      if (!repost) {
        return res.status(404).json({
          success: false,
          message: "Repost no encontrado",
        });
      }

      // Eliminar el post de repost
      repost.estaEliminado = true;
      await repost.save();

      // También eliminar del array reposts del post original
      const postOriginal = await Post.findById(postId);
      if (postOriginal) {
        const repostIndex = postOriginal.reposts.findIndex(
          (r) => r.usuario.toString() === usuarioId
        );
        if (repostIndex !== -1) {
          postOriginal.reposts.splice(repostIndex, 1);
          await postOriginal.save();
        }
      }

      res.json({
        success: true,
        message: "Repost eliminado",
      });
    } catch (error) {
      console.error("Error eliminando repost:", error);
      res.status(500).json({
        success: false,
        message: "Error al eliminar el repost",
      });
    }
  },
};
