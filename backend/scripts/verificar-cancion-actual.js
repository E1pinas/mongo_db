import mongoose from "mongoose";
import { Usuario } from "../src/models/usuarioModels.js";

const MONGODB_URI = "mongodb://127.0.0.1:27017/tcg_music";

async function verificar() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("✅ Conectado a MongoDB");

    // Buscar usuario "La cookie"
    const usuario = await Usuario.findOne({ nick: "La cookie" }).populate({
      path: "cancionActual.cancion",
      select: "titulo artistas portadaUrl",
      populate: {
        path: "artistas",
        select: "nombreArtistico nick",
      },
    });

    if (!usuario) {
      console.log("❌ Usuario 'La cookie' no encontrado");
      return;
    }

    console.log("\n📋 Usuario:", usuario.nick);
    console.log("🔌 Conectado:", usuario.estaConectado);
    console.log("\n🎵 Canción Actual:");
    console.log(JSON.stringify(usuario.cancionActual, null, 2));

    await mongoose.connection.close();
    console.log("\n✅ Conexión cerrada");
  } catch (error) {
    console.error("❌ Error:", error.message);
    await mongoose.connection.close();
  }
}

verificar();
