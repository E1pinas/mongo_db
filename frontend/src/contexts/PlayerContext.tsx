import {
  createContext,
  useContext,
  useState,
  useRef,
  useEffect,
  ReactNode,
} from "react";
import type { Cancion, PlayerState } from "../types";

interface PlayerContextType extends PlayerState {
  playSong: (
    song: Cancion,
    context?: { type: "album" | "playlist"; id: string; name: string }
  ) => void;
  addToQueue: (song: Cancion) => void;
  playQueue: (
    songs: Cancion[],
    startIndex?: number,
    context?: { type: "album" | "playlist"; id: string; name: string }
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
    type: "album" | "playlist";
    id: string;
    name: string;
  } | null;
}

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

export function PlayerProvider({ children }: { children: ReactNode }) {
  const [currentSong, setCurrentSong] = useState<Cancion | null>(null);
  const [queue, setQueue] = useState<Cancion[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolumeState] = useState(0.75);
  const [repeat, setRepeat] = useState<"off" | "one" | "all">("off");
  const [shuffle, setShuffle] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentContext, setCurrentContext] = useState<{
    type: "album" | "playlist";
    id: string;
    name: string;
  } | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Refs para tener siempre los valores actuales en los event listeners
  const queueRef = useRef<Cancion[]>([]);
  const currentIndexRef = useRef<number>(0);
  const repeatRef = useRef<"off" | "one" | "all">("off");
  const currentContextRef = useRef<{
    type: "album" | "playlist";
    id: string;
    name: string;
  } | null>(null);

  // Mantener los refs sincronizados con el estado
  useEffect(() => {
    queueRef.current = queue;
  }, [queue]);

  useEffect(() => {
    currentIndexRef.current = currentIndex;
  }, [currentIndex]);

  useEffect(() => {
    repeatRef.current = repeat;
  }, [repeat]);

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
          } else {
            console.warn("⚠️ La canción guardada no tiene audioUrl válida");
          }
        }

        if (parsed.queue && parsed.queue.length > 0) setQueue(parsed.queue);
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
              } else {
                console.warn(
                  "⚠️ La canción guardada no tiene audioUrl, saltando restauración"
                );
              }
            }

            if (parsed.queue) setQueue(parsed.queue);
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
    if (!audioRef.current) return;

    console.log(
      "▶️ Reproduciendo canción:",
      song.titulo,
      "URL:",
      song.audioUrl
    );

    if (!song.audioUrl || song.audioUrl === "") {
      console.error("❌ Error: La canción no tiene URL de audio válida");
      return;
    }

    setCurrentSong(song);
    if (context) {
      setCurrentContext(context);
    }
    audioRef.current.src = song.audioUrl;
    audioRef.current.play().catch((error) => {
      console.error("❌ Error al reproducir:", error);
    });
    setIsPlaying(true);

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
      console.error("❌ playQueue: parámetros inválidos");
      return;
    }

    console.log("🎵 Reproduciendo cola desde índice:", startIndex);
    console.log(
      "📝 Cola:",
      songs.map((s) => s.titulo)
    );
    if (context) {
      console.log("📁 Contexto:", context);
    }

    const songToPlay = songs[startIndex];

    if (!songToPlay.audioUrl || songToPlay.audioUrl === "") {
      console.error("❌ Error: La canción no tiene URL de audio válida");
      return;
    }

    // Actualizar todo el estado de una vez
    setQueue(songs);
    setCurrentIndex(startIndex);
    if (context) {
      setCurrentContext(context);
    }
    setCurrentSong(songToPlay);

    // Reproducir la canción
    audioRef.current.src = songToPlay.audioUrl;
    audioRef.current.play().catch((error) => {
      console.error("❌ Error al reproducir:", error);
    });
    setIsPlaying(true);

    // Contar reproducción después de 30 segundos
    setTimeout(async () => {
      try {
        const { musicService } = await import("../services/music.service");
        await musicService.contarReproduccion(songToPlay._id);
      } catch (error) {
        console.error("Error counting play:", error);
      }
    }, 30000);

    console.log("✅ Cola establecida con", songs.length, "canciones");
  };

  const togglePlay = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
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

      if (newShuffle && queue.length > 0) {
        // Shuffle la cola manteniendo la canción actual
        const currentIndex = queue.findIndex((s) => s._id === currentSong?._id);
        const remaining = queue.filter((_, i) => i !== currentIndex);

        // Fisher-Yates shuffle
        for (let i = remaining.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [remaining[i], remaining[j]] = [remaining[j], remaining[i]];
        }

        const newQueue = currentSong ? [currentSong, ...remaining] : remaining;

        setQueue(newQueue);
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
    setQueue([]);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = "";
    }
    setCurrentSong(null);
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);
  };

  const removeFromQueue = (index: number) => {
    setQueue((prev) => prev.filter((_, i) => i !== index));
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
