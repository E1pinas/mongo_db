import { FormEvent, useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import {
  useDatosAlbum,
  useGestionPortada,
  useSeleccionCanciones,
  useCrearAlbum,
} from "./hooks";
import {
  Cabecera,
  SelectorPortada,
  CamposBasicos,
  SelectorGeneros,
  SelectorCanciones,
  BotonesAccion,
  ModalSuspendido,
} from "./componentes";

const CrearAlbum = () => {
  const { user: usuario } = useAuth();
  const [showSuspendedModal, setShowSuspendedModal] = useState(false);

  // Hooks personalizados
  const { datos, actualizarCampo, toggleGenero } = useDatosAlbum();
  const { archivos, handlePortadaChange, eliminarPortada, errorImagen } =
    useGestionPortada();
  const {
    misCanciones,
    selectedSongs,
    showSongSelector,
    setShowSongSelector,
    toggleSong,
  } = useSeleccionCanciones();
  const { isSubmitting, error, manejarEnvio } = useCrearAlbum({
    datos,
    archivos,
    selectedSongs,
  });

  // Handler del formulario
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!datos.titulo.trim()) {
      return;
    }

    manejarEnvio();
  };

  return (
    <div className="min-h-screen bg-linear-to-b from-neutral-900 to-black text-white">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <Cabecera titulo="Crear Álbum" error={error || errorImagen} />

        <form onSubmit={handleSubmit} className="space-y-6">
          <SelectorPortada
            portadaPreview={archivos.portadaPreview}
            alCambiar={handlePortadaChange}
            alEliminar={eliminarPortada}
          />

          <CamposBasicos datos={datos} alCambiar={actualizarCampo} />

          <SelectorGeneros
            generosSeleccionados={datos.generos}
            alToggle={toggleGenero}
          />

          <SelectorCanciones
            canciones={misCanciones}
            seleccionadas={selectedSongs}
            mostrarSelector={showSongSelector}
            alToggleMostrar={() => setShowSongSelector(!showSongSelector)}
            alToggleCancion={toggleSong}
          />

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="esPrivado"
              checked={datos.esPrivado}
              onChange={(e) => actualizarCampo("esPrivado", e.target.checked)}
              className="w-4 h-4"
            />
            <label htmlFor="esPrivado" className="text-sm text-neutral-400">
              Álbum privado (solo tú podrás verlo)
            </label>
          </div>

          <BotonesAccion
            isSubmitting={isSubmitting}
            tituloVacio={!datos.titulo.trim()}
          />
        </form>

        <ModalSuspendido
          mostrar={showSuspendedModal}
          usuario={usuario}
          alCerrar={() => setShowSuspendedModal(false)}
        />
      </div>
    </div>
  );
};

export default CrearAlbum;
