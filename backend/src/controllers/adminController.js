import { Usuario } from "../models/usuarioModels.js";
import bcrypt from "bcrypt";

/**
 * Obtener todos los administradores (admin y super_admin)
 * Solo super_admin puede ver esta lista
 */
export const listarAdministradores = async (req, res) => {
  try {
    const administradores = await Usuario.find({
      role: { $in: ["admin", "super_admin"] },
    })
      .select("nombre apellidos nick email role avatarUrl fechaCreacion")
      .sort({ role: -1, fechaCreacion: -1 }); // super_admin primero

    res.status(200).json({
      status: "success",
      total: administradores.length,
      administradores,
    });
  } catch (error) {
    console.error("Error al listar administradores:", error);
    res.status(500).json({
      status: "error",
      message: "Error al obtener lista de administradores",
    });
  }
};

/**
 * Crear un nuevo administrador (solo super_admin)
 * El super_admin NO puede ser creado por esta ruta
 */
export const crearAdministrador = async (req, res) => {
  try {
    const { nombre, apellidos, nick, email, password, pais, fechaNacimiento } =
      req.body;

    // Validar que todos los campos requeridos estén presentes
    if (
      !nombre ||
      !apellidos ||
      !nick ||
      !email ||
      !password ||
      !pais ||
      !fechaNacimiento
    ) {
      return res.status(400).json({
        status: "error",
        message: "Todos los campos son obligatorios",
      });
    }

    // Verificar que el email no exista
    const emailExiste = await Usuario.findOne({ email });
    if (emailExiste) {
      return res.status(400).json({
        status: "error",
        message: "El email ya está registrado",
      });
    }

    // Verificar que el nick no exista
    const nickExiste = await Usuario.findOne({ nick });
    if (nickExiste) {
      return res.status(400).json({
        status: "error",
        message: "El nick ya está en uso",
      });
    }

    // Encriptar contraseña
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Crear el nuevo administrador
    const nuevoAdmin = new Usuario({
      nombre,
      apellidos,
      nick,
      email,
      password: hashedPassword,
      pais,
      fechaNacimiento,
      role: "admin", // Solo se puede crear admin, NO super_admin
      esVisible: false, // Admins son invisibles
      puedeSubirContenido: false, // Admins no suben música
    });

    await nuevoAdmin.save();

    // Responder sin la contraseña
    const adminCreado = nuevoAdmin.toObject();
    delete adminCreado.password;

    res.status(201).json({
      status: "success",
      message: "Administrador creado exitosamente",
      administrador: adminCreado,
    });
  } catch (error) {
    console.error("Error al crear administrador:", error);
    res.status(500).json({
      status: "error",
      message: "Error al crear administrador",
    });
  }
};

/**
 * Eliminar un administrador (solo super_admin)
 * NO se puede eliminar al super_admin
 */
export const eliminarAdministrador = async (req, res) => {
  try {
    const { id } = req.params;

    // Buscar el usuario
    const usuario = await Usuario.findById(id);

    if (!usuario) {
      return res.status(404).json({
        status: "error",
        message: "Administrador no encontrado",
      });
    }

    // Verificar que NO sea super_admin
    if (usuario.role === "super_admin") {
      return res.status(403).json({
        status: "error",
        message: "No se puede eliminar al Super Administrador",
      });
    }

    // Verificar que sea admin
    if (usuario.role !== "admin") {
      return res.status(400).json({
        status: "error",
        message: "El usuario no es un administrador",
      });
    }

    // Eliminar el administrador
    await Usuario.findByIdAndDelete(id);

    res.status(200).json({
      status: "success",
      message: "Administrador eliminado exitosamente",
    });
  } catch (error) {
    console.error("Error al eliminar administrador:", error);
    res.status(500).json({
      status: "error",
      message: "Error al eliminar administrador",
    });
  }
};

/**
 * Cambiar el rol de un usuario normal a admin (solo super_admin)
 */
export const promoverAAdmin = async (req, res) => {
  try {
    const { id } = req.params;

    const usuario = await Usuario.findById(id);

    if (!usuario) {
      return res.status(404).json({
        status: "error",
        message: "Usuario no encontrado",
      });
    }

    // No se puede promover a quien ya es admin o super_admin
    if (usuario.role === "admin" || usuario.role === "super_admin") {
      return res.status(400).json({
        status: "error",
        message: "El usuario ya es administrador",
      });
    }

    // Promover a admin
    usuario.role = "admin";
    await usuario.save();

    const usuarioActualizado = usuario.toObject();
    delete usuarioActualizado.password;

    res.status(200).json({
      status: "success",
      message: "Usuario promovido a Administrador exitosamente",
      usuario: usuarioActualizado,
    });
  } catch (error) {
    console.error("Error al promover usuario:", error);
    res.status(500).json({
      status: "error",
      message: "Error al promover usuario",
    });
  }
};

/**
 * Degradar un admin a usuario normal (solo super_admin)
 * NO se puede degradar al super_admin
 */
export const degradarAdmin = async (req, res) => {
  try {
    const { id } = req.params;

    const usuario = await Usuario.findById(id);

    if (!usuario) {
      return res.status(404).json({
        status: "error",
        message: "Usuario no encontrado",
      });
    }

    // No se puede degradar al super_admin
    if (usuario.role === "super_admin") {
      return res.status(403).json({
        status: "error",
        message: "No se puede degradar al Super Administrador",
      });
    }

    // Verificar que sea admin
    if (usuario.role !== "admin") {
      return res.status(400).json({
        status: "error",
        message: "El usuario no es un administrador",
      });
    }

    // Degradar a user
    usuario.role = "user";
    await usuario.save();

    const usuarioActualizado = usuario.toObject();
    delete usuarioActualizado.password;

    res.status(200).json({
      status: "success",
      message: "Administrador degradado a usuario normal",
      usuario: usuarioActualizado,
    });
  } catch (error) {
    console.error("Error al degradar administrador:", error);
    res.status(500).json({
      status: "error",
      message: "Error al degradar administrador",
    });
  }
};
