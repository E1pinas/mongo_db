import {
  createContext,
  useContext,
  useState,
  useRef,
  useEffect,
  ReactNode,
} from "react";
import type { Cancion, PlayerState } from "../types";
import { useAuth } from "./AuthContext";

interface PlayerContextType extends PlayerState {
  playSong: (
    song: Cancion,
    context?: {
      type: "album" | "playlist" | "profile";
      id: string;
      name: string;
    }
  ) => void;
  addToQueue: (song: Cancion) => void;
  playQueue: (
    songs: Cancion[],
    startIndex?: number,
    context?: {
      type: "album" | "playlist" | "profile";
      id: string;
      name: string;
    }
  ) => void;
  togglePlay: () => void;
  skipNext: () => void;
  skipPrevious: () => void;
  seek: (time: number) => void;
  setVolume: (volume: number) => void;
  toggleShuffle: () => void;
  toggleRepeat: () => void;
  clearQueue: () => void;
  removeFromQueue: (index: number) => void;
  currentContext: {
    type: "album" | "playlist" | "profile";
    id: string;
    name: string;
  } | null;
}

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

export function PlayerProvider({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth();

  console.log("🔄 PlayerProvider renderizando. Usuario:", user);
  console.log("   - esMenorDeEdad:", user?.esMenorDeEdad);

  const [currentSong, setCurrentSong] = useState<Cancion | null>(null);
  const [queue, setQueue] = useState<Cancion[]>([]);
  const [originalQueue, setOriginalQueue] = useState<Cancion[]>([]); // Cola original sin mezclar
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolumeState] = useState(0.75);
  const [repeat, setRepeat] = useState<"off" | "one" | "all">("off");
  const [shuffle, setShuffle] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentContext, setCurrentContext] = useState<{
    type: "album" | "playlist" | "profile";
    id: string;
    name: string;
  } | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [showSuspendedModal, setShowSuspendedModal] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState("");

  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Refs para tener siempre los valores actuales en los event listeners
  const currentSongRef = useRef<Cancion | null>(null);
  const isPlayingRef = useRef<boolean>(false);
  const queueRef = useRef<Cancion[]>([]);
  const originalQueueRef = useRef<Cancion[]>([]);
  const currentIndexRef = useRef<number>(0);
  const repeatRef = useRef<"off" | "one" | "all">("off");
  const shuffleRef = useRef<boolean>(false);
  const currentContextRef = useRef<{
    type: "album" | "playlist";
    id: string;
    name: string;
  } | null>(null);

  // Mantener los refs sincronizados con el estado
  useEffect(() => {
    currentSongRef.current = currentSong;
  }, [currentSong]);

  useEffect(() => {
    isPlayingRef.current = isPlaying;
  }, [isPlaying]);

  useEffect(() => {
    queueRef.current = queue;
  }, [queue]);

  useEffect(() => {
    originalQueueRef.current = originalQueue;
  }, [originalQueue]);

  useEffect(() => {
    currentIndexRef.current = currentIndex;
  }, [currentIndex]);

  useEffect(() => {
    repeatRef.current = repeat;
  }, [repeat]);

  useEffect(() => {
    shuffleRef.current = shuffle;
  }, [shuffle]);

  useEffect(() => {
    currentContextRef.current = currentContext;
  }, [currentContext]);

  // Obtener el ID del usuario actual desde el token
  const getCurrentUserId = (): string | null => {
    const token = localStorage.getItem("token");
    if (!token) return null;

    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      console.log("🔍 Payload del token:", payload);

      // El backend guarda el userId en payload.id
      let userId = payload.id || payload.userId || payload._id || payload.sub;

      // Si es un objeto (como { _id: "123", ... }), extraer el _id
      if (userId && typeof userId === "object") {
        userId = userId._id || userId.id;
      }

      // Asegurarse de que es un string
      const result = userId ? String(userId) : null;
      console.log("🆔 UserId extraído:", result);
      return result;
    } catch (error) {
      console.error("Error extrayendo userId del token:", error);
      return null;
    }
  };

  // Cargar estado inicial del usuario al montar el componente
  useEffect(() => {
    const userId = getCurrentUserId();
    console.log(
      "🔵 Montando PlayerContext. UserId extraído:",
      userId,
      "Tipo:",
      typeof userId
    );
    setCurrentUserId(userId);

    if (!userId) {
      // No hay usuario logueado, estado vacío
      return;
    }

    // Cargar estado específico de este usuario usando su ID
    const savedState = localStorage.getItem(`playerState_${userId}`);
    if (savedState) {
      try {
        const parsed = JSON.parse(savedState);

        console.log(
          "🔄 Restaurando estado del usuario:",
          userId,
          "Estado:",
          parsed
        );

        // Validar que la canción tenga audioUrl antes de restaurarla
        if (parsed.currentSong) {
          if (parsed.currentSong.audioUrl) {
            // Validar si el usuario es menor de edad y la canción es explícita
            if (
              user &&
              user.esMenorDeEdad &&
              parsed.currentSong.esExplicita === true
            ) {
              console.log(
                "🔞 Canción explícita en estado guardado bloqueada para usuario menor de edad"
              );
              // No restaurar esta canción
            } else {
              console.log(
                "✅ Restaurando canción:",
                parsed.currentSong.titulo,
                "URL:",
                parsed.currentSong.audioUrl
              );
              setCurrentSong(parsed.currentSong);

              // Cargar inmediatamente el audio en el reproductor
              if (audioRef.current) {
                audioRef.current.src = parsed.currentSong.audioUrl;
                audioRef.current.load();
                if (parsed.currentTime) {
                  audioRef.current.currentTime = parsed.currentTime;
                }
              }
            }
          } else {
            console.warn("⚠️ La canción guardada no tiene audioUrl válida");
          }
        }

        // Filtrar canciones explícitas de la cola si el usuario es menor de edad
        if (parsed.queue && parsed.queue.length > 0) {
          let queueToRestore = parsed.queue;
          if (user && user.esMenorDeEdad) {
            queueToRestore = parsed.queue.filter(
              (song: Cancion) => !song.esExplicita
            );
            console.log(
              `🔞 ${
                parsed.queue.length - queueToRestore.length
              } canciones explícitas filtradas de la cola restaurada`
            );
          }
          setQueue(queueToRestore);
        }
        if (parsed.currentIndex !== undefined)
          setCurrentIndex(parsed.currentIndex);
        if (parsed.volume !== undefined) setVolumeState(parsed.volume);
        if (parsed.repeat) setRepeat(parsed.repeat);
        if (parsed.shuffle !== undefined) setShuffle(parsed.shuffle);
        if (parsed.currentTime !== undefined)
          setCurrentTime(parsed.currentTime);
        if (parsed.currentContext) setCurrentContext(parsed.currentContext);
      } catch (error) {
        console.error("Error loading player state:", error);
      }
    }
  }, []); // Solo ejecutar al montar

  // Validar contenido explícito y suspensión cuando el usuario cambie
  useEffect(() => {
    if (!user) {
      console.log("⚠️ No hay usuario, saltando validación");
      return;
    }

    console.log("👤 Usuario cambió, validando restricciones");
    console.log("   - esMenorDeEdad:", user.esMenorDeEdad);
    console.log("   - suspendido:", user.suspendido);
    console.log("   - currentSong:", currentSong?.titulo);
    console.log("   - esExplicita:", currentSong?.esExplicita);

    // Si el usuario está suspendido, detener reproducción
    if (user.suspendido && currentSong) {
      console.log("🚫 Usuario suspendido detectado - deteniendo reproducción");

      // Detener y limpiar la canción
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = "";
      }
      setCurrentSong(null);
      setIsPlaying(false);
      setQueue([]);

      // Mostrar modal de suspensión
      setShowSuspendedModal(true);
      return;
    }

    // Si hay una canción reproduciéndose y el usuario es menor de edad
    if (currentSong && user.esMenorDeEdad && currentSong.esExplicita === true) {
      console.log("🔞 Deteniendo canción explícita para usuario menor de edad");

      // Detener y limpiar la canción
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = "";
      }
      setCurrentSong(null);
      setIsPlaying(false);

      setModalMessage(
        "Esta canción es de contenido explícito y no está disponible para menores de edad."
      );
      setShowModal(true);
    }

    // Filtrar canciones explícitas de la cola
    if (queue.length > 0 && user.esMenorDeEdad) {
      const filteredQueue = queue.filter((song) => !song.esExplicita);
      if (filteredQueue.length !== queue.length) {
        console.log(
          `🔞 Filtrando ${
            queue.length - filteredQueue.length
          } canciones explícitas de la cola`
        );
        setQueue(filteredQueue);
      }
    }
  }, [user?.esMenorDeEdad, currentSong]); // Ejecutar cuando cambie el usuario o la canción

  // Detectar cuando se cierra sesión y limpiar estado en memoria
  useEffect(() => {
    const handleLogout = () => {
      console.log("🚪 Logout detectado - limpiando reproductor");

      // Pausar y limpiar audio
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = "";
      }

      // Limpiar TODO el estado en memoria
      setCurrentSong(null);
      setQueue([]);
      setCurrentIndex(0);
      setIsPlaying(false);
      setCurrentTime(0);
      setCurrentContext(null);
      setCurrentUserId(null);

      // NO tocar localStorage - cada usuario mantiene su estado guardado
    };

    window.addEventListener("user-logout", handleLogout);
    return () => window.removeEventListener("user-logout", handleLogout);
  }, []);

  // Detectar cuando cambia de usuario (después de un nuevo login)
  useEffect(() => {
    const handleUserLogin = () => {
      const userId = getCurrentUserId();
      console.log(
        "🔑 Evento user-login detectado. UserId:",
        userId,
        "CurrentUserId:",
        currentUserId
      );

      if (!userId) return; // No hay usuario

      // Si es un usuario diferente al actual (o el primero después de logout)
      if (userId !== currentUserId) {
        console.log("👤 Cargando estado para usuario:", userId);

        // Limpiar reproductor actual
        if (audioRef.current) {
          audioRef.current.pause();
          audioRef.current.src = "";
        }
        setCurrentSong(null);
        setQueue([]);
        setCurrentIndex(0);
        setIsPlaying(false);
        setCurrentTime(0);
        setCurrentContext(null);

        // Cargar estado guardado del usuario
        const savedState = localStorage.getItem(`playerState_${userId}`);
        console.log("💾 Estado guardado encontrado:", savedState ? "Sí" : "No");

        if (savedState) {
          try {
            const parsed = JSON.parse(savedState);
            console.log("📦 Restaurando estado:", parsed);

            // Validar que la canción tenga audioUrl antes de restaurarla
            if (parsed.currentSong) {
              if (parsed.currentSong.audioUrl) {
                // Validar si el usuario es menor de edad y la canción es explícita
                if (
                  user &&
                  user.esMenorDeEdad &&
                  parsed.currentSong.esExplicita
                ) {
                  console.log(
                    "🔞 Canción explícita bloqueada para usuario menor de edad al cambiar de usuario"
                  );
                  // No restaurar esta canción
                } else {
                  console.log(
                    "✅ Canción con audioUrl válida:",
                    parsed.currentSong.audioUrl
                  );
                  setCurrentSong(parsed.currentSong);

                  // Cargar inmediatamente el audio en el reproductor
                  if (audioRef.current) {
                    audioRef.current.src = parsed.currentSong.audioUrl;
                    audioRef.current.load();
                    if (parsed.currentTime) {
                      audioRef.current.currentTime = parsed.currentTime;
                    }
                  }
                }
              } else {
                console.warn(
                  "⚠️ La canción guardada no tiene audioUrl, saltando restauración"
                );
              }
            }

            // Filtrar canciones explícitas de la cola si el usuario es menor de edad
            if (parsed.queue) {
              let queueToRestore = parsed.queue;
              if (user && user.esMenorDeEdad) {
                queueToRestore = parsed.queue.filter(
                  (song: Cancion) => !song.esExplicita
                );
                console.log(
                  `🔞 ${
                    parsed.queue.length - queueToRestore.length
                  } canciones explícitas filtradas al cambiar de usuario`
                );
              }
              setQueue(queueToRestore);
            }
            if (parsed.currentIndex !== undefined)
              setCurrentIndex(parsed.currentIndex);
            if (parsed.volume !== undefined) setVolumeState(parsed.volume);
            if (parsed.repeat) setRepeat(parsed.repeat);
            if (parsed.shuffle !== undefined) setShuffle(parsed.shuffle);
            if (parsed.currentTime !== undefined)
              setCurrentTime(parsed.currentTime);
            if (parsed.currentContext) setCurrentContext(parsed.currentContext);
          } catch (error) {
            console.error("❌ Error cargando estado:", error);
          }
        }

        setCurrentUserId(userId);
      }
    };

    // Escuchar evento de login
    window.addEventListener("user-login", handleUserLogin);

    return () => {
      window.removeEventListener("user-login", handleUserLogin);
    };
  }, [currentUserId]);

  // Guardar estado en localStorage con clave específica del usuario
  useEffect(() => {
    const userId = getCurrentUserId();
    if (!userId) return; // No guardar si no hay usuario

    const stateToSave = {
      currentSong,
      queue,
      currentIndex,
      volume,
      repeat,
      shuffle,
      currentTime,
      currentContext,
    };
    // Guardar con clave única por usuario: playerState_userId
    localStorage.setItem(`playerState_${userId}`, JSON.stringify(stateToSave));
    console.log(
      "💾 Guardando estado para usuario",
      userId,
      "Cola:",
      queue.length,
      "canciones"
    );
  }, [
    currentSong,
    queue,
    currentIndex,
    volume,
    repeat,
    shuffle,
    // NO incluir currentTime aquí - se guarda por separado
    currentContext,
  ]);

  // Guardar currentTime por separado (con menos frecuencia)
  useEffect(() => {
    const userId = getCurrentUserId();
    if (!userId) return;

    const saveTimer = setTimeout(() => {
      const savedState = localStorage.getItem(`playerState_${userId}`);
      if (savedState) {
        try {
          const parsed = JSON.parse(savedState);
          parsed.currentTime = currentTime;
          localStorage.setItem(`playerState_${userId}`, JSON.stringify(parsed));
        } catch (error) {
          console.error("Error updating currentTime:", error);
        }
      }
    }, 1000); // Guardar cada segundo

    return () => clearTimeout(saveTimer);
  }, [currentTime]);

  // Inicializar audio element
  useEffect(() => {
    audioRef.current = new Audio();
    audioRef.current.volume = volume;

    const audio = audioRef.current;

    // Event listeners
    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const handleLoadedMetadata = () => {
      setDuration(audio.duration);

      // Restaurar posición guardada si existe
      const savedState = localStorage.getItem("playerState");
      if (savedState) {
        try {
          const parsed = JSON.parse(savedState);
          if (
            parsed.currentTime &&
            parsed.currentSong?._id === currentSong?._id
          ) {
            audio.currentTime = parsed.currentTime;
          }
        } catch (error) {
          console.error("Error restoring playback position:", error);
        }
      }
    };

    const handleEnded = () => {
      handleSongEnd();
    };

    const handlePlay = () => {
      setIsPlaying(true);
    };

    const handlePause = () => {
      setIsPlaying(false);
    };

    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    audio.addEventListener("ended", handleEnded);
    audio.addEventListener("play", handlePlay);
    audio.addEventListener("pause", handlePause);

    return () => {
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
      audio.removeEventListener("ended", handleEnded);
      audio.removeEventListener("play", handlePlay);
      audio.removeEventListener("pause", handlePause);
      audio.pause();
    };
  }, []);

  // Actualizar volumen
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  // Restaurar última canción al cargar
  useEffect(() => {
    if (currentSong && audioRef.current && !audioRef.current.src) {
      console.log(
        "🎵 Intentando cargar canción:",
        currentSong.titulo,
        "URL:",
        currentSong.audioUrl
      );

      if (!currentSong.audioUrl || currentSong.audioUrl === "") {
        console.error("❌ La canción no tiene audioUrl válida");
        return;
      }

      audioRef.current.src = currentSong.audioUrl;
      // No reproducir automáticamente, solo cargar
      audioRef.current.load();
    }
  }, [currentSong]);

  const playSong = (
    song: Cancion,
    context?: { type: "album" | "playlist"; id: string; name: string }
  ) => {
    if (!audioRef.current) {
      console.error("❌ playSong: No hay audioRef");
      return;
    }

    // Si ya se está reproduciendo la misma canción, pausar/reanudar en lugar de reiniciar
    if (currentSongRef.current?._id === song._id && audioRef.current.src) {
      if (isPlayingRef.current) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        audioRef.current.play();
        setIsPlaying(true);
      }
      return;
    }

    console.log("▶️ playSong llamado:", song.titulo, "URL:", song.audioUrl);

    console.log("👤 Usuario actual completo:", JSON.stringify(user, null, 2));
    console.log("🔞 Es menor de edad?:", user?.esMenorDeEdad);
    console.log("🚫 Usuario suspendido?:", user?.suspendido);
    console.log("🚫 Tiene campo suspendido?:", user && "suspendido" in user);
    console.log("🎵 Canción explícita?:", song.esExplicita);

    // Verificar si la canción está oculta por moderación
    if ((song as any).oculta) {
      console.log("🚫 Canción oculta por moderación");
      setModalMessage(
        `Esta canción ha sido ocultada por el equipo de moderación y no está disponible.\n\nRazón: ${
          (song as any).razonOculta || "Violación de normas comunitarias"
        }`
      );
      setShowModal(true);
      return;
    }

    // Verificar si el usuario está suspendido
    if (user && user.suspendido === true) {
      console.log("🚫 Usuario suspendido, no puede reproducir música");
      setShowSuspendedModal(true);
      return;
    } else if (user) {
      console.log(
        "✅ Usuario existe pero NO está suspendido, campo suspendido =",
        user.suspendido
      );
    } else {
      console.log("⚠️ No hay usuario en el contexto");
    }

    // Verificar si el usuario es menor de edad y la canción es explícita
    if (user && user.esMenorDeEdad && song.esExplicita === true) {
      console.log("🔞 Canción explícita bloqueada para usuario menor de edad");
      setModalMessage(
        "Este contenido es explícito y no está disponible para menores de edad."
      );
      setShowModal(true);
      return;
    }

    if (!song.audioUrl || song.audioUrl === "") {
      console.error("❌ Error: La canción no tiene URL de audio válida");
      setModalMessage("Esta canción no tiene un archivo de audio válido.");
      setShowModal(true);
      return;
    }

    setCurrentSong(song);
    if (context) {
      setCurrentContext(context);
    }

    // Si no hay cola o la canción no está en la cola, crear una cola nueva
    const songInQueue = queueRef.current.findIndex((s) => s._id === song._id);
    if (queueRef.current.length === 0 || songInQueue === -1) {
      setQueue([song]);
      setOriginalQueue([song]);
      setCurrentIndex(0);
    } else {
      // La canción ya está en la cola, solo actualizar el índice
      setCurrentIndex(songInQueue);
    }

    console.log("🎵 Configurando audio src:", song.audioUrl);
    audioRef.current.src = song.audioUrl;

    console.log("▶️ Intentando reproducir...");
    audioRef.current
      .play()
      .then(() => {
        console.log("✅ Reproducción iniciada exitosamente");
        setIsPlaying(true);
      })
      .catch((error) => {
        console.error("❌ Error al reproducir:", error);
        setModalMessage("Error al reproducir la canción: " + error.message);
        setShowModal(true);
      });

    // Contar reproducción después de 30 segundos
    setTimeout(async () => {
      try {
        const { musicService } = await import("../services/music.service");
        await musicService.contarReproduccion(song._id);
      } catch (error) {
        console.error("Error counting play:", error);
      }
    }, 30000); // 30 segundos
  };

  const addToQueue = (song: Cancion) => {
    setQueue((prev) => [...prev, song]);
  };

  const playQueue = (
    songs: Cancion[],
    startIndex = 0,
    context?: { type: "album" | "playlist"; id: string; name: string }
  ) => {
    if (
      !audioRef.current ||
      !songs ||
      songs.length === 0 ||
      startIndex >= songs.length
    ) {
      console.log("❌ playQueue: parámetros inválidos");
      return;
    }

    // Verificar si el usuario está suspendido
    if (user?.suspendido) {
      console.log("🚫 Usuario suspendido, no puede reproducir música");
      setShowSuspendedModal(true);
      return;
    }

    // Guardar la canción que el usuario intentó reproducir
    const originalSelectedSong = songs[startIndex];

    // Filtrar canciones ocultas por moderación
    let filteredSongs = songs.filter((song) => !(song as any).oculta);
    if (filteredSongs.length < songs.length) {
      console.log(
        `🚫 ${songs.length - filteredSongs.length} canciones ocultas filtradas`
      );
      if (filteredSongs.length === 0) {
        setModalMessage(
          "Todas las canciones de esta lista están ocultas por moderación"
        );
        setShowModal(true);
        return;
      }
    }

    let adjustedStartIndex = startIndex;

    // Si la canción seleccionada estaba oculta, mostrar modal y no reproducir
    if ((originalSelectedSong as any)?.oculta) {
      console.log("🚫 Canción seleccionada está oculta");
      setModalMessage(
        `Esta canción ha sido ocultada por el equipo de moderación y no está disponible.\n\nRazón: ${
          (originalSelectedSong as any).razonOculta ||
          "Violación de normas comunitarias"
        }`
      );
      setShowModal(true);
      return;
    }

    // Ajustar el índice si hubo canciones ocultas antes de la seleccionada
    if (originalSelectedSong) {
      adjustedStartIndex = filteredSongs.findIndex(
        (song) => song._id === originalSelectedSong._id
      );
      if (adjustedStartIndex === -1) {
        adjustedStartIndex = 0;
      }
    }

    // Filtrar canciones explícitas si el usuario es menor de edad
    if (user && user.esMenorDeEdad) {
      console.log(
        "🔞 Usuario menor de edad detectado - filtrando canciones explícitas"
      );
      console.log("👤 Usuario:", user);
      console.log("📋 Canciones antes de filtrar:", filteredSongs.length);
      console.log("📍 Índice original:", startIndex);
      console.log(
        "🎵 Canción seleccionada:",
        filteredSongs[startIndex]?.titulo
      );

      // Guardar la canción que el usuario quería reproducir
      const selectedSong = filteredSongs[startIndex];

      filteredSongs = filteredSongs.filter((song) => song.esExplicita !== true);

      console.log(
        `🔞 ${
          songs.length - filteredSongs.length
        } canciones explícitas filtradas`
      );
      console.log("📋 Canciones después de filtrar:", filteredSongs.length);

      // Si la canción seleccionada era explícita, buscar la primera canción no explícita
      if (selectedSong && selectedSong.esExplicita === true) {
        console.log(
          "⚠️ La canción seleccionada era explícita, usando primera canción segura"
        );
        adjustedStartIndex = 0;
        if (filteredSongs.length === 0) {
          console.log(
            "⚠️ Todas las canciones son explícitas - no se puede reproducir"
          );
          setModalMessage(
            "Este contenido es explícito y no está disponible para menores de edad."
          );
          setShowModal(true);
          return;
        }
      } else {
        // La canción seleccionada NO es explícita, encontrar su nuevo índice en el array filtrado
        adjustedStartIndex = filteredSongs.findIndex(
          (song) => song._id === selectedSong?._id
        );
        if (adjustedStartIndex === -1) {
          adjustedStartIndex = 0;
        }
        console.log(
          "✅ Canción segura encontrada en nuevo índice:",
          adjustedStartIndex
        );
      }
    }

    console.log("🎵 Reproduciendo cola desde índice:", adjustedStartIndex);
    console.log(
      "📝 Cola:",
      filteredSongs.map((s) => s.titulo)
    );
    if (context) {
      console.log("📁 Contexto:", context);
    }

    const songToPlay = filteredSongs[adjustedStartIndex];

    if (!songToPlay) {
      console.error(
        "❌ Error: No se encontró la canción en el índice",
        startIndex
      );
      return;
    }

    if (!songToPlay.audioUrl || songToPlay.audioUrl === "") {
      console.error("❌ Error: La canción no tiene URL de audio válida");
      setModalMessage("Esta canción no tiene un archivo de audio válido.");
      setShowModal(true);
      return;
    }

    // Guardar cola original
    setOriginalQueue(filteredSongs);

    // Si shuffle está activo, mezclar la cola
    let queueToUse = filteredSongs;
    let indexToUse = adjustedStartIndex;

    if (shuffleRef.current) {
      // Crear nueva cola mezclada manteniendo la canción actual primero
      const currentSong = filteredSongs[adjustedStartIndex];
      const otherSongs = filteredSongs.filter(
        (_, i) => i !== adjustedStartIndex
      );

      // Fisher-Yates shuffle
      for (let i = otherSongs.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [otherSongs[i], otherSongs[j]] = [otherSongs[j], otherSongs[i]];
      }

      queueToUse = [currentSong, ...otherSongs];
      indexToUse = 0; // La canción actual siempre estará en posición 0
    }

    // Actualizar todo el estado de una vez
    setQueue(queueToUse);
    setCurrentIndex(indexToUse);
    if (context) {
      setCurrentContext(context);
    }
    setCurrentSong(songToPlay);

    // Reproducir la canción
    console.log("🎵 Configurando audio src:", songToPlay.audioUrl);
    audioRef.current.src = songToPlay.audioUrl;

    console.log("▶️ Intentando reproducir...");
    audioRef.current
      .play()
      .then(() => {
        console.log("✅ Reproducción iniciada exitosamente");
        setIsPlaying(true);
      })
      .catch((error) => {
        console.error("❌ Error al reproducir:", error);
        setModalMessage("Error al reproducir la canción: " + error.message);
        setShowModal(true);
      });

    // Contar reproducción después de 30 segundos
    setTimeout(async () => {
      try {
        const { musicService } = await import("../services/music.service");
        await musicService.contarReproduccion(songToPlay._id);
      } catch (error) {
        console.error("Error counting play:", error);
      }
    }, 30000);

    console.log("✅ Cola establecida con", queueToUse.length, "canciones");
  };

  const togglePlay = () => {
    if (!audioRef.current) {
      console.error("❌ togglePlay: No hay audioRef");
      return;
    }

    console.log("🎵 togglePlay llamado - isPlaying:", isPlaying);

    if (isPlaying) {
      console.log("⏸️ Pausando...");
      audioRef.current.pause();
    } else {
      console.log("▶️ Reproduciendo...");
      audioRef.current.play().catch((error) => {
        console.error("❌ Error al reproducir en togglePlay:", error);
      });
    }
  };

  const skipNext = () => {
    console.log("⏭️ skipNext llamado");
    console.log("   Cola length (ref):", queueRef.current.length);
    console.log("   currentIndex (ref):", currentIndexRef.current);
    console.log("   repeat (ref):", repeatRef.current);

    if (!audioRef.current) {
      console.log("   ❌ No hay audioRef");
      return;
    }

    if (queueRef.current.length === 0) {
      console.log("   ❌ Cola vacía, no se puede avanzar");
      return;
    }

    if (repeatRef.current === "one") {
      // Repetir canción actual
      console.log("   🔁 Repitiendo canción actual");
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play();
      }
      return;
    }

    let nextIndex = currentIndexRef.current + 1;
    console.log("   Próximo índice:", nextIndex);

    if (nextIndex >= queueRef.current.length) {
      console.log("   Fin de cola alcanzado");
      if (repeatRef.current === "all") {
        console.log("   🔁 Repeat all activo, volviendo al inicio");
        nextIndex = 0;
      } else {
        console.log("   ⏸️ Fin de la cola, pausando");
        setIsPlaying(false);
        return;
      }
    }

    // Mantener el contexto al reproducir la siguiente canción
    const nextSong = queueRef.current[nextIndex];
    console.log("   ✅ Reproduciendo siguiente:", nextSong?.titulo);
    console.log("   📍 Contexto:", currentContextRef.current);

    if (nextSong && nextSong.audioUrl) {
      // Si la canción está oculta por moderación, saltarla automáticamente
      if ((nextSong as any).oculta) {
        console.log("🚫 Canción oculta detectada - saltando automáticamente");
        // Buscar la siguiente canción no oculta
        let validNextIndex = nextIndex + 1;
        while (validNextIndex < queueRef.current.length) {
          const validSong = queueRef.current[validNextIndex];
          if (validSong && !(validSong as any).oculta) {
            console.log("   ✅ Canción válida encontrada:", validSong.titulo);
            setCurrentIndex(validNextIndex);
            setCurrentSong(validSong);
            audioRef.current.src = validSong.audioUrl;
            audioRef.current.play().catch((error) => {
              console.error("❌ Error al reproducir:", error);
            });
            setIsPlaying(true);
            return;
          }
          validNextIndex++;
        }
        // No hay más canciones válidas, mostrar mensaje y pausar
        console.log("⚠️ Todas las canciones restantes están ocultas");
        setModalMessage(
          "Todas las canciones de esta lista están ocultas por moderación"
        );
        setShowModal(true);
        setIsPlaying(false);
        return;
      }

      // Si el usuario es menor de edad y la canción es explícita, saltarla
      if (user && user.esMenorDeEdad && nextSong.esExplicita === true) {
        console.log(
          "🔞 Canción explícita detectada - saltando para usuario menor de edad"
        );
        // Buscar la siguiente canción no explícita
        let safeNextIndex = nextIndex + 1;
        while (safeNextIndex < queueRef.current.length) {
          const safeSong = queueRef.current[safeNextIndex];
          if (safeSong && !safeSong.esExplicita) {
            console.log("   ✅ Canción segura encontrada:", safeSong.titulo);
            setCurrentIndex(safeNextIndex);
            setCurrentSong(safeSong);
            audioRef.current.src = safeSong.audioUrl;
            audioRef.current.play().catch((error) => {
              console.error("❌ Error al reproducir:", error);
            });
            setIsPlaying(true);
            return;
          }
          safeNextIndex++;
        }
        // No hay más canciones seguras, pausar
        console.log("⚠️ No hay más canciones no explícitas disponibles");
        setIsPlaying(false);
        return;
      }

      // Actualizar índice y canción actual
      setCurrentIndex(nextIndex);
      setCurrentSong(nextSong);

      // Reproducir
      audioRef.current.src = nextSong.audioUrl;
      audioRef.current.play().catch((error) => {
        console.error("❌ Error al reproducir:", error);
      });
      setIsPlaying(true);

      // Contar reproducción después de 30 segundos
      setTimeout(async () => {
        try {
          const { musicService } = await import("../services/music.service");
          await musicService.contarReproduccion(nextSong._id);
        } catch (error) {
          console.error("Error counting play:", error);
        }
      }, 30000);
    } else {
      console.error(
        "   ❌ La siguiente canción es null/undefined o no tiene audioUrl"
      );
    }
  };

  const skipPrevious = () => {
    if (!audioRef.current) return;

    // Si llevamos más de 3 segundos, reiniciar canción
    if (currentTime > 3) {
      audioRef.current.currentTime = 0;
      return;
    }

    if (queueRef.current.length === 0) return;

    let prevIndex = currentIndexRef.current - 1;

    if (prevIndex < 0) {
      if (repeatRef.current === "all") {
        prevIndex = queueRef.current.length - 1;
      } else {
        // Reiniciar canción actual
        audioRef.current.currentTime = 0;
        return;
      }
    }

    const prevSong = queueRef.current[prevIndex];

    if (prevSong && prevSong.audioUrl) {
      // Actualizar índice y canción actual
      setCurrentIndex(prevIndex);
      setCurrentSong(prevSong);

      // Reproducir
      audioRef.current.src = prevSong.audioUrl;
      audioRef.current.play().catch((error) => {
        console.error("❌ Error al reproducir:", error);
      });
      setIsPlaying(true);

      // Contar reproducción después de 30 segundos
      setTimeout(async () => {
        try {
          const { musicService } = await import("../services/music.service");
          await musicService.contarReproduccion(prevSong._id);
        } catch (error) {
          console.error("Error counting play:", error);
        }
      }, 30000);
    }
  };

  const handleSongEnd = () => {
    console.log("🎵 Canción terminada, llamando a skipNext()");
    console.log("📋 Cola actual (ref):", queueRef.current.length, "canciones");
    console.log("🔁 Repeat mode (ref):", repeatRef.current);
    skipNext();
  };

  const seek = (time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const setVolume = (newVolume: number) => {
    setVolumeState(Math.max(0, Math.min(1, newVolume)));
  };

  const toggleShuffle = () => {
    setShuffle((prev) => {
      const newShuffle = !prev;
      console.log("🔀 Toggle shuffle:", prev, "→", newShuffle);

      if (newShuffle && queueRef.current.length > 0) {
        // Activar shuffle: mezclar la cola
        const currentSongIndex = currentIndexRef.current;
        const currentSongInQueue = queueRef.current[currentSongIndex];

        // Usar la cola original si existe, si no usar la cola actual
        const baseQueue =
          originalQueueRef.current.length > 0
            ? originalQueueRef.current
            : queueRef.current;

        // Guardar cola original si no existe
        if (originalQueueRef.current.length === 0) {
          setOriginalQueue(baseQueue);
        }

        // Crear nueva cola mezclada
        const otherSongs = baseQueue.filter(
          (s) => s._id !== currentSongInQueue?._id
        );

        // Fisher-Yates shuffle
        for (let i = otherSongs.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [otherSongs[i], otherSongs[j]] = [otherSongs[j], otherSongs[i]];
        }

        const newQueue = currentSongInQueue
          ? [currentSongInQueue, ...otherSongs]
          : otherSongs;

        setQueue(newQueue);
        setCurrentIndex(0); // La canción actual está en posición 0
        console.log("✅ Cola mezclada");
      } else if (!newShuffle && originalQueueRef.current.length > 0) {
        // Desactivar shuffle: restaurar cola original
        const currentSongInQueue = queueRef.current[currentIndexRef.current];

        // Encontrar el índice de la canción actual en la cola original
        const originalIndex = originalQueueRef.current.findIndex(
          (s) => s._id === currentSongInQueue?._id
        );

        setQueue(originalQueueRef.current);
        setCurrentIndex(originalIndex >= 0 ? originalIndex : 0);
        console.log("✅ Cola restaurada al orden original");
      }

      return newShuffle;
    });
  };

  const toggleRepeat = () => {
    setRepeat((prev) => {
      if (prev === "off") return "all";
      if (prev === "all") return "one";
      return "off";
    });
  };

  const clearQueue = () => {
    // Solo limpiar las canciones después de la actual
    const currentSongInQueue = currentSong;
    if (currentSongInQueue) {
      setQueue([currentSongInQueue]);
      setOriginalQueue([currentSongInQueue]);
      setCurrentIndex(0);
    } else {
      // Si no hay canción actual, limpiar todo
      setQueue([]);
      setOriginalQueue([]);
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = "";
      }
      setCurrentSong(null);
      setIsPlaying(false);
      setCurrentTime(0);
      setDuration(0);
      setCurrentIndex(0);
      setShuffle(false);
      setRepeat("off");
    }
  };

  const removeFromQueue = (index: number) => {
    const songToRemove = queueRef.current[index];

    // Remover de la cola actual
    setQueue((prev) => prev.filter((_, i) => i !== index));

    // Si hay cola original, también remover de ahí
    if (originalQueueRef.current.length > 0 && songToRemove) {
      setOriginalQueue((prev) =>
        prev.filter((s) => s._id !== songToRemove._id)
      );
    }

    // Ajustar el índice actual si es necesario
    if (index < currentIndexRef.current) {
      setCurrentIndex((prev) => Math.max(0, prev - 1));
    } else if (
      index === currentIndexRef.current &&
      queueRef.current.length > 1
    ) {
      // Si se elimina la canción actual, no cambiar el índice
      // skipNext() se encargará de reproducir la siguiente
    }
  };

  return (
    <PlayerContext.Provider
      value={{
        currentSong,
        queue,
        isPlaying,
        currentTime,
        duration,
        volume,
        repeat,
        shuffle,
        currentContext,
        playSong,
        addToQueue,
        playQueue,
        togglePlay,
        skipNext,
        skipPrevious,
        seek,
        setVolume,
        toggleShuffle,
        toggleRepeat,
        clearQueue,
        removeFromQueue,
      }}
    >
      {children}

      {/* Modal de cuenta suspendida */}
      {showSuspendedModal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-lg max-w-md w-full p-6 shadow-2xl border border-gray-700">
            <div className="flex items-start gap-4 mb-4">
              <div className="bg-yellow-600/20 p-3 rounded-full">
                <svg
                  className="w-6 h-6 text-yellow-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
                  />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-white mb-2">
                  Tu cuenta está suspendida
                </h3>
                <p className="text-gray-300 mb-3">
                  No puedes reproducir música mientras tu cuenta esté
                  suspendida.
                </p>
                <div className="bg-gray-900 rounded-lg p-3 border border-gray-700">
                  <p className="text-sm text-gray-400 mb-1">
                    Razón de la suspensión:
                  </p>
                  <p className="text-yellow-400 font-medium">
                    {user?.razonSuspension ||
                      "Violación de normas comunitarias"}
                  </p>
                  {user?.suspendidoHasta && (
                    <p className="text-sm text-gray-400 mt-2">
                      Expira:{" "}
                      {new Date(user.suspendidoHasta).toLocaleDateString(
                        "es-ES",
                        {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        }
                      )}
                    </p>
                  )}
                </div>
              </div>
            </div>
            <button
              onClick={async () => {
                setShowSuspendedModal(false);
                await logout();
                window.location.href = "/";
              }}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 px-4 rounded-lg transition-colors"
            >
              Cerrar sesión
            </button>
          </div>
        </div>
      )}

      {/* Modal genérico para canciones ocultas */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full border-2 border-yellow-600">
            <div className="flex items-start gap-4 mb-4">
              <div className="w-12 h-12 bg-yellow-600 rounded-full flex items-center justify-center flex-shrink-0">
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-white mb-2">
                  Canción no disponible
                </h3>
                <p className="text-gray-300 whitespace-pre-line">
                  {modalMessage}
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowModal(false)}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 px-4 rounded-lg transition-colors"
            >
              Aceptar
            </button>
          </div>
        </div>
      )}
    </PlayerContext.Provider>
  );
}

export function usePlayer() {
  const context = useContext(PlayerContext);
  if (context === undefined) {
    throw new Error("usePlayer must be used within a PlayerProvider");
  }
  return context;
}
