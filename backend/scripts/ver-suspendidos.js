import mongoose from "mongoose";
import { Usuario } from "../src/models/usuarioModels.js";

const DB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/tcg_music";

async function verSuspendidos() {
  try {
    await mongoose.connect(DB_URI);
    console.log("✅ Conectado a MongoDB");

    const suspendidos = await Usuario.find({
      $or: [
        { suspendido: true },
        { suspendidoHasta: { $exists: true, $ne: null } },
      ],
    }).select("nick email suspendido suspendidoHasta razonSuspension");

    console.log("\n📋 Usuarios suspendidos encontrados:", suspendidos.length);

    suspendidos.forEach((user, index) => {
      console.log(`\n${index + 1}. ${user.nick} (${user.email})`);
      console.log(`   - suspendido: ${user.suspendido}`);
      console.log(`   - suspendidoHasta: ${user.suspendidoHasta}`);
      console.log(`   - razonSuspension: ${user.razonSuspension || "N/A"}`);
    });

    await mongoose.disconnect();
    console.log("\n✅ Desconectado de MongoDB");
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
}

verSuspendidos();
