import mongoose from "mongoose";
import "../database/conexion.js";
import { Reporte } from "../src/models/reporteModels.js";
import { Usuario } from "../src/models/usuarioModels.js";

const verDistribucion = async () => {
  try {
    await new Promise((resolve) => setTimeout(resolve, 2000));

    console.log("📊 DISTRIBUCIÓN DE REPORTES ENTRE ADMINISTRADORES\n");

    // Obtener todos los admins
    const adminsRegulares = await Usuario.find({
      role: "admin",
      estaActivo: true,
    }).select("nick nombreArtistico role");

    const superAdmins = await Usuario.find({
      role: "super_admin",
      estaActivo: true,
    }).select("nick nombreArtistico role");

    console.log(`👥 Administradores regulares: ${adminsRegulares.length}`);
    console.log(`⭐ Super administradores: ${superAdmins.length}`);
    console.log(`📝 Nota: Los reportes se asignan SOLO a admins regulares\n`);

    // Mostrar super admins (no reciben reportes automáticamente)
    if (superAdmins.length > 0) {
      console.log("═══════════════════════════════════════════════");
      console.log("⭐ SUPER ADMINISTRADORES (Solo supervisión)");
      console.log("═══════════════════════════════════════════════\n");

      for (const admin of superAdmins) {
        console.log(
          `⭐ @${admin.nick} (${
            admin.nombreArtistico || "Sin nombre artístico"
          })`
        );
        console.log(`   Role: SUPER_ADMIN`);
        console.log(`   📋 No recibe reportes automáticamente`);
        console.log(`   🔍 Puede ver y reasignar todos los reportes\n`);
      }
    }

    // Contar reportes por admin regular
    if (adminsRegulares.length > 0) {
      console.log("═══════════════════════════════════════════════");
      console.log("🛡️  ADMINISTRADORES REGULARES (Moderación activa)");
      console.log("═══════════════════════════════════════════════\n");
    }

    for (const admin of adminsRegulares) {
      const pendientes = await Reporte.countDocuments({
        asignadoA: admin._id,
        estado: "pendiente",
      });

      const enRevision = await Reporte.countDocuments({
        asignadoA: admin._id,
        estado: "en_revision",
      });

      const resueltos = await Reporte.countDocuments({
        asignadoA: admin._id,
        estado: "resuelto",
      });

      const total = pendientes + enRevision + resueltos;

      console.log(
        `🛡️  @${admin.nick} (${
          admin.nombreArtistico || "Sin nombre artístico"
        })`
      );
      console.log(`   Role: ADMIN`);
      console.log(`   📋 Pendientes: ${pendientes}`);
      console.log(`   🔍 En Revisión: ${enRevision}`);
      console.log(`   ✅ Resueltos: ${resueltos}`);
      console.log(`   📊 Total asignados: ${total}\n`);
    }

    // Reportes sin asignar
    const sinAsignar = await Reporte.countDocuments({
      asignadoA: null,
      estado: { $in: ["pendiente", "en_revision"] },
    });

    if (sinAsignar > 0) {
      console.log(`⚠️ Reportes sin asignar: ${sinAsignar}`);
    }

    const totalReportes = await Reporte.countDocuments();
    console.log(`\n📈 Total de reportes en el sistema: ${totalReportes}`);

    mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error.message);
    mongoose.connection.close();
    process.exit(1);
  }
};

verDistribucion();
