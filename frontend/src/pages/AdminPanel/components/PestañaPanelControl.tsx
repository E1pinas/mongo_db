import React from "react";
import { Estadisticas } from "../tipos";
import { TarjetaEstadistica } from "./TarjetaEstadistica";
import { Users, Music, AlertTriangle, BarChart3 } from "lucide-react";

interface PropsPestañaPanelControl {
  estadisticas: Estadisticas;
}

export const PestañaPanelControl: React.FC<PropsPestañaPanelControl> = ({
  estadisticas,
}) => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white mb-6">
          Panel de Control
        </h2>

        {/* Estadísticas de Usuarios */}
        <h3 className="text-lg font-semibold text-neutral-300 mb-4">
          Usuarios
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <TarjetaEstadistica
            icono={<Users className="w-6 h-6 text-white" />}
            titulo="Total Usuarios"
            valor={estadisticas.usuarios.total}
            color="azul"
          />
          <TarjetaEstadistica
            icono={<BarChart3 className="w-6 h-6 text-white" />}
            titulo="Usuarios Activos"
            valor={estadisticas.usuarios.activos}
            color="verde"
          />
          <TarjetaEstadistica
            icono={<AlertTriangle className="w-6 h-6 text-white" />}
            titulo="Suspendidos"
            valor={estadisticas.usuarios.suspendidos}
            color="rojo"
          />
          <TarjetaEstadistica
            icono={<Users className="w-6 h-6 text-white" />}
            titulo="Nuevos (30 días)"
            valor={estadisticas.usuarios.nuevosUltimos30Dias}
            color="morado"
          />
        </div>

        {/* Estadísticas de Contenido */}
        <h3 className="text-lg font-semibold text-neutral-300 mb-4">
          Contenido
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <TarjetaEstadistica
            icono={<Music className="w-6 h-6 text-white" />}
            titulo="Canciones"
            valor={estadisticas.contenido.canciones}
            color="azul"
          />
          <TarjetaEstadistica
            icono={<Music className="w-6 h-6 text-white" />}
            titulo="Álbumes"
            valor={estadisticas.contenido.albumes}
            color="morado"
          />
          <TarjetaEstadistica
            icono={<Music className="w-6 h-6 text-white" />}
            titulo="Playlists"
            valor={estadisticas.contenido.playlists}
            color="verde"
          />
        </div>

        {/* Estadísticas de Reportes */}
        <h3 className="text-lg font-semibold text-neutral-300 mb-4">
          Moderación
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <TarjetaEstadistica
            icono={<AlertTriangle className="w-6 h-6 text-white" />}
            titulo="Reportes Totales"
            valor={estadisticas.reportes.total}
            color="azul"
          />
          <TarjetaEstadistica
            icono={<AlertTriangle className="w-6 h-6 text-white" />}
            titulo="Reportes Pendientes"
            valor={estadisticas.reportes.pendientes}
            color="rojo"
            subtitulo={`${((estadisticas.reportes.pendientes / estadisticas.reportes.total) * 100).toFixed(1)}% del total`}
          />
        </div>
      </div>
    </div>
  );
};
