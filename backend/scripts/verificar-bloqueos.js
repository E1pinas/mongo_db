import mongoose from "mongoose";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Cargar variables de entorno
dotenv.config({ path: join(__dirname, "../.env") });

const { Amistad } = await import("../src/models/amistadModels.js");
const { Usuario } = await import("../src/models/usuarioModels.js");

async function verificarBloqueos() {
  try {
    const MONGODB_URI =
      process.env.MONGODB_URI_DEV ||
      process.env.MONGODB_URI ||
      process.env.MONGO_URI;

    if (!MONGODB_URI) {
      console.error(
        "❌ No se encontró MONGODB_URI en las variables de entorno"
      );
      console.log(
        "Variables disponibles:",
        Object.keys(process.env).filter((k) => k.includes("MONGO"))
      );
      process.exit(1);
    }

    await mongoose.connect(MONGODB_URI);
    console.log("📦 Conectado a MongoDB");

    // Obtener todos los bloqueos
    const bloqueos = await Amistad.find({ estado: "bloqueada" })
      .populate("solicitante", "nick nombreArtistico")
      .populate("receptor", "nick nombreArtistico");

    console.log(`\n📊 Total de bloqueos: ${bloqueos.length}\n`);

    if (bloqueos.length === 0) {
      console.log("✅ No hay bloqueos en la base de datos");
      process.exit(0);
    }

    // Mostrar todos los bloqueos
    bloqueos.forEach((bloqueo, index) => {
      const bloqueador = bloqueo.solicitante?.nick || "Usuario eliminado";
      const bloqueado = bloqueo.receptor?.nick || "Usuario eliminado";

      console.log(`${index + 1}. ${bloqueador} bloqueó a ${bloqueado}`);
      console.log(`   ID: ${bloqueo._id}`);
      console.log(`   Fecha: ${bloqueo.createdAt || "N/A"}\n`);
    });

    // Buscar bloqueos duplicados o bidireccionales
    console.log("\n🔍 Verificando bloqueos duplicados o bidireccionales...\n");

    const duplicados = [];
    for (let i = 0; i < bloqueos.length; i++) {
      for (let j = i + 1; j < bloqueos.length; j++) {
        const b1 = bloqueos[i];
        const b2 = bloqueos[j];

        // Verificar si son el mismo par de usuarios (en cualquier dirección)
        if (
          (b1.solicitante?._id?.toString() ===
            b2.solicitante?._id?.toString() &&
            b1.receptor?._id?.toString() === b2.receptor?._id?.toString()) ||
          (b1.solicitante?._id?.toString() === b2.receptor?._id?.toString() &&
            b1.receptor?._id?.toString() === b2.solicitante?._id?.toString())
        ) {
          duplicados.push({ b1, b2 });
        }
      }
    }

    if (duplicados.length > 0) {
      console.log(
        `⚠️  Se encontraron ${duplicados.length} bloqueos duplicados/bidireccionales:`
      );
      duplicados.forEach((dup, index) => {
        const user1 = dup.b1.solicitante?.nick || "Usuario eliminado";
        const user2 = dup.b1.receptor?.nick || "Usuario eliminado";
        console.log(`\n${index + 1}. Entre ${user1} y ${user2}:`);
        console.log(
          `   Bloqueo 1: ${user1} bloqueó a ${user2} (ID: ${dup.b1._id})`
        );
        console.log(
          `   Bloqueo 2: ${dup.b2.solicitante?.nick} bloqueó a ${dup.b2.receptor?.nick} (ID: ${dup.b2._id})`
        );
      });
    } else {
      console.log("✅ No se encontraron bloqueos duplicados");
    }

    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
}

verificarBloqueos();
