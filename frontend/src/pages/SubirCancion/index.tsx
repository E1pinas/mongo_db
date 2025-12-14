import { useEffect, useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import {
  useFormularioCancion,
  useGestionArchivos,
  useSubirCancion,
} from "./hooks";
import {
  CabeceraSubirCancion,
  MensajeEstado,
  SelectorAudio,
  SelectorPortada,
  CampoTitulo,
  SelectorGeneros,
  OpcionesCancion,
  BotonesAccion,
  ModalSuspendido,
} from "./componentes";

const SubirCancion = () => {
  const { user } = useAuth();
  const [mostrarModalSuspendido, setMostrarModalSuspendido] = useState(false);

  // Verificar suspensión
  useEffect(() => {
    if (user && (user as any).suspendido) {
      setMostrarModalSuspendido(true);
    }
  }, [user]);

  // Hooks personalizados
  const {
    formData,
    actualizarTitulo,
    toggleGenero,
    actualizarEsPrivada,
    actualizarEsExplicita,
  } = useFormularioCancion();

  const {
    archivos,
    error,
    setError,
    manejarCambioAudio,
    manejarCambioPortada,
  } = useGestionArchivos();

  const { subiendo, exitoso, subirCancion } = useSubirCancion({
    formData,
    archivos,
    setError,
  });

  return (
    <div className="min-h-screen bg-linear-to-b from-neutral-900 via-black to-black">
      <div className="max-w-5xl mx-auto p-6 pb-24">
        <CabeceraSubirCancion />

        {exitoso && <MensajeEstado tipo="exito" mensaje="" />}
        {error && <MensajeEstado tipo="error" mensaje={error} />}

        <form onSubmit={subirCancion} className="space-y-6">
          <SelectorAudio
            audioFile={archivos.audioFile}
            audioPreview={archivos.audioPreview}
            duracionSegundos={archivos.duracionSegundos}
            onCambioAudio={manejarCambioAudio}
          />

          <SelectorPortada
            portadaFile={archivos.portadaFile}
            portadaPreview={archivos.portadaPreview}
            onCambioPortada={manejarCambioPortada}
          />

          <CampoTitulo
            titulo={formData.titulo}
            onCambioTitulo={actualizarTitulo}
          />

          <SelectorGeneros
            generosSeleccionados={formData.generos}
            onToggleGenero={toggleGenero}
          />

          <OpcionesCancion
            esPrivada={formData.esPrivada}
            esExplicita={formData.esExplicita}
            onCambiarPrivacidad={actualizarEsPrivada}
            onCambiarExplicita={actualizarEsExplicita}
          />

          <BotonesAccion
            subiendo={subiendo}
            deshabilitado={
              subiendo || !archivos.audioFile || !formData.titulo.trim()
            }
            onSubmit={subirCancion}
          />
        </form>
      </div>

      <ModalSuspendido
        mostrar={mostrarModalSuspendido}
        razonSuspension={(user as any)?.razonSuspension}
        onCerrar={() => setMostrarModalSuspendido(false)}
      />
    </div>
  );
};

export default SubirCancion;
