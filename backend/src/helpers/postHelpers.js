/**
 * Helper para enriquecer posts con información del usuario actual
 * (likes, reposts, etc.)
 */

/**
 * Enriquece un post con información de interacción del usuario
 * @param {Object} post - Post a enriquecer (debe ser objeto plano, no documento Mongoose)
 * @param {string} usuarioId - ID del usuario actual
 * @returns {Object} Post enriquecido con usuario_dio_like y usuario_hizo_repost
 */
export const enrichPostWithUserData = (post, usuarioId) => {
  if (!usuarioId) return post;

  const enrichedPost = { ...post };

  // Verificar si el usuario dio like
  enrichedPost.usuario_dio_like = post.likes?.some(
    (like) => like.toString() === usuarioId
  );

  // Verificar si el usuario hizo repost
  enrichedPost.usuario_hizo_repost = post.reposts?.some(
    (repost) => repost.usuario?.toString() === usuarioId
  );

  // Si es un repost_post, también enriquecer el post original
  if (post.tipo === "repost_post" && post.postOriginal) {
    enrichedPost.postOriginal = {
      ...post.postOriginal,
      usuario_dio_like: post.postOriginal.likes?.some(
        (like) => like.toString() === usuarioId
      ),
      usuario_hizo_repost: post.postOriginal.reposts?.some(
        (repost) => repost.usuario?.toString() === usuarioId
      ),
    };
  }

  return enrichedPost;
};

/**
 * Enriquece un array de posts con información del usuario
 * @param {Array} posts - Array de posts a enriquecer
 * @param {string} usuarioId - ID del usuario actual
 * @returns {Array} Posts enriquecidos
 */
export const enrichPostsWithUserData = (posts, usuarioId) => {
  if (!usuarioId || !Array.isArray(posts)) return posts;

  return posts.map((post) => {
    // Si es un documento de Mongoose, convertir a objeto plano
    const postObj = post.toObject ? post.toObject() : post;
    return enrichPostWithUserData(postObj, usuarioId);
  });
};

/**
 * Obtiene las opciones de populate estándar para posts
 * @returns {Array} Array de opciones de populate
 */
export const getPostPopulateOptions = () => [
  {
    path: "usuario",
    select: "nick nombre nombreArtistico avatarUrl verificado",
  },
  {
    path: "recursoId",
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
];

/**
 * Verifica si un usuario ya hizo repost de un post
 * @param {string} usuarioId - ID del usuario
 * @param {string} postId - ID del post
 * @param {Object} Post - Modelo de Post
 * @returns {Promise<boolean>} True si ya hizo repost
 */
export const hasUserReposted = async (usuarioId, postId, Post) => {
  const repost = await Post.findOne({
    usuario: usuarioId,
    tipo: "repost_post",
    postOriginal: postId,
    estaEliminado: false,
  });

  return !!repost;
};

/**
 * Verifica si un usuario es el autor de un post
 * @param {Object} post - Post a verificar
 * @param {string} usuarioId - ID del usuario
 * @returns {boolean} True si es el autor
 */
export const isPostAuthor = (post, usuarioId) => {
  return post.usuario.toString() === usuarioId;
};
