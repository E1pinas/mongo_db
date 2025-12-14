import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { usePlayer } from "../../contexts/PlayerContext";
import type { Cancion } from "../../types";
import { SongCommentsModal, EditSongModal } from "../../components/musica";
import { LoadingSpinner, ConfirmModal } from "../../components/common";
import {
  useMisCanciones,
  useBusquedaCanciones,
  useGestionCancion,
} from "./hooks";
import {
  Cabecera,
  BarraAcciones,
  ListaCanciones,
  EstadosVacios,
} from "./componentes";

export default function MisCanciones() {
  const navigate = useNavigate();
  const { playQueue, currentSong, isPlaying } = usePlayer();
  const [comentariosCancion, setComentariosCancion] = useState<Cancion | null>(
    null
  );

  const {
    canciones,
    setCanciones,
    cargando,
    error,
    setError,
    cargarCanciones,
  } = useMisCanciones();

  const { searchQuery, handleSearch } = useBusquedaCanciones(
    cargarCanciones,
    setCanciones
  );

  const {
    editingCancion,
    setEditingCancion,
    deletingCancion,
    setDeletingCancion,
    isDeleting,
    manejarEditarCancion,
    handleConfirmDelete,
  } = useGestionCancion(setCanciones);

  const handlePlaySong = (_cancion: Cancion, index: number) => {
    playQueue(canciones, index);
  };

  return (
    <div className="p-6">
      <Cabecera totalCanciones={canciones.length} />

      {error && (
        <div className="mb-6 p-4 bg-red-500/20 border border-red-500 rounded-lg">
          <p className="text-red-400">{error}</p>
          <button
            onClick={() => setError("")}
            className="text-sm underline mt-2"
          >
            Cerrar
          </button>
        </div>
      )}

      <BarraAcciones
        searchQuery={searchQuery}
        onSearch={handleSearch}
        onSubir={() => navigate("/subir")}
        onReproducirTodo={() => playQueue(canciones, 0)}
        mostrarReproducirTodo={canciones.length > 0}
      />

      {cargando && <LoadingSpinner text="Cargando canciones..." />}

      {!cargando && canciones.length === 0 && (
        <EstadosVacios
          hayBusqueda={!!searchQuery}
          searchQuery={searchQuery}
          onSubir={() => navigate("/subir")}
          onLimpiarBusqueda={() => handleSearch("")}
        />
      )}

      {!cargando && canciones.length > 0 && (
        <ListaCanciones
          canciones={canciones}
          currentSong={currentSong}
          isPlaying={isPlaying}
          onPlay={handlePlaySong}
          onOpenComments={setComentariosCancion}
          onRecargar={cargarCanciones}
          onEdit={setEditingCancion}
          onDelete={setDeletingCancion}
        />
      )}

      {comentariosCancion && (
        <SongCommentsModal
          song={comentariosCancion}
          onClose={() => setComentariosCancion(null)}
        />
      )}

      {editingCancion && (
        <EditSongModal
          isOpen={true}
          onClose={() => setEditingCancion(null)}
          onSave={manejarEditarCancion}
          song={editingCancion}
        />
      )}

      <ConfirmModal
        isOpen={!!deletingCancion}
        onClose={() => setDeletingCancion(null)}
        onConfirm={handleConfirmDelete}
        title="¿Eliminar canción?"
        message={`Esta acción eliminará "${deletingCancion?.titulo}" de toda la plataforma, incluyendo todas las playlists y álbumes donde esté. Esta acción no se puede deshacer.`}
        confirmText="Eliminar"
        cancelText="Cancelar"
        isDangerous={true}
        isLoading={isDeleting}
      />
    </div>
  );
}
