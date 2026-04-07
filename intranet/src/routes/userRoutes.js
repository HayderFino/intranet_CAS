const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");

// Middleware de protección básico (opcional aquí si se maneja globalmente)
const checkAuth = (req, res, next) => {
  if (req.session.userId && req.session.role === "superadmin") {
    next();
  } else {
    res.status(403).json({
      message: "Acceso denegado. Se requiere ser Super Administrador.",
    });
  }
};

router.use(checkAuth);

router.get("/", userController.getUsers);
router.post("/", userController.createUser);
router.put("/:id", userController.updateUser);
router.delete("/:id", userController.deleteUser);

module.exports = router;
