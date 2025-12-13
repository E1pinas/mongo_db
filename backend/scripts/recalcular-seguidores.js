// Script para recalcular las estadísticas de seguidores de todos los usuarios
// Usa esto cuando elimines registros directamente de la base de datos

import mongoose from "mongoose";
import dotenv from "dotenv";
import { Usuario } from "../src/models/usuarioModels.js";
import { Seguidor } from "../src/models/seguidorModels.js";

dotenv.config();

async function recalcularEstadisticas() {
  try {
    // Conectar a MongoDB
    const mongoUri =
      process.env.NODE_ENV === "production"
        ? process.env.MONGODB_URI_PROD
        : process.env.MONGODB_URI_DEV;

    await mongoose.connect(mongoUri);
    console.log("✅ Conectado a MongoDB");

    // Obtener todos los usuarios
    const usuarios = await Usuario.find({}).select("_id nick estadisticas");
    console.log(
      `📊 Recalculando estadísticas de ${usuarios.length} usuarios...`
    );

    let actualizados = 0;

    for (const usuario of usuarios) {
      // Contar seguidores reales
      const totalSeguidores = await Seguidor.countDocuments({
        seguido: usuario._id,
      });

      // Contar seguidos reales
      const totalSeguidos = await Seguidor.countDocuments({
        seguidor: usuario._id,
      });

      // Actualizar solo si los valores cambiaron
      if (
        usuario.estadisticas.totalSeguidores !== totalSeguidores ||
        usuario.estadisticas.totalSeguidos !== totalSeguidos
      ) {
        usuario.estadisticas.totalSeguidores = totalSeguidores;
        usuario.estadisticas.totalSeguidos = totalSeguidos;
        await usuario.save();
        actualizados++;
        console.log(
          `  ✅ ${usuario.nick}: ${totalSeguidores} seguidores, ${totalSeguidos} seguidos`
        );
      }
    }

    console.log(
      `\n🎉 Recalculadas estadísticas de ${actualizados} usuarios de ${usuarios.length} totales`
    );

    // Cerrar conexión
    await mongoose.connection.close();
    console.log("👋 Desconectado de MongoDB");
  } catch (error) {
    console.error("❌ Error al recalcular estadísticas:", error);
    process.exit(1);
  }
}

// Ejecutar script
recalcularEstadisticas();
