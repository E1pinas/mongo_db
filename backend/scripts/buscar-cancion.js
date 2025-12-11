// Script para buscar y mostrar información de una canción específica
import dotenv from "dotenv";
import { Cancion } from "../src/models/cancionModels.js";
import { conexion } from "../database/conexion.js";

// Cargar variables de entorno
dotenv.config();

async function buscarCancion() {
  try {
    console.log("🔌 Conectando a la base de datos...");
    await conexion();

    const titulo = process.argv[2] || "concha";

    console.log(`🔍 Buscando canción: "${titulo}"...`);

    const canciones = await Cancion.find({
      titulo: { $regex: titulo, $options: "i" },
    }).select("titulo artistas esExplicita esPrivada audioUrl");

    if (canciones.length === 0) {
      console.log("❌ No se encontró ninguna canción con ese título");
    } else {
      console.log(`\n✅ Se encontraron ${canciones.length} canción(es):\n`);
      canciones.forEach((cancion, index) => {
        console.log(`📀 Canción ${index + 1}:`);
        console.log(`   - ID: ${cancion._id}`);
        console.log(`   - Título: ${cancion.titulo}`);
        console.log(`   - esExplicita: ${cancion.esExplicita}`);
        console.log(`   - esPrivada: ${cancion.esPrivada}`);
        console.log(`   - Tiene audioUrl: ${!!cancion.audioUrl}`);
        console.log("");
      });
    }

    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
}

buscarCancion();
