import { Schema, model } from "mongoose";

const seguidorSchema = new Schema(
  {
    seguidor: {
      type: Schema.Types.ObjectId,
      ref: "Usuario",
      required: true,
    },
    seguido: {
      type: Schema.Types.ObjectId,
      ref: "Usuario",
      required: true,
    },
  },
  { timestamps: true }
);

// Un usuario no puede seguir al mismo usuario dos veces
seguidorSchema.index({ seguidor: 1, seguido: 1 }, { unique: true });

export const Seguidor = model("Seguidor", seguidorSchema);
