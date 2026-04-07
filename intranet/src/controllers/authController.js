const User = require("../models/userModel");
const bcrypt = require("bcryptjs");

const authController = {
  login: async (req, res) => {
    try {
      const loginUser = req.body.username;
      const loginPass = req.body.password;

      if (!loginUser || !loginPass) {
        return res
          .status(400)
          .json({ success: false, message: "Usuario y contraseña requeridos" });
      }

      const user = await User.findOne({ username: loginUser });
      if (!user) {
        return res
          .status(401)
          .json({ success: false, message: "Usuario no encontrado" });
      }

      const isMatch = await bcrypt.compare(loginPass, user.password);
      if (!isMatch) {
        return res
          .status(401)
          .json({ success: false, message: "Contraseña incorrecta" });
      }

      // Guardar sesión
      req.session.userId = user._id;
      req.session.role = user.role;
      req.session.displayName = user.displayName;
      req.session.permissions = user.permissions;

      res.json({
        success: true,
        message: "Login exitoso",
        user: {
          username: user.username,
          displayName: user.displayName,
          role: user.role,
          permissions: user.permissions,
        },
      });
    } catch (error) {
      console.error("Error en login:", error);
      res.status(500).json({ success: false, message: "Error en el servidor" });
    }
  },

  logout: (req, res) => {
    req.session.destroy();
    res.json({ success: true, message: "Sesión cerrada" });
  },

  checkSession: (req, res) => {
    if (req.session.userId) {
      res.json({
        success: true,
        user: {
          displayName: req.session.displayName,
          role: req.session.role,
          permissions: req.session.permissions,
        },
      });
    } else {
      res.status(401).json({ success: false, message: "No hay sesión activa" });
    }
  },
};

module.exports = authController;
