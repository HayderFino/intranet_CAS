const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["superadmin", "admin", "prensa"],
      default: "admin",
    },
    displayName: {
      type: String,
      required: true,
    },
    permissions: {
      // General
      banner: { type: Boolean, default: false },
      eventos: { type: Boolean, default: false },
      correos: { type: Boolean, default: false },
      informe_gestion: { type: Boolean, default: false },

      // NotiCAS
      news: { type: Boolean, default: false },
      agenda_cas: { type: Boolean, default: false },

      // SGI
      sgi_planeacion: { type: Boolean, default: false },
      sgi_mejora: { type: Boolean, default: false },
      sgi_recursos: { type: Boolean, default: false },
      sgi_ambiental: { type: Boolean, default: false },
      sgi_vigilancia: { type: Boolean, default: false },
      sgi_control: { type: Boolean, default: false },
      sgi_manuales: { type: Boolean, default: false },

      // Herramientas
      respel: { type: Boolean, default: false },
      rua: { type: Boolean, default: false },
      boletines_git: { type: Boolean, default: false },
      pcb: { type: Boolean, default: false },

      // GIT
      cita: { type: Boolean, default: false },
      sirh: { type: Boolean, default: false },
      revision_red: { type: Boolean, default: false },
      snif: { type: Boolean, default: false },

      // Seguridad
      users: { type: Boolean, default: false },

      // Talento Humano
      manual_funciones: { type: Boolean, default: false },
      sigep: { type: Boolean, default: false },
      planes_talento: { type: Boolean, default: false },
      convocatorias: { type: Boolean, default: false },
      estudios_tecnicos: { type: Boolean, default: false },
      provision_empleos: { type: Boolean, default: false },
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("User", userSchema);
