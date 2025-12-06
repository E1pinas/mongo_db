// Script para arreglar canciones sin duración
// Si tienes canciones antiguas sin duracionSegundos, este script las actualiza a un valor por defecto

import mongoose from "mongoose";
import dotenv from "dotenv";
import { Cancion } from "../src/models/cancionModels.js";

dotenv.config();

async function fixDuracion() {
  try {
    // Conectar a MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Conectado a MongoDB");

    // Buscar canciones sin duracionSegundos o con valor 0
    const cancionesSinDuracion = await Cancion.find({
      $or: [
        { duracionSegundos: { $exists: false } },
        { duracionSegundos: null },
        { duracionSegundos: 0 },
      ],
    });

    console.log(
      `📊 Encontradas ${cancionesSinDuracion.length} canciones sin duración`
    );

    if (cancionesSinDuracion.length === 0) {
      console.log("✅ Todas las canciones tienen duración");
      await mongoose.connection.close();
      return;
    }

    // Actualizar cada canción con una duración por defecto de 180 segundos (3 minutos)
    let actualizadas = 0;

    for (const cancion of cancionesSinDuracion) {
      cancion.duracionSegundos = 180; // 3 minutos por defecto
      await cancion.save();
      actualizadas++;
      console.log(
        `  ✅ "${cancion.titulo}" - duracionSegundos actualizada a 180s`
      );
    }

    console.log(
      `\n🎉 Se actualizaron ${actualizadas} canciones con duración por defecto (180s)`
    );
    console.log(
      "💡 Tip: Edita manualmente las canciones para poner la duración correcta"
    );

    // Cerrar conexión
    await mongoose.connection.close();
    console.log("👋 Desconectado de MongoDB");
  } catch (error) {
    console.error("❌ Error al arreglar duraciones:", error);
    process.exit(1);
  }
}

// Ejecutar script
fixDuracion();
