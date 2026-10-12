const isAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      status: "error",
      message: "No autenticado.",
    });
  }

  if (req.user.role !== "admin") {
    return res.status(403).json({
      status: "error",
      message: "Acceso denegado. Se requiere rol de administrador.",
    });
  }

  next();
};

export default isAdmin;
