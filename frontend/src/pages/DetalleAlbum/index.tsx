import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { usePlayer, useAuth } from "../../contexts";
import type { Cancion, Album } from "../../types";
import { LoadingSpinner, ConfirmModal } from "../../components/common";
import SongCommentsModal from "../../components/musica/SongCommentsModal";

// Hooks
import { useDatosAlbum } from "./hooks/useDatosAlbum";
import { useAccionesAlbum } from "./hooks/useAccionesAlbum";
import { useBuscarCanciones } from "./hooks/useBuscarCanciones";

// Componentes
import { CabeceraAlbum } from "./componentes/CabeceraAlbum";
import { BotonesAccionAlbum } from "./componentes/BotonesAccionAlbum";
import { ListaCancionesAlbum } from "./componentes/ListaCancionesAlbum";
import { ModalAgregarCancionesAlbum } from "./componentes/ModalAgregarCancionesAlbum";
import { VistaErrorAlbum } from "./componentes/VistaErrorAlbum";

export default function DetalleAlbum() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { playQueue, currentSong, isPlaying } = usePlayer();
  const { user } = useAuth();

  // Estado local
  const [
    cancionSeleccionadaParaComentarios,
    setCancionSeleccionadaParaComentarios,
  ] = useState<Cancion | null>(null);
  const [mostrarModalAgregarCanciones, setMostrarModalAgregarCanciones] =
    useState(false);
  const [albumLocal, setAlbumLocal] = useState<Album | null>(null);

  // Hooks de datos y acciones
  const { album, cargando, error, leGusta, recargarAlbum } = useDatosAlbum(id);

  // Sincronizar album local con el album del hook
  if (album && album !== albumLocal) {
    setAlbumLocal(album);
  }

  const {
    cancionAQuitar,
    eliminandoCancion,
    borrando,
    cambiandoPrivacidad,
    mostrarConfirmarEliminar,
    mostrarConfirmarPrivacidad,
    setCancionAQuitar,
    setMostrarConfirmarEliminar,
    setMostrarConfirmarPrivacidad,
    manejarToggleLike,
    manejarQuitarCancion,
    manejarEliminarAlbum,
    manejarCambiarPrivacidad,
    puedeEditar,
  } = useAccionesAlbum({
    album: albumLocal,
    recargarAlbum,
  });

  const canciones =
    (albumLocal?.canciones?.filter(
      (c) => typeof c !== "string"
    ) as Cancion[]) || [];

  const {
    consulta,
    resultados,
    buscando,
    agregandoCancionId,
    idsCancionesSeleccionadas,
    agregandoMultiple,
    setConsulta,
    buscarCanciones,
    agregarCancion,
    toggleSeleccionCancion,
    agregarCancionesSeleccionadas,
    limpiarResultados,
  } = useBuscarCanciones({
    albumId: id || "",
    cancionesExistentes: canciones,
    onCancionesAgregadas: recargarAlbum,
  });

  // Funciones de reproducción
  const manejarReproducirTodo = () => {
    if (canciones.length === 0) return;
    playQueue(canciones, 0, {
      type: "album",
      id: albumLocal!._id,
      name: albumLocal!.titulo,
    });
  };

  const manejarReproducirCancion = (index: number) => {
    if (canciones.length === 0) return;
    playQueue(canciones, index, {
      type: "album",
      id: albumLocal!._id,
      name: albumLocal!.titulo,
    });
  };

  // Manejar cambio de like en canción individual
  const manejarCambioLikeCancion = (cancion: Cancion, liked: boolean) => {
    setAlbumLocal((prevAlbum) => {
      if (!prevAlbum) return prevAlbum;
      const cancionesActualizadas = (prevAlbum.canciones || []).map((c) => {
        if (typeof c === "string" || c._id !== cancion._id) return c;
        return {
          ...c,
          likes: liked
            ? [...(c.likes || []), user?._id || ""]
            : (c.likes || []).filter((id) => id !== user?._id),
        };
      }) as Cancion[];
      return { ...prevAlbum, canciones: cancionesActualizadas };
    });
  };

  // Manejadores de modal
  const manejarCerrarModalAgregarCanciones = () => {
    setMostrarModalAgregarCanciones(false);
    limpiarResultados();
  };

  // Renderizado de estados
  if (cargando) {
    return <LoadingSpinner />;
  }

  if (!albumLocal || error) {
    return <VistaErrorAlbum error={error} />;
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Cabecera */}
      <CabeceraAlbum album={albumLocal} onVolver={() => navigate("/albumes")} />

      {/* Botones de acción */}
      <BotonesAccionAlbum
        album={albumLocal}
        leGusta={leGusta}
        puedeEditar={puedeEditar()}
        cambiandoPrivacidad={cambiandoPrivacidad}
        onReproducirTodo={manejarReproducirTodo}
        onToggleLike={manejarToggleLike}
        onAgregarCanciones={() => setMostrarModalAgregarCanciones(true)}
        onCambiarPrivacidad={() => setMostrarConfirmarPrivacidad(true)}
        onEliminar={() => setMostrarConfirmarEliminar(true)}
      />

      {/* Lista de canciones */}
      <ListaCancionesAlbum
        canciones={canciones}
        cancionActual={currentSong}
        estaReproduciendo={isPlaying}
        puedeEditar={puedeEditar()}
        onReproducir={manejarReproducirCancion}
        onAbrirComentarios={setCancionSeleccionadaParaComentarios}
        onCambioLike={manejarCambioLikeCancion}
        onQuitar={setCancionAQuitar}
      />

      {/* Modal de comentarios */}
      {cancionSeleccionadaParaComentarios && (
        <SongCommentsModal
          song={cancionSeleccionadaParaComentarios}
          onClose={() => setCancionSeleccionadaParaComentarios(null)}
        />
      )}

      {/* Modal de confirmar quitar canción */}
      <ConfirmModal
        isOpen={!!cancionAQuitar}
        onClose={() => setCancionAQuitar(null)}
        onConfirm={manejarQuitarCancion}
        title="¿Quitar canción del álbum?"
        message={`"${cancionAQuitar?.titulo}" se quitará de este álbum, pero seguirá disponible en la plataforma.`}
        confirmText="Quitar"
        cancelText="Cancelar"
        isDangerous={false}
        isLoading={eliminandoCancion}
      />

      {/* Modal de confirmar eliminar álbum */}
      <ConfirmModal
        isOpen={mostrarConfirmarEliminar}
        onClose={() => setMostrarConfirmarEliminar(false)}
        onConfirm={manejarEliminarAlbum}
        title="Eliminar álbum"
        message={`¿Estás seguro de eliminar el álbum "${albumLocal?.titulo}"? Esta acción no se puede deshacer y eliminará todas las canciones asociadas.

Tip: Si no quieres que otros vean este álbum, considera hacerlo privado en lugar de eliminarlo.`}
        confirmText={borrando ? "Eliminando..." : "Eliminar"}
        cancelText="Cancelar"
        isDangerous
        isLoading={borrando}
      />

      {/* Modal de confirmar cambio de privacidad */}
      <ConfirmModal
        isOpen={mostrarConfirmarPrivacidad}
        onClose={() => setMostrarConfirmarPrivacidad(false)}
        onConfirm={manejarCambiarPrivacidad}
        title={
          albumLocal?.esPrivado ? "Hacer álbum público" : "Hacer álbum privado"
        }
        message={
          albumLocal?.esPrivado
            ? `El álbum "${albumLocal?.titulo}" será visible para todos los usuarios.`
            : `El álbum "${albumLocal?.titulo}" solo será visible para ti.`
        }
        confirmText={albumLocal?.esPrivado ? "Hacer público" : "Hacer privado"}
        cancelText="Cancelar"
        isDangerous={false}
        isLoading={cambiandoPrivacidad}
      />

      {/* Modal de agregar canciones */}
      {mostrarModalAgregarCanciones && (
        <ModalAgregarCancionesAlbum
          tituloAlbum={albumLocal.titulo}
          consulta={consulta}
          resultados={resultados}
          buscando={buscando}
          agregandoCancionId={agregandoCancionId}
          idsCancionesSeleccionadas={idsCancionesSeleccionadas}
          agregandoMultiple={agregandoMultiple}
          onCerrar={manejarCerrarModalAgregarCanciones}
          onCambiarConsulta={setConsulta}
          onBuscar={buscarCanciones}
          onAgregarCancion={agregarCancion}
          onToggleSeleccion={toggleSeleccionCancion}
          onAgregarSeleccionadas={agregarCancionesSeleccionadas}
        />
      )}
    </div>
  );
}
