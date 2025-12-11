import mongoose from "mongoose";
import "../database/conexion.js";
import { Reporte } from "../src/models/reporteModels.js";

const verEstadosReportes = async () => {
  try {
    await new Promise((resolve) => setTimeout(resolve, 2000));

    console.log("📊 ESTADOS DE REPORTES:\n");

    const todos = await Reporte.find({});
    console.log(`Total de reportes: ${todos.length}\n`);

    const pendientes = await Reporte.find({ estado: "pendiente" });
    const enRevision = await Reporte.find({ estado: "en_revision" });
    const resueltos = await Reporte.find({ estado: "resuelto" });
    const rechazados = await Reporte.find({ estado: "rechazado" });

    console.log(`✅ Pendientes: ${pendientes.length}`);
    console.log(`🔍 En Revisión: ${enRevision.length}`);
    console.log(`✔️  Resueltos: ${resueltos.length}`);
    console.log(`❌ Rechazados: ${rechazados.length}\n`);

    console.log("📋 DETALLE DE TODOS LOS REPORTES:\n");
    todos.forEach((r, i) => {
      console.log(`${i + 1}. ID: ${r._id}`);
      console.log(`   Estado: ${r.estado}`);
      console.log(`   Tipo: ${r.tipoContenido}`);
      console.log(`   Motivo: ${r.motivo}`);
      console.log(`   Fecha: ${new Date(r.createdAt).toLocaleString()}`);
      if (r.resolucion && r.resolucion.fecha) {
        console.log(
          `   Resuelto: ${new Date(r.resolucion.fecha).toLocaleString()}`
        );
        console.log(`   Acción: ${r.resolucion.accion}`);
      }
      console.log("");
    });

    mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error.message);
    mongoose.connection.close();
    process.exit(1);
  }
};

verEstadosReportes();
