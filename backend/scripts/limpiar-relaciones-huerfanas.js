// Script para limpiar relaciones de seguimiento huérfanas (usuarios eliminados)
import mongoose from "mongoose";
import dotenv from "dotenv";
import { Usuario } from "../src/models/usuarioModels.js";
import { Seguidor } from "../src/models/seguidorModels.js";

dotenv.config();

async function limpiarRelacionesHuerfanas() {
  try {
    // Conectar a MongoDB
    const mongoUri =
      process.env.NODE_ENV === "production"
        ? process.env.MONGODB_URI_PROD
        : process.env.MONGODB_URI_DEV;

    await mongoose.connect(mongoUri);
    console.log("✅ Conectado a MongoDB");

    // Obtener todas las relaciones de seguimiento
    const todasRelaciones = await Seguidor.find({});
    console.log(
      `📊 Total de relaciones de seguimiento: ${todasRelaciones.length}`
    );

    let huerfanasEliminadas = 0;
    let usuariosAfectados = new Set();

    for (const relacion of todasRelaciones) {
      // Verificar si el seguidor existe
      const seguidorExiste = await Usuario.findById(relacion.seguidor);
      // Verificar si el seguido existe
      const seguidoExiste = await Usuario.findById(relacion.seguido);

      // Si alguno de los dos no existe, eliminar la relación
      if (!seguidorExiste || !seguidoExiste) {
        console.log(`❌ Relación huérfana encontrada:`);
        console.log(
          `   Seguidor: ${relacion.seguidor} (${
            seguidorExiste ? "existe" : "eliminado"
          })`
        );
        console.log(
          `   Seguido: ${relacion.seguido} (${
            seguidoExiste ? "existe" : "eliminado"
          })`
        );

        await Seguidor.findByIdAndDelete(relacion._id);
        huerfanasEliminadas++;

        // Marcar usuarios para recalcular
        if (seguidorExiste) usuariosAfectados.add(relacion.seguidor.toString());
        if (seguidoExiste) usuariosAfectados.add(relacion.seguido.toString());
      }
    }

    console.log(`\n🧹 Relaciones huérfanas eliminadas: ${huerfanasEliminadas}`);

    // Recalcular contadores de usuarios afectados
    console.log(
      `\n📊 Recalculando contadores de ${usuariosAfectados.size} usuarios afectados...`
    );

    for (const usuarioId of usuariosAfectados) {
      const totalSeguidores = await Seguidor.countDocuments({
        seguido: usuarioId,
      });
      const totalSeguidos = await Seguidor.countDocuments({
        seguidor: usuarioId,
      });

      await Usuario.findByIdAndUpdate(usuarioId, {
        "estadisticas.totalSeguidores": totalSeguidores,
        "estadisticas.totalSeguidos": totalSeguidos,
      });

      const usuario = await Usuario.findById(usuarioId).select("nick");
      console.log(
        `   ✅ ${usuario.nick}: ${totalSeguidores} seguidores, ${totalSeguidos} seguidos`
      );
    }

    console.log("\n🎉 Limpieza completada exitosamente");

    await mongoose.connection.close();
    console.log("👋 Desconectado de MongoDB");
  } catch (error) {
    console.error("❌ Error al limpiar relaciones huérfanas:", error);
    process.exit(1);
  }
}

// Ejecutar script
limpiarRelacionesHuerfanas();
