import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import User from "../models/users.model.js";

passport.use(
  new LocalStrategy(
    { usernameField: "email" },
    async (email, password, done) => {
      try {
        // Buscamos el usuario por email
        const user = await User.findOne({ email });
        if (!user) {
          return done(null, false, { message: "Email no registrado" });
        }

        if (!user.password) {
          return done(null, false, {
            message: "Usá GitHub para iniciar sesión",
          });
        }

        const isValid = await user.comparePassword(password);
        if (!isValid) {
          return done(null, false, { message: "Contraseña incorrecta" });
        }

        return done(null, user);
      } catch (error) {
        return done(error);
      }
    },
  ),
);

export default passport;
