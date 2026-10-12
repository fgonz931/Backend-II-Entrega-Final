import passport from "passport";

const isAuthenticated = (req, res, next) => {
  passport.authenticate("jwt", { session: false }, (err, user) => {
    if (err) return next(err);
    if (!user) {
      return res.status(401).json({
        status: "error",
        message: "No autenticado. Iniciá sesión primero.",
      });
    }
    req.user = user; // guardamos el usuario en el request
    next();
  })(req, res, next);
};

export default isAuthenticated;
