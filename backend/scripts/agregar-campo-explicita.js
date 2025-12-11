// Script para agregar el campo esExplicita a todas las canciones que no lo tengan
import dotenv from "dotenv";
import { Cancion } from "../src/models/cancionModels.js";
import { conexion } from "../database/conexion.js";

// Cargar variables de entorno
dotenv.config();

async function agregarCampoExplicita() {
  try {
    console.log("🔌 Conectando a la base de datos...");
    await conexion();

    console.log("🔍 Buscando canciones sin campo esExplicita...");

    // Actualizar todas las canciones que no tienen el campo esExplicita
    const resultado = await Cancion.updateMany(
      {
        $or: [{ esExplicita: { $exists: false } }, { esExplicita: null }],
      },
      {
        $set: { esExplicita: false },
      }
    );

    console.log(`✅ Actualización completada:`);
    console.log(`   - Canciones encontradas: ${resultado.matchedCount}`);
    console.log(`   - Canciones actualizadas: ${resultado.modifiedCount}`);

    // Mostrar algunas canciones actualizadas
    const cancionesActualizadas = await Cancion.find({ esExplicita: false })
      .select("titulo artistas esExplicita")
      .limit(10);

    console.log("\n📋 Primeras 10 canciones:");
    cancionesActualizadas.forEach((cancion, index) => {
      console.log(
        `   ${index + 1}. ${cancion.titulo} - esExplicita: ${
          cancion.esExplicita
        }`
      );
    });

    console.log("\n✅ Script completado exitosamente");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
}

agregarCampoExplicita();
