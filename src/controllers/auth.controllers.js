import jwt from "jsonwebtoken";
import User from "../models/users.model.js";

const generateToken = (user) => {
  return jwt.sign(
    { userId: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "1h" },
  );
};

const cookieOptions = {
  httpOnly: true,
  sameSite: "Lax",
  secure: process.env.NODE_ENV === "production",
  maxAge: 60 * 60 * 1000,
};

export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        status: "error",
        message: "Todos los campos son obligatorios.",
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        status: "error",
        message: "El email ya está registrado.",
      });
    }

    const user = await User.create({ name, email, password });

    return res.status(201).json({
      status: "success",
      message: "Usuario registrado correctamente.",
      payload: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("ERROR REGISTER:", error);
    return res.status(500).json({
      status: "error",
      message: "Error al registrar el usuario.",
    });
  }
};

export const login = async (req, res) => {
  try {
    const user = req.user;
    const token = generateToken(user);

    res.cookie("authToken", token, cookieOptions);

    return res.status(200).json({
      status: "success",
      message: "Login exitoso.",
      token,
      payload: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: "Error al iniciar sesión.",
    });
  }
};

export const githubCallback = (req, res) => {
  try {
    const user = req.user;
    const token = generateToken(user);
    res.cookie("authToken", token, cookieOptions);
    return res.redirect("/");
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: "Error en autenticación con GitHub.",
    });
  }
};

export const getSession = (req, res) => {
  if (req.session && req.session.passport && req.session.passport.user) {
    return res.status(200).json({
      status: "success",
      session: {
        id: req.sessionID,
        user: req.session.passport.user,
        expires: req.session.cookie._expires,
      },
    });
  }
  return res.status(200).json({
    status: "success",
    message: "No hay sesión activa.",
    session: null,
  });
};

export const getProfile = (req, res) => {
  return res.status(200).json({
    status: "success",
    payload: {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role,
    },
  });
};

export const getAdmin = (req, res) => {
  return res.status(200).json({
    status: "success",
    message: `Bienvenido al panel de administración, ${req.user.name}.`,
    payload: {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role,
    },
  });
};

export const logout = (req, res) => {
  // Destruimos la sesión
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({
        status: "error",
        message: "Error al cerrar sesión.",
      });
    }

    res.clearCookie("authToken");

    return res.status(200).json({
      status: "success",
      message: "Sesión cerrada correctamente.",
    });
  });
};
