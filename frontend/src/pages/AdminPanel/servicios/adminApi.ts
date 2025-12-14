const API_URL = "http://localhost:3900/api";

const obtenerToken = () => localStorage.getItem("token");

const crearHeaders = (conToken = true) => {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };
  if (conToken) {
    const token = obtenerToken();
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
  }
  return headers;
};

export const servicioAdmin = {
  // Dashboard
  obtenerEstadisticas: async () => {
    const response = await fetch(`${API_URL}/admin/dashboard`, {
      headers: crearHeaders(),
    });
    if (!response.ok) throw new Error("Error al cargar estadísticas");
    return response.json();
  },

  // Reportes
  obtenerReportes: async (estado: string) => {
    const response = await fetch(`${API_URL}/admin/reportes?estado=${estado}`, {
      headers: crearHeaders(),
    });
    if (!response.ok) throw new Error("Error al cargar reportes");
    return response.json();
  },

  resolverReporte: async (
    reporteId: string,
    accion: string,
    comentarioResolucion: string
  ) => {
    const response = await fetch(
      `${API_URL}/admin/reportes/${reporteId}/resolver`,
      {
        method: "PUT",
        headers: crearHeaders(),
        body: JSON.stringify({ accion, comentarioResolucion }),
      }
    );
    if (!response.ok) throw new Error("Error al resolver reporte");
    return response.json();
  },

  cambiarEstadoReporte: async (reporteId: string, estado: string) => {
    const response = await fetch(
      `${API_URL}/admin/reportes/${reporteId}/estado`,
      {
        method: "PUT",
        headers: crearHeaders(),
        body: JSON.stringify({ estado }),
      }
    );
    if (!response.ok) throw new Error("Error al cambiar estado");
    return response.json();
  },

  cambiarPrioridadReporte: async (reporteId: string, prioridad: string) => {
    const response = await fetch(
      `${API_URL}/moderacion/reportes/${reporteId}/prioridad`,
      {
        method: "PUT",
        headers: crearHeaders(),
        body: JSON.stringify({ prioridad }),
      }
    );
    if (!response.ok) throw new Error("Error al cambiar prioridad");
    return response.json();
  },

  // Usuarios
  buscarUsuarios: async (
    termino: string,
    filtroEstado: string,
    pais?: string
  ) => {
    let url = `${API_URL}/admin/usuarios/buscar?q=${encodeURIComponent(
      termino
    )}&estado=${filtroEstado}`;
    if (pais) url += `&pais=${pais}`;

    const response = await fetch(url, { headers: crearHeaders() });
    if (!response.ok) throw new Error("Error al buscar usuarios");
    return response.json();
  },

  suspenderUsuario: async (
    usuarioId: string,
    motivo: string,
    duracionDias: number
  ) => {
    const response = await fetch(
      `${API_URL}/admin/usuarios/${usuarioId}/suspender`,
      {
        method: "PUT",
        headers: crearHeaders(),
        body: JSON.stringify({ motivo, duracionDias }),
      }
    );
    if (!response.ok) throw new Error("Error al suspender usuario");
    return response.json();
  },

  levantarSuspension: async (usuarioId: string) => {
    const response = await fetch(
      `${API_URL}/admin/usuarios/${usuarioId}/levantar-suspension`,
      {
        method: "PUT",
        headers: crearHeaders(),
      }
    );
    if (!response.ok) throw new Error("Error al levantar suspensión");
    return response.json();
  },

  obtenerHistorialConducta: async (usuarioId: string) => {
    const response = await fetch(
      `${API_URL}/admin/usuarios/${usuarioId}/historial-conducta`,
      { headers: crearHeaders() }
    );
    if (!response.ok) throw new Error("Error al cargar historial");
    return response.json();
  },

  // Contenido
  buscarContenido: async (termino: string, tipo: string) => {
    const response = await fetch(
      `${API_URL}/admin/contenido/buscar?q=${encodeURIComponent(
        termino
      )}&tipo=${tipo}`,
      { headers: crearHeaders() }
    );
    if (!response.ok) throw new Error("Error al buscar contenido");
    return response.json();
  },

  ocultarCancion: async (cancionId: string, razon: string) => {
    const response = await fetch(
      `${API_URL}/moderacion/canciones/${cancionId}/ocultar`,
      {
        method: "PUT",
        headers: crearHeaders(),
        body: JSON.stringify({ razon }),
      }
    );
    if (!response.ok) throw new Error("Error al ocultar canción");
    return response.json();
  },

  mostrarCancion: async (cancionId: string) => {
    const response = await fetch(
      `${API_URL}/moderacion/canciones/${cancionId}/mostrar`,
      {
        method: "PUT",
        headers: crearHeaders(),
      }
    );
    if (!response.ok) throw new Error("Error al mostrar canción");
    return response.json();
  },

  eliminarContenido: async (contenidoId: string, tipo: string) => {
    let endpoint = "";
    if (tipo === "cancion") {
      endpoint = `${API_URL}/moderacion/canciones/${contenidoId}`;
    } else if (tipo === "album") {
      endpoint = `${API_URL}/moderacion/albumes/${contenidoId}`;
    } else if (tipo === "playlist") {
      endpoint = `${API_URL}/moderacion/playlists/${contenidoId}`;
    }

    const response = await fetch(endpoint, {
      method: "DELETE",
      headers: crearHeaders(),
    });
    if (!response.ok) throw new Error("Error al eliminar contenido");
    return response.json();
  },

  // Administradores
  obtenerAdministradores: async () => {
    const response = await fetch(`${API_URL}/admin/administradores`, {
      headers: crearHeaders(),
    });
    if (!response.ok) throw new Error("Error al cargar administradores");
    return response.json();
  },

  crearAdministrador: async (datosAdmin: {
    nombre: string;
    apellidos: string;
    email: string;
    password: string;
    nick: string;
  }) => {
    const response = await fetch(`${API_URL}/admin/administradores`, {
      method: "POST",
      headers: crearHeaders(),
      body: JSON.stringify(datosAdmin),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Error al crear administrador");
    }
    return response.json();
  },

  eliminarAdministrador: async (adminId: string) => {
    const response = await fetch(
      `${API_URL}/admin/administradores/${adminId}`,
      {
        method: "DELETE",
        headers: crearHeaders(),
      }
    );
    if (!response.ok) throw new Error("Error al eliminar administrador");
    return response.json();
  },
};
