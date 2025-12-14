import { useNavigate } from "react-router-dom";
import {
  useFormularioPerfil,
  useConfiguracionPrivacidad,
  useGestionImagenes,
  useGuardarConfiguracion,
} from "./hooks";
import {
  CabeceraModal,
  MensajeEstado,
  SelectorBanner,
  SelectorAvatar,
  CampoNick,
  CampoNombreArtistico,
  CampoBiografia,
  SeccionRedesSociales,
  SeccionConfiguracionPrivacidad,
} from "./componentes";

const Settings = () => {
  const navigate = useNavigate();
  const { formData, actualizarCampo } = useFormularioPerfil();
  const { privacySettings, actualizarPrivacidad } =
    useConfiguracionPrivacidad();
  const {
    archivos,
    errorImagen,
    avatarInputRef,
    bannerInputRef,
    manejarCambioAvatar,
    manejarCambioBanner,
    eliminarBanner,
  } = useGestionImagenes();

  const { guardando, mensaje, guardarCambios } = useGuardarConfiguracion({
    formData,
    privacySettings,
    archivos,
  });

  const handleClose = () => {
    navigate(-1);
  };

  return (
    <div className="fixed inset-0 bg-black/90 z-50 overflow-y-auto">
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-gray-900 rounded-xl shadow-2xl max-w-2xl w-full">
          <form onSubmit={guardarCambios} className="p-6">
            <CabeceraModal
              guardando={guardando}
              alGuardar={guardarCambios}
              alCerrar={handleClose}
            />

            <MensajeEstado mensaje={mensaje || errorImagen} />

            <div className="space-y-6">
              {/* Banner */}
              <SelectorBanner
                bannerPreview={archivos.bannerPreview}
                inputRef={bannerInputRef}
                alCambiar={manejarCambioBanner}
                alEliminar={eliminarBanner}
                deshabilitado={guardando}
              />

              {/* Avatar */}
              <SelectorAvatar
                avatarPreview={archivos.avatarPreview}
                inputRef={avatarInputRef}
                alCambiar={manejarCambioAvatar}
                deshabilitado={guardando}
              />

              {/* Campos de formulario */}
              <div className="space-y-4">
                <CampoNick
                  valor={formData.nick}
                  alCambiar={(valor) => actualizarCampo("nick", valor)}
                  deshabilitado={guardando}
                />

                <CampoNombreArtistico
                  valor={formData.nombreArtistico}
                  alCambiar={(valor) =>
                    actualizarCampo("nombreArtistico", valor)
                  }
                  deshabilitado={guardando}
                />

                <CampoBiografia
                  valor={formData.bio}
                  alCambiar={(valor) => actualizarCampo("bio", valor)}
                  deshabilitado={guardando}
                />
              </div>

              {/* Redes sociales */}
              <SeccionRedesSociales
                formData={formData}
                alCambiar={actualizarCampo}
                deshabilitado={guardando}
              />

              {/* Privacidad */}
              <SeccionConfiguracionPrivacidad
                privacySettings={privacySettings}
                alCambiar={actualizarPrivacidad}
                deshabilitado={guardando}
              />
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Settings;
