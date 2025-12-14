import { useState, useEffect } from "react";
import type { SolicitudAmistad } from "../../../services/friendship.service";
import type { Usuario } from "../../../types";
import type { TipoPestana } from "../tipos";
import { servicioSolicitudes } from "../servicios/solicitudesApi";

interface UseDatosSolicitudesParams {
  pestanaActiva: TipoPestana;
}

interface UseDatosSolicitudesResult {
  solicitudesRecibidas: SolicitudAmistad[];
  amigos: Usuario[];
  bloqueados: any[];
  cargando: boolean;
  setSolicitudesRecibidas: React.Dispatch<
    React.SetStateAction<SolicitudAmistad[]>
  >;
  setAmigos: React.Dispatch<React.SetStateAction<Usuario[]>>;
  setBloqueados: React.Dispatch<React.SetStateAction<any[]>>;
  recargarDatos: () => Promise<void>;
}

export const useDatosSolicitudes = ({
  pestanaActiva,
}: UseDatosSolicitudesParams): UseDatosSolicitudesResult => {
  const [solicitudesRecibidas, setSolicitudesRecibidas] = useState<
    SolicitudAmistad[]
  >([]);
  const [amigos, setAmigos] = useState<Usuario[]>([]);
  const [bloqueados, setBloqueados] = useState<any[]>([]);
  const [cargando, setCargando] = useState(true);

  // Cargar contadores al inicio
  const cargarTodosLosContadores = async () => {
    try {
      const [solicitudes, amigosData, bloqueadosData] = await Promise.all([
        servicioSolicitudes.obtenerSolicitudesPendientes(),
        servicioSolicitudes.obtenerAmigos(),
        servicioSolicitudes.obtenerBloqueados(),
      ]);

      setSolicitudesRecibidas(solicitudes);
      setAmigos(amigosData);
      setBloqueados(bloqueadosData);
    } catch (error) {
      console.error("Error loading counts:", error);
    }
  };

  // Cargar datos específicos de la pestaña activa
  const cargarDatos = async () => {
    try {
      setCargando(true);

      if (pestanaActiva === "recibidas") {
        const data = await servicioSolicitudes.obtenerSolicitudesPendientes();
        setSolicitudesRecibidas(data);
      } else if (pestanaActiva === "amigos") {
        const data = await servicioSolicitudes.obtenerAmigos();
        setAmigos(data);
      } else if (pestanaActiva === "bloqueados") {
        const data = await servicioSolicitudes.obtenerBloqueados();
        setBloqueados(data);
      }
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarTodosLosContadores();
  }, []);

  useEffect(() => {
    cargarDatos();
  }, [pestanaActiva]);

  return {
    solicitudesRecibidas,
    amigos,
    bloqueados,
    cargando,
    setSolicitudesRecibidas,
    setAmigos,
    setBloqueados,
    recargarDatos: cargarDatos,
  };
};
