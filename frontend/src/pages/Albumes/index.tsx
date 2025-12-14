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
    <div className="min-h-screen bg-linear-to-br from-neutral-900 via-neutral-900 to-neutral-800 p-6 text-white">
      <div className="mx-auto max-w-7xl">
        <CabeceraAlbumes onClickCrear={() => setMostrarModalCrear(true)} />

        <FiltrosGenero
          generoSeleccionado={generoSeleccionado}
          onCambiarGenero={setGeneroSeleccionado}
        />

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

        <ModalCrearAlbum
          mostrar={mostrarModalCrear}
          onCerrar={() => setMostrarModalCrear(false)}
          onAlbumCreado={manejarAlbumCreado}
        />
      </div>
    </div>
  );
}
