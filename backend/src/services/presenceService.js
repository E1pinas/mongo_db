// src/services/presenceService.js
import { Usuario } from "../models/usuarioModels.js";

/**
 * Servicio de presencia de usuarios
 * Maneja el estado de conexión online/offline
 */

// Tiempo de inactividad antes de marcar como desconectado (5 minutos)
const INACTIVITY_TIMEOUT = 5 * 60 * 1000;

/**
 * Actualizar última actividad del usuario
 */
export const updateUserActivity = async (userId) => {
  try {
    await Usuario.findByIdAndUpdate(userId, {
      ultimaActividad: new Date(),
      estaConectado: true,
    });
  } catch (error) {
    console.error("Error updating user activity:", error);
  }
};

/**
 * Marcar usuario como desconectado
 */
export const disconnectUser = async (userId) => {
  try {
    await Usuario.findByIdAndUpdate(userId, {
      estaConectado: false,
      ultimaConexion: new Date(),
    });
  } catch (error) {
    console.error("Error disconnecting user:", error);
  }
};

/**
 * Desconectar usuarios inactivos
 * Ejecutar periódicamente (cada 1 minuto)
 */
export const disconnectInactiveUsers = async () => {
  try {
    const inactivityThreshold = new Date(Date.now() - INACTIVITY_TIMEOUT);

    const result = await Usuario.updateMany(
      {
        estaConectado: true,
        ultimaActividad: { $lt: inactivityThreshold },
      },
      {
        estaConectado: false,
        ultimaConexion: new Date(),
      }
    );

    if (result.modifiedCount > 0) {
      console.log(
        `🔴 ${result.modifiedCount} usuarios marcados como desconectados por inactividad`
      );
    }
  } catch (error) {
    console.error("Error disconnecting inactive users:", error);
  }
};

/**
 * Iniciar monitoreo de presencia
 */
export const startPresenceMonitoring = () => {
  // Desconectar usuarios inactivos cada 1 minuto
  setInterval(disconnectInactiveUsers, 60 * 1000);
  console.log("✅ Sistema de presencia de usuarios iniciado");
};
