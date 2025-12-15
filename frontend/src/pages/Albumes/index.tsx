import { useState } from "react";
import type { GeneroConTodo } from "./tipos";
import { useAlbumes } from "./hooks/useAlbumes";
import { CabeceraAlbumes } from "./componentes/CabeceraAlbumes";
import { FiltrosGenero } from "./componentes/FiltrosGenero";
import { ListaAlbumes } from "./componentes/ListaAlbumes";
import { ModalCrearAlbum } from "./componentes/ModalCrearAlbum";

export function Albumes() {
  const [generoSeleccionado, setGeneroSeleccionado] =
    useState<GeneroConTodo>("Todo");
  const [mostrarModalCrear, setMostrarModalCrear] = useState(false);

  const {
    cargando,
    albumesFiltradosMios,
    albumesFiltradosPublicos,
    recargarAlbumes,
  } = useAlbumes({ generoSeleccionado });

  const manejarAlbumCreado = async () => {
    await recargarAlbumes();
    setMostrarModalCrear(false);
  };

  return (
    <div className="min-h-screen bg-linear-to-b from-neutral-900 via-black to-black text-white">
      <CabeceraAlbumes
        onClickCrear={() => setMostrarModalCrear(true)}
        generoSeleccionado={generoSeleccionado}
        onCambiarGenero={setGeneroSeleccionado}
      />
      <div className="px-6 pb-20">
        <ListaAlbumes
          titulo="Mis Álbumes"
          albumes={albumesFiltradosMios}
          cargando={cargando}
          mensajeSinAlbumes={
            generoSeleccionado === "Todo"
              ? "Aún no has creado ningún álbum"
              : `No tienes álbumes de ${generoSeleccionado}`
          }
        />

        <ListaAlbumes
          titulo="Descubre Álbumes"
          albumes={albumesFiltradosPublicos}
          cargando={cargando}
          mensajeSinAlbumes={
            generoSeleccionado === "Todo"
              ? "No hay álbumes públicos disponibles"
              : `No hay álbumes públicos de ${generoSeleccionado}`
          }
        />
      </div>

      <ModalCrearAlbum
        mostrar={mostrarModalCrear}
        onCerrar={() => setMostrarModalCrear(false)}
        onAlbumCreado={manejarAlbumCreado}
      />
    </div>
  );
}
