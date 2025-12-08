import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import bcrypt from "bcrypt";
import { Usuario } from "../src/models/usuarioModels.js";

/**
 * Script para crear el Super Administrador inicial
 * Solo debe ejecutarse UNA VEZ
 */

const crearSuperAdmin = async () => {
  try {
    // Conectar a MongoDB
    const mongoUri =
      process.env.NODE_ENV === "production"
        ? process.env.MONGODB_URI_PROD
        : process.env.MONGODB_URI_DEV;

    await mongoose.connect(mongoUri);
    console.log("✅ Conectado a MongoDB");

    // Verificar si ya existe un super_admin
    const superAdminExiste = await Usuario.findOne({ role: "super_admin" });

    if (superAdminExiste) {
      console.log("⚠️  Ya existe un Super Administrador en el sistema");
      console.log(`   Nick: ${superAdminExiste.nick}`);
      console.log(`   Email: ${superAdminExiste.email}`);
      await mongoose.disconnect();
      process.exit(0);
    }

    // Datos del Super Admin (MODIFICA ESTOS VALORES)
    const datosAdmin = {
      nombre: "Super",
      apellidos: "Admin",
      nick: "superadmin",
      nombreArtistico: "Super Admin",
      email: "superadmin@tcgmusic.com",
      password: "Admin123!", // CAMBIAR ESTA CONTRASEÑA
      pais: "Global",
      fechaNacimiento: new Date("1990-01-01"),
      role: "super_admin",
      esVisible: false, // Admins son invisibles
      puedeSubirContenido: false, // Admins no suben música
    };

    // Encriptar contraseña
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(datosAdmin.password, salt);

    // Crear el Super Admin
    const superAdmin = new Usuario({
      ...datosAdmin,
      password: hashedPassword,
    });

    await superAdmin.save();

    console.log("🎉 Super Administrador creado exitosamente");
    console.log("=".repeat(50));
    console.log(`Nick: ${datosAdmin.nick}`);
    console.log(`Email: ${datosAdmin.email}`);
    console.log(`Password: ${datosAdmin.password}`);
    console.log("=".repeat(50));
    console.log("⚠️  IMPORTANTE: Guarda estas credenciales de forma segura");
    console.log("⚠️  Cambia la contraseña después del primer login");

    await mongoose.disconnect();
    console.log("✅ Desconectado de MongoDB");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error al crear Super Admin:", error);
    await mongoose.disconnect();
    process.exit(1);
  }
};

// Ejecutar el script
crearSuperAdmin();
