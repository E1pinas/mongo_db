import type { DatosAlbum } from "../tipos";

interface CamposBasicosProps {
  datos: DatosAlbum;
  alCambiar: <K extends keyof DatosAlbum>(
    campo: K,
    valor: DatosAlbum[K]
  ) => void;
}

export const CamposBasicos = ({ datos, alCambiar }: CamposBasicosProps) => {
  return (
    <>
      {/* Título */}
      <div>
        <label className="block text-sm font-semibold mb-2">
          Título del álbum *
        </label>
        <input
          type="text"
          value={datos.titulo}
          onChange={(e) => alCambiar("titulo", e.target.value)}
          placeholder="Nombre del álbum"
          className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg focus:outline-none focus:border-blue-500 transition-colors"
          required
        />
      </div>

      {/* Descripción */}
      <div>
        <label className="block text-sm font-semibold mb-2">Descripción</label>
        <textarea
          value={datos.descripcion}
          onChange={(e) => alCambiar("descripcion", e.target.value)}
          placeholder="Describe tu álbum..."
          rows={4}
          className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg focus:outline-none focus:border-blue-500 transition-colors resize-none"
        />
      </div>

      {/* Fecha de lanzamiento */}
      <div>
        <label className="block text-sm font-semibold mb-2">
          Fecha de lanzamiento
        </label>
        <input
          type="date"
          value={datos.fechaLanzamiento}
          onChange={(e) => alCambiar("fechaLanzamiento", e.target.value)}
          className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg focus:outline-none focus:border-blue-500 transition-colors"
        />
      </div>
    </>
  );
};
