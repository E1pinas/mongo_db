import express from "express";
import { postController } from "../controllers/postController.js";
import { authUsuario } from "../middlewares/authUsuario.js";
import { authOptional } from "../middlewares/authOptional.js";
import { sanitizeInput } from "../middlewares/sanitizeInput.js";
import { body } from "express-validator";
import { handleValidationErrors } from "../middlewares/validationErrors.js";

const router = express.Router();

/**
 * @route   POST /api/posts
 * @desc    Crear un nuevo post
 * @access  Privado
 */
router.post(
  "/",
  authUsuario,
  [
    body("tipo")
      .isIn(["texto", "repost_cancion", "repost_album", "repost_playlist"])
      .withMessage("Tipo de post inválido"),
    body("contenido")
      .optional()
      .trim()
      .isLength({ max: 500 })
      .withMessage("El contenido no puede exceder 500 caracteres"),
    body("recursoId").optional().trim(),
  ],
  handleValidationErrors,
  sanitizeInput,
  postController.crearPost
);

/**
 * @route   GET /api/posts/feed
 * @desc    Obtener feed de posts (usuarios seguidos)
 * @access  Privado
 */
router.get("/feed", authUsuario, postController.obtenerFeed);

/**
 * @route   GET /api/posts/usuario/:usuarioId
 * @desc    Obtener posts de un usuario específico
 * @access  Público/Privado
 */
router.get(
  "/usuario/:usuarioId",
  authOptional,
  postController.obtenerPostsUsuario
);

/**
 * @route   GET /api/posts/:postId
 * @desc    Obtener un post específico
 * @access  Público/Privado
 */
router.get("/:postId", authOptional, postController.obtenerPost);

/**
 * @route   DELETE /api/posts/:postId
 * @desc    Eliminar un post
 * @access  Privado (solo el autor)
 */
router.delete("/:postId", authUsuario, postController.eliminarPost);

/**
 * @route   POST /api/posts/:postId/like
 * @desc    Dar/quitar like a un post
 * @access  Privado
 */
router.post("/:postId/like", authUsuario, postController.toggleLike);

/**
 * @route   POST /api/posts/:postId/comentarios
 * @desc    Agregar comentario a un post
 * @access  Privado
 */
router.post(
  "/:postId/comentarios",
  authUsuario,
  [
    body("contenido")
      .trim()
      .notEmpty()
      .withMessage("El contenido es requerido")
      .isLength({ max: 300 })
      .withMessage("El comentario no puede exceder 300 caracteres"),
  ],
  handleValidationErrors,
  sanitizeInput,
  postController.agregarComentario
);

/**
 * @route   GET /api/posts/:postId/comentarios
 * @desc    Obtener comentarios de un post
 * @access  Público/Privado
 */
router.get(
  "/:postId/comentarios",
  authOptional,
  postController.obtenerComentarios
);

/**
 * @route   POST /api/posts/:postId/repost
 * @desc    Hacer repost de un post
 * @access  Privado
 */
router.post(
  "/:postId/repost",
  authUsuario,
  [
    body("comentario")
      .optional()
      .trim()
      .isLength({ max: 200 })
      .withMessage("El comentario no puede exceder 200 caracteres"),
  ],
  handleValidationErrors,
  sanitizeInput,
  postController.crearRepost
);

/**
 * @route   DELETE /api/posts/:postId/repost
 * @desc    Eliminar un repost
 * @access  Privado
 */
router.delete("/:postId/repost", authUsuario, postController.eliminarRepost);

export default router;
