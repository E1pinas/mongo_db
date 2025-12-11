import mongoose from "mongoose";
import "../database/conexion.js";
import { Reporte } from "../src/models/reporteModels.js";

const verificarReportesResueltos = async () => {
  try {
    console.log("🔍 Verificando reportes resueltos...\n");

    const resueltos = await Reporte.find({ estado: "resuelto" });
    const pendientes = await Reporte.find({ estado: "pendiente" });
    const enRevision = await Reporte.find({ estado: "en_revision" });
    const rechazados = await Reporte.find({ estado: "rechazado" });

    console.log("📊 Estadísticas de reportes:");
    console.log(`- Resueltos: ${resueltos.length}`);
    console.log(`- Pendientes: ${pendientes.length}`);
    console.log(`- En revisión: ${enRevision.length}`);
    console.log(`- Rechazados: ${rechazados.length}`);
    console.log(
      `- Total: ${
        resueltos.length +
        pendientes.length +
        enRevision.length +
        rechazados.length
      }\n`
    );

    if (resueltos.length > 0) {
      console.log("✅ Reportes resueltos encontrados:");
      resueltos.forEach((r, i) => {
        console.log(`${i + 1}. ID: ${r._id}`);
        console.log(`   Tipo: ${r.tipoContenido}`);
        console.log(`   Motivo: ${r.motivo}`);
        console.log(
          `   Resuelto: ${
            r.resolucion?.fecha
              ? new Date(r.resolucion.fecha).toLocaleString()
              : "N/A"
          }`
        );
        console.log(`   Acción: ${r.resolucion?.accion || "N/A"}\n`);
      });
    } else {
      console.log("⚠️ No hay reportes resueltos en la base de datos");
    }

    mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error);
    mongoose.connection.close();
    process.exit(1);
  }
};

setTimeout(verificarReportesResueltos, 2000);
