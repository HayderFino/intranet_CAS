const User = require("../models/userModel");
const bcrypt = require("bcryptjs");

const userController = {
  // Listar todos los usuarios
  getUsers: async (req, res) => {
    try {
      const users = await User.find({}, "-password");
      res.json(users);
    } catch (error) {
      res
        .status(500)
        .json({ message: "Error al obtener usuarios", error: error.message });
    }
  },

  // Crear un nuevo usuario
  createUser: async (req, res) => {
    try {
      const { username, password, role, displayName, permissions } = req.body;

      // Verificar si el usuario ya existe
      const existingUser = await User.findOne({ username });
      if (existingUser) {
        return res
          .status(400)
          .json({ message: "El nombre de usuario ya está en uso" });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const newUser = new User({
        username,
        password: hashedPassword,
        role,
        displayName,
        permissions: permissions || {},
      });

      await newUser.save();
      res.status(201).json({
        message: "Usuario creado con éxito",
        user: { username, role, displayName },
      });
    } catch (error) {
      res
        .status(500)
        .json({ message: "Error al crear usuario", error: error.message });
    }
  },

  // Actualizar un usuario existente
  updateUser: async (req, res) => {
    try {
      const { id } = req.params;
      const { password, role, displayName, permissions } = req.body;

      const updateData = { role, displayName, permissions };

      if (password && password.trim() !== "") {
        updateData.password = await bcrypt.hash(password, 10);
      }

      const updatedUser = await User.findByIdAndUpdate(id, updateData, {
        new: true,
      }).select("-password");

      if (!updatedUser) {
        return res.status(404).json({ message: "Usuario no encontrado" });
      }

      res.json({ message: "Usuario actualizado con éxito", user: updatedUser });
    } catch (error) {
      res
        .status(500)
        .json({ message: "Error al actualizar usuario", error: error.message });
    }
  },

  // Eliminar un usuario
  deleteUser: async (req, res) => {
    try {
      const { id } = req.params;

      // No permitir que el usuario Admin se borre a sí mismo desde aquí por seguridad
      const userToDelete = await User.findById(id);
      if (userToDelete && userToDelete.username === "Admin") {
        return res.status(403).json({
          message: "No se puede eliminar el usuario administrador principal",
        });
      }

      const deletedUser = await User.findByIdAndDelete(id);
      if (!deletedUser) {
        return res.status(404).json({ message: "Usuario no encontrado" });
      }

      res.json({ message: "Usuario eliminado con éxito" });
    } catch (error) {
      res
        .status(500)
        .json({ message: "Error al eliminar usuario", error: error.message });
    }
  },
};

module.exports = userController;
