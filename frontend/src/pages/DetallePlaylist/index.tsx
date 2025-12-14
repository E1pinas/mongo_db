import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { usePlayer } from "../../contexts";
import type { Cancion } from "../../types";
import { ConfirmModal } from "../../components/common";
import SongCommentsModal from "../../components/musica/SongCommentsModal";

// Hooks
import { useDatosPlaylist } from "./hooks/useDatosPlaylist";
import { useAccionesPlaylist } from "./hooks/useAccionesPlaylist";
import { useBuscarCanciones } from "./hooks/useBuscarCanciones";

// Componentes
import { CabeceraPlaylist } from "./componentes/CabeceraPlaylist";
import { BotonesAccionPlaylist } from "./componentes/BotonesAccionPlaylist";
import { ListaCancionesPlaylist } from "./componentes/ListaCancionesPlaylist";
import { ModalAgregarCanciones } from "./componentes/ModalAgregarCanciones";
import { VistaErrorPlaylist } from "./componentes/VistaErrorPlaylist";

export default function DetallePlaylist() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { playQueue, currentSong, isPlaying } = usePlayer();

  // Estado local
  const [
    cancionSeleccionadaParaComentarios,
    setCancionSeleccionadaParaComentarios,
  ] = useState<Cancion | null>(null);
  const [mostrarModalAgregarCanciones, setMostrarModalAgregarCanciones] =
    useState(false);

  // Hooks de datos y acciones
  const { playlist, cargando, error, estaSiguiendo, recargarPlaylist } =
    useDatosPlaylist(id);

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
    manejarToggleSeguir,
    manejarQuitarCancion,
    manejarEliminarPlaylist,
    manejarCambiarPrivacidad,
    esCreador,
    puedeEditar,
  } = useAccionesPlaylist({
    playlist,
    recargarPlaylist,
  });

  const canciones =
    (playlist?.canciones?.filter((c) => typeof c !== "string") as Cancion[]) ||
    [];

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
    playlistId: id || "",
    cancionesExistentes: canciones,
    onCancionesAgregadas: recargarPlaylist,
  });

  // Funciones de reproducción
  const manejarReproducirTodo = () => {
    if (canciones.length === 0) return;
    playQueue(canciones, 0, {
      type: "playlist",
      id: playlist!._id,
      name: playlist!.titulo,
    });
  };

  const manejarReproducirCancion = (index: number) => {
    if (canciones.length === 0) return;
    playQueue(canciones, index, {
      type: "playlist",
      id: playlist!._id,
      name: playlist!.titulo,
    });
  };

  // Manejadores de modal
  const manejarCerrarModalAgregarCanciones = () => {
    setMostrarModalAgregarCanciones(false);
    limpiarResultados();
  };

  // Renderizado de estados
  if (cargando) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!playlist || error) {
    return <VistaErrorPlaylist error={error} />;
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Cabecera */}
      <CabeceraPlaylist
        playlist={playlist}
        onVolver={() => navigate("/playlists")}
      />

      {/* Botones de acción */}
      <BotonesAccionPlaylist
        playlist={playlist}
        estaSiguiendo={estaSiguiendo}
        esCreador={esCreador()}
        cambiandoPrivacidad={cambiandoPrivacidad}
        onReproducirTodo={manejarReproducirTodo}
        onToggleSeguir={manejarToggleSeguir}
        onAgregarCanciones={() => setMostrarModalAgregarCanciones(true)}
        onCambiarPrivacidad={() => setMostrarConfirmarPrivacidad(true)}
        onEliminar={() => setMostrarConfirmarEliminar(true)}
      />

      {/* Lista de canciones */}
      <ListaCancionesPlaylist
        canciones={canciones}
        cancionActual={currentSong}
        estaReproduciendo={isPlaying}
        puedeEditar={puedeEditar()}
        onReproducir={manejarReproducirCancion}
        onAbrirComentarios={setCancionSeleccionadaParaComentarios}
        onCambioLike={recargarPlaylist}
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
        title="¿Quitar canción de la playlist?"
        message={`"${cancionAQuitar?.titulo}" se quitará de esta playlist, pero seguirá disponible en la plataforma.`}
        confirmText="Quitar"
        cancelText="Cancelar"
        isDangerous={false}
        isLoading={eliminandoCancion}
      />

      {/* Modal de confirmar eliminar playlist */}
      <ConfirmModal
        isOpen={mostrarConfirmarEliminar}
        onClose={() => setMostrarConfirmarEliminar(false)}
        onConfirm={manejarEliminarPlaylist}
        title="Eliminar playlist"
        message={`¿Estás seguro de eliminar la playlist "${playlist?.titulo}"? Esta acción no se puede deshacer. 

Tip: Si no quieres que otros vean esta playlist, considera hacerla privada en lugar de eliminarla.`}
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
          playlist?.esPublica
            ? "Hacer playlist privada"
            : "Hacer playlist pública"
        }
        message={
          playlist?.esPublica
            ? `La playlist "${playlist?.titulo}" solo será visible para ti.`
            : `La playlist "${playlist?.titulo}" será visible para todos los usuarios.`
        }
        confirmText={playlist?.esPublica ? "Hacer privada" : "Hacer pública"}
        cancelText="Cancelar"
        isDangerous={false}
        isLoading={cambiandoPrivacidad}
      />

      {/* Modal de agregar canciones */}
      {mostrarModalAgregarCanciones && (
        <ModalAgregarCanciones
          tituloPlaylist={playlist.titulo}
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
