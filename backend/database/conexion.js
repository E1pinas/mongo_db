import mongoose from "mongoose";

export const conexion = async () => {
  try {
    // Seleccionar URI según el entorno
    const mongoUri = process.env.NODE_ENV === 'production'
      ? process.env.MONGODB_URI_PROD
      : process.env.MONGODB_URI_DEV;

    // Validar que existe la URI
    if (!mongoUri) {
      throw new Error('No se encontró la variable de entorno MONGODB_URI para el entorno actual');
    }

    await mongoose.connect(mongoUri);

    mongoose.set("strictQuery", true);
    
    // Log que indica el entorno y tipo de base de datos
    const dbType = process.env.NODE_ENV === 'production' ? 'PRODUCCIÓN (MongoDB Atlas)' : 'DESARROLLO (Local)';
    console.log(`✅ Conectado a MongoDB correctamente - Entorno: ${dbType}`);
  } catch (error) {
    console.error("❌ Error de conexión a MongoDB:", error.message);
    throw new Error(
      "No se estableció conexión con la base de datos: " + error.message
    );
  }
};

// Manejar desconexión
mongoose.connection.on("disconnected", () => {
  console.warn("⚠️ Desconectado de MongoDB");
});

mongoose.connection.on("error", (err) => {
  console.error("❌ Error en conexión MongoDB:", err);
});
