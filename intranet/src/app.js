const express = require("express");
const path = require("path");
const cors = require("cors");
const session = require("express-session");

// Custom modules
const setupFsCache = require("./middlewares/fsCache");
const { checkAuth, superadminOnly } = require("./middlewares/authMiddleware");
const connectDB = require("./config/db");

// Activar la caché in-memory del FileSystem para DB HTML locales
setupFsCache();

// Conectar a MongoDB
if (process.env.NODE_ENV !== "test") {
  connectDB();
}

const app = express();

// --- CONFIGURACIÓN PRINCIPAL ---

// 1. Sesiones
app.use(
  session({
    secret: "intranet_cas_secret_key_2024",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false, // true solo si usas HTTPS
      maxAge: 24 * 60 * 60 * 1000, // 24 horas
    },
  })
);

// 2. CORS
const whitelist = [
  "http://localhost:3000",
  "http://127.0.0.1:3000",
  "http://localhost",
  "http://127.0.0.1",
];
const corsOptions = {
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (
      whitelist.indexOf(origin) !== -1 ||
      origin.includes("ngrok") ||
      origin.includes("localtunnel")
    ) {
      callback(null, true);
    } else {
      callback(new Error("No permitido por CORS"));
    }
  },
  credentials: true,
};
app.use(cors(corsOptions));

// 3. Body Parsing
app.use(express.json());

// 4. Archivos Estáticos
const rootDir = process.cwd(); // Garantiza resolución estricta si arranca desde la carpeta raíz.
app.use(express.static(rootDir));
app.use("/data", express.static(path.join(rootDir, "data")));

// --- RUTAS API ---

// Muro de seguridad e invalidación para cualquier modificación a /api/*
app.use("/api", checkAuth);

app.get("/api/test-server", (req, res) =>
  res.json({ status: "ok", time: new Date() })
);

app.use("/api/informe-gestion", require("./routes/informeGestionRoutes"));
app.use("/api/news", require("./routes/newsRoutes"));
app.use("/api/agenda", require("./routes/agendaRoutes"));
app.use("/api/politicas-sgi", require("./routes/sgiPoliticasRoutes"));
app.use("/api/sgi", require("./routes/sgiRoutes"));
app.use("/api/respel", require("./routes/respelRoutes"));
app.use("/api/rua", require("./routes/ruaRoutes"));
app.use("/api/boletines", require("./routes/boletinesRoutes"));
app.use("/api/pcb", require("./routes/pcbRoutes"));
app.use("/api/manuales-sgi", require("./routes/manualesRoutes"));
app.use("/api/cita", require("./routes/citaRoutes"));
app.use("/api/sirh", require("./routes/sirhRoutes"));
app.use("/api/revision-red", require("./routes/revisionRedRoutes"));
app.use("/api/snif", require("./routes/snifRoutes"));
app.use("/api/manual-funciones", require("./routes/manualFuncionesRoutes"));
app.use("/api/plan-monitoreo", require("./routes/planMonitoreoRoutes"));
app.use("/api/planes-talento", require("./routes/planesTalentoRoutes"));
app.use("/api/convocatorias", require("./routes/convocatoriasRoutes"));
app.use("/api/estudios-tecnicos", require("./routes/estudiosTecnicosRoutes"));
app.use("/api/provision-empleos", require("./routes/provisionEmpleosRoutes"));
app.use("/api/banner", require("./routes/bannerRoutes"));
app.use("/api/eventos", require("./routes/eventosRoutes"));
app.use("/api/directorio", require("./routes/directorioRoutes"));
app.use("/api/search", require("./routes/searchRoutes"));
app.use("/api/auth", require("./routes/authRoutes"));

app.use("/api/users", require("./routes/userRoutes")); // userRoutes tiene su propia valición de superadmin

// Utilidad para descargar logs bloqueada a superadmins
const fs = require("fs");
app.get("/api/debug/error", superadminOnly, (req, res) => {
  const logPath = path.join(rootDir, "error_log.txt");
  if (fs.existsSync(logPath)) {
    res.sendFile(logPath);
  } else {
    res.send("No hay logs de error.");
  }
});

// Manejador Central de Errores (Error final de la cadena API)
app.use((err, req, res, next) => {
  const errorMsg = `[${new Date().toISOString()}] ${err.stack}\n`;
  fs.appendFileSync(path.join(rootDir, "error_log.txt"), errorMsg);
  res
    .status(500)
    .json({ message: "Error interno del servidor.", error: err.message });
});

// Alias Panel
app.get("/administrador", (req, res) => res.redirect("/administracion"));

module.exports = app;
