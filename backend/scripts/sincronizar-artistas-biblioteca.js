// Script para sincronizar seguimientos existentes con biblioteca.artistasGuardados
import mongoose from "mongoose";
import { Usuario } from "../src/models/usuarioModels.js";
import { Seguidor } from "../src/models/seguidorModels.js";
import dotenv from "dotenv";

dotenv.config();

const sincronizarArtistasBiblioteca = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Conectado a MongoDB");

    // Obtener todos los seguimientos
    const seguimientos = await Seguidor.find({});
    console.log(`📊 Total de seguimientos encontrados: ${seguimientos.length}`);

    let actualizados = 0;

    for (const seguimiento of seguimientos) {
      const { seguidor, seguido } = seguimiento;

      // Agregar el seguido a la biblioteca de artistasGuardados del seguidor
      const resultado = await Usuario.updateOne(
        { _id: seguidor },
        { $addToSet: { "biblioteca.artistasGuardados": seguido } }
      );

      if (resultado.modifiedCount > 0) {
        actualizados++;
        console.log(
          `✅ Usuario ${seguidor} ahora tiene a ${seguido} en artistas guardados`
        );
      }
    }

    console.log(`\n🎉 Sincronización completada:`);
    console.log(`   - Total seguimientos: ${seguimientos.length}`);
    console.log(`   - Usuarios actualizados: ${actualizados}`);

    await mongoose.connection.close();
    console.log("\n✅ Conexión cerrada");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
};

sincronizarArtistasBiblioteca();
