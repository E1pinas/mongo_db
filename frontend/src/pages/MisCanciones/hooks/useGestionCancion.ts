import { useState } from "react";
import { musicService } from "../../../services/music.service";
import type { Cancion } from "../../../types";

export const useGestionCancion = (
  setCanciones: React.Dispatch<React.SetStateAction<Cancion[]>>
) => {
  const [editingCancion, setEditingCancion] = useState<Cancion | null>(null);
  const [deletingCancion, setDeletingCancion] = useState<Cancion | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const manejarEditarCancion = async (data: {
    titulo: string;
    generos: string[];
    esPrivada: boolean;
    esExplicita: boolean;
  }) => {
    if (!editingCancion) return;

    try {
      const updated = await musicService.updateSong(editingCancion._id, data);
      setCanciones((prev) =>
        prev.map((c) => (c._id === updated._id ? updated : c))
      );
      setEditingCancion(null);
    } catch (err: any) {
      console.error("Error updating song:", err);
      throw err;
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingCancion) return;

    try {
      setIsDeleting(true);
      await musicService.deleteSong(deletingCancion._id);
      setCanciones((prev) => prev.filter((c) => c._id !== deletingCancion._id));
      setDeletingCancion(null);
    } catch (err: any) {
      console.error("Error deleting song:", err);
      throw err;
    } finally {
      setIsDeleting(false);
    }
  };

  return {
    editingCancion,
    setEditingCancion,
    deletingCancion,
    setDeletingCancion,
    isDeleting,
    manejarEditarCancion,
    handleConfirmDelete,
  };
};
