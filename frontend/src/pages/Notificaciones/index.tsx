import { useEffect, useState } from "react";
import { useNotifications } from "../../contexts/NotificationContext";
import { LoadingSpinner } from "../../components/common";
import PostModal from "../../components/social/PostModal";
import CommentModal from "../../components/social/CommentModal";
import SongCommentModal from "../../components/musica/SongCommentModal";
import Toast from "../../components/Toast";
import type { TipoFiltro } from "./tipos";
import {
  useNotificacionesFiltradas,
  useGestionModales,
  useManejoNotificacion,
} from "./hooks";
import {
  CabeceraNotificaciones,
  FiltrosNotificaciones,
  BotonMarcarLeidas,
  EstadoVacioNotificaciones,
  TarjetaNotificacion,
} from "./componentes/index";

const Notificaciones = () => {
  const {
    notifications,
    isLoading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    fetchNotifications,
  } = useNotifications();

  const [filtro, setFiltro] = useState<TipoFiltro>("todas");

  const {
    estadoModales,
    datosModales,
    abrirModalPost,
    abrirModalCancionComentario,
    cerrarModalPost,
    cerrarModalComentario,
    cerrarModalCancionComentario,
  } = useGestionModales();

  const { notificacionesFiltradas, hayNoLeidas } = useNotificacionesFiltradas({
    notificaciones: notifications,
    filtro,
  });

  const { manejarClickNotificacion, mensajeError, limpiarError } =
    useManejoNotificacion({
      markAsRead,
      abrirModalPost,
      abrirModalCancionComentario,
    });

  // Cargar notificaciones al montar
  useEffect(() => {
    fetchNotifications();
  }, []);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <LoadingSpinner text="Cargando notificaciones..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-b from-neutral-950 via-neutral-900 to-neutral-950 p-6">
      <div className="max-w-4xl mx-auto">
        <CabeceraNotificaciones />

        <FiltrosNotificaciones
          filtroActivo={filtro}
          onCambiarFiltro={setFiltro}
        />

        {hayNoLeidas && (
          <BotonMarcarLeidas onMarcarTodasLeidas={markAllAsRead} />
        )}

        {notificacionesFiltradas.length === 0 ? (
          <EstadoVacioNotificaciones filtro={filtro} />
        ) : (
          <div className="space-y-3">
            {notificacionesFiltradas.map((notif, index) => (
              <TarjetaNotificacion
                key={notif._id}
                notificacion={notif}
                indice={index}
                onClickNotificacion={manejarClickNotificacion}
                onEliminarNotificacion={deleteNotification}
              />
            ))}
          </div>
        )}

        {/* Modales */}
        {datosModales.postIdSeleccionado && (
          <PostModal
            postId={datosModales.postIdSeleccionado}
            isOpen={estadoModales.mostrarPostModal}
            onClose={cerrarModalPost}
            highlightCommentId={datosModales.highlightCommentId}
            autoOpenComments={datosModales.autoOpenComments}
          />
        )}

        {datosModales.postIdSeleccionado &&
          datosModales.comentarioIdSeleccionado && (
            <CommentModal
              postId={datosModales.postIdSeleccionado}
              comentarioId={datosModales.comentarioIdSeleccionado}
              isOpen={estadoModales.mostrarCommentModal}
              onClose={cerrarModalComentario}
            />
          )}

        {datosModales.cancionIdSeleccionada &&
          datosModales.comentarioIdSeleccionado && (
            <SongCommentModal
              songId={datosModales.cancionIdSeleccionada}
              comentarioId={datosModales.comentarioIdSeleccionado}
              isOpen={estadoModales.mostrarSongCommentModal}
              onClose={cerrarModalCancionComentario}
            />
          )}

        {/* Toast de error */}
        {mensajeError && (
          <Toast message={mensajeError} type="error" onClose={limpiarError} />
        )}
      </div>
    </div>
  );
};

export default Notificaciones;
