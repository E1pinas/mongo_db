// Script para diagnosticar y arreglar canciones con problemas de duración
import mongoose from "mongoose";
import dotenv from "dotenv";
import { Cancion } from "../src/models/cancionModels.js";
import { Usuario } from "../src/models/usuarioModels.js";

dotenv.config();

async function diagnosticarCanciones() {
  try {
    // Conectar a MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Conectado a MongoDB");

    // Buscar TODAS las canciones
    const todasLasCanciones = await Cancion.find({})
      .populate("artistas", "nick")
      .sort({ createdAt: -1 });

    console.log(
      `\n📊 Total de canciones en la BD: ${todasLasCanciones.length}`
    );

    // Separar canciones por estado
    const cancionesSinDuracion = [];
    const cancionesConDuracionCero = [];
    const cancionesOK = [];

    for (const cancion of todasLasCanciones) {
      if (
        !cancion.duracionSegundos ||
        cancion.duracionSegundos === undefined ||
        cancion.duracionSegundos === null
      ) {
        cancionesSinDuracion.push(cancion);
      } else if (cancion.duracionSegundos === 0) {
        cancionesConDuracionCero.push(cancion);
      } else {
        cancionesOK.push(cancion);
      }
    }

    console.log(`\n📈 Estadísticas:`);
    console.log(`   ✅ Canciones OK: ${cancionesOK.length}`);
    console.log(
      `   ⚠️  Canciones con duración 0: ${cancionesConDuracionCero.length}`
    );
    console.log(`   ❌ Canciones sin duración: ${cancionesSinDuracion.length}`);

    // Mostrar detalles de canciones problemáticas
    if (cancionesConDuracionCero.length > 0) {
      console.log(`\n⚠️  Canciones con duración 0:`);
      for (const cancion of cancionesConDuracionCero) {
        const artista = cancion.artistas[0]?.nick || "Sin artista";
        console.log(
          `   - "${cancion.titulo}" por ${artista} (ID: ${cancion._id})`
        );
      }
    }

    if (cancionesSinDuracion.length > 0) {
      console.log(`\n❌ Canciones sin campo duración:`);
      for (const cancion of cancionesSinDuracion) {
        const artista = cancion.artistas[0]?.nick || "Sin artista";
        console.log(
          `   - "${cancion.titulo}" por ${artista} (ID: ${cancion._id})`
        );
      }
    }

    // Preguntar si desea arreglar
    const totalProblematicas =
      cancionesConDuracionCero.length + cancionesSinDuracion.length;

    if (totalProblematicas > 0) {
      console.log(`\n🔧 Arreglando ${totalProblematicas} canciones...`);

      let arregladas = 0;

      // Arreglar canciones sin duración
      for (const cancion of cancionesSinDuracion) {
        cancion.duracionSegundos = 180; // 3 minutos por defecto
        await cancion.save();
        arregladas++;
      }

      // Arreglar canciones con duración 0
      for (const cancion of cancionesConDuracionCero) {
        cancion.duracionSegundos = 180; // 3 minutos por defecto
        await cancion.save();
        arregladas++;
      }

      console.log(
        `✅ Se arreglaron ${arregladas} canciones (duración predeterminada: 180s = 3:00)`
      );
      console.log(
        `💡 Edita manualmente las canciones para poner la duración correcta desde la interfaz`
      );
    } else {
      console.log(`\n✨ ¡Todas las canciones tienen duración válida!`);
    }

    // Verificar usuarios con canciones en su perfil
    console.log(`\n👥 Verificando perfiles de usuarios...`);
    const usuarios = await Usuario.find({}).select("nick misCanciones");

    for (const usuario of usuarios) {
      if (usuario.misCanciones && usuario.misCanciones.length > 0) {
        console.log(
          `   - ${usuario.nick}: ${usuario.misCanciones.length} canciones`
        );
      }
    }

    // Cerrar conexión
    await mongoose.connection.close();
    console.log("\n👋 Desconectado de MongoDB");
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
}

// Ejecutar
diagnosticarCanciones();
