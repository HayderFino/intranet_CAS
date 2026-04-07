const UniversalCrawler = require("../models/universalCrawler");

const checkAuth = (req, res, next) => {
  if (["POST", "PUT", "DELETE"].includes(req.method)) {
    // 1) Global Auth Middleware: Proteger todas las acciones mutables
    if (
      !req.path.startsWith("/auth") &&
      (!req.session || !req.session.userId)
    ) {
      return res.status(401).json({
        success: false,
        message:
          "Acceso denegado. Se requiere iniciar sesión como Administrador.",
      });
    }

    // 2) Cache/Crawler invalidation injection
    const originalJson = res.json.bind(res);
    res.json = (body) => {
      if (res.statusCode >= 200 && res.statusCode < 300) {
        UniversalCrawler.invalidate();
      }
      return originalJson(body);
    };
  }
  next();
};

const superadminOnly = (req, res, next) => {
  if (req.session && req.session.role === "superadmin") {
    next();
  } else {
    res.status(403).json({
      success: false,
      message: "Acceso denegado. Se requiere ser Super Administrador.",
    });
  }
};

module.exports = {
  checkAuth,
  superadminOnly,
};
