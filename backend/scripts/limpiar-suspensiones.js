import mongoose from "mongoose";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { Usuario } from "../src/models/usuarioModels.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, "..", ".env") });

async function limpiarSuspensiones() {
  try {
    const mongoUri =
      process.env.NODE_ENV === "production"
        ? process.env.MONGODB_URI_PROD
        : process.env.MONGODB_URI_DEV;

    if (!mongoUri) {
      console.error("❌ Error: No se encontró MONGODB_URI_DEV en .env");
      process.exit(1);
    }

    await mongoose.connect(mongoUri);
    console.log("✅ Conectado a MongoDB");

    // Buscar usuarios con suspendidoHasta (campo legacy) o suspendido = true
    const usuariosSuspendidos = await Usuario.find({
      $or: [
        { suspendidoHasta: { $exists: true, $ne: null } },
        { suspendido: true },
      ],
    }).select(
      "nick nombreArtistico nombre apellidos suspendido suspendidoHasta razonSuspension"
    );

    console.log(
      `\n📊 Usuarios suspendidos encontrados: ${usuariosSuspendidos.length}\n`
    );

    if (usuariosSuspendidos.length === 0) {
      console.log("✅ No hay usuarios suspendidos para limpiar");
      process.exit(0);
    }

    // Mostrar usuarios
    usuariosSuspendidos.forEach((user, index) => {
      const displayName =
        user.nombreArtistico || `${user.nombre} ${user.apellidos}`;
      console.log(`${index + 1}. @${user.nick} (${displayName})`);
      console.log(`   - suspendido: ${user.suspendido}`);
      console.log(`   - suspendidoHasta: ${user.suspendidoHasta || "N/A"}`);
      console.log(`   - razón: ${user.razonSuspension || "N/A"}\n`);
    });

    // Limpiar suspensiones
    const resultado = await Usuario.updateMany(
      {
        $or: [
          { suspendidoHasta: { $exists: true, $ne: null } },
          { suspendido: true },
        ],
      },
      {
        $unset: { suspendidoHasta: "" },
        $set: {
          suspendido: false,
          razonSuspension: null,
        },
      }
    );

    console.log(`\n✅ Suspensiones limpiadas:`);
    console.log(`   - Documentos modificados: ${resultado.modifiedCount}`);
    console.log(`   - Documentos encontrados: ${resultado.matchedCount}`);

    // Verificar
    const verificacion = await Usuario.countDocuments({
      $or: [
        { suspendidoHasta: { $exists: true, $ne: null } },
        { suspendido: true },
      ],
    });

    console.log(
      `\n🔍 Verificación: ${verificacion} usuarios suspendidos restantes`
    );

    if (verificacion === 0) {
      console.log("✅ Todos los usuarios han sido reactivados correctamente\n");
    }

    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
}

limpiarSuspensiones();
