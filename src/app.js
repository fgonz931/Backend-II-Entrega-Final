import express from "express";
import dotenv from "dotenv";
dotenv.config();

import path from "path";
import { fileURLToPath } from "url";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import session from "express-session";
import MongoStore from "connect-mongo";
import passport from "passport";
import { engine } from "express-handlebars";

import connectMongoDB from "./config/db.js";

import "./strategies/local.strategy.js";
import "./strategies/jwt.strategy.js";
import "./strategies/github.strategy.js";

import productsRouter from "./routes/products.routes.js";
import cartsRouter from "./routes/carts.routes.js";
import viewsRouter from "./routes/views.routes.js";
import authRouter from "./routes/auth.routes.js";

import {
  getSession,
  getProfile,
  getAdmin,
} from "./controllers/auth.controllers.js";
import isAuthenticated from "./middlewares/auth.middleware.js";
import isAdmin from "./middlewares/role.middleware.js";

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ── Middlewares base (no dependen de la DB) ───────────────
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

// ── Motor de vistas ───────────────────────────────────────
app.engine("handlebars", engine());
app.set("view engine", "handlebars");
app.set("views", path.join(__dirname, "views"));

const startServer = async () => {
  // 1. Conexión a la base
  await connectMongoDB();

  // 2. Sesión (antes que passport y que cualquier ruta que la use)
  app.use(
    session({
      secret: process.env.SESSION_SECRET,
      resave: false,
      saveUninitialized: false,
      store: MongoStore.create({
        clientPromise: Promise.resolve(mongoose.connection.getClient()),
        ttl: 60 * 60,
      }),
      cookie: {
        httpOnly: true,
        sameSite: "Lax",
        secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 60 * 1000,
      },
    }),
  );

  // 3. Passport (después de session)
  app.use(passport.initialize());
  app.use(passport.session());

  // 4. Rutas (después de session y passport)
  app.use("/api/v1/auth", authRouter);
  app.get("/api/v1/session", getSession);
  app.get("/api/v1/profile", isAuthenticated, getProfile);
  app.get("/api/v1/admin", isAuthenticated, isAdmin, getAdmin);

  app.use("/api/products", productsRouter);
  app.use("/api/carts", cartsRouter);
  app.use("/", viewsRouter);

  // 5. Manejador de errores (siempre al final)
  app.use((err, req, res, next) => {
    console.error(err.stack);
    res
      .status(500)
      .json({ status: "error", message: "Error interno del servidor." });
  });

  const PORT = process.env.PORT || 8080;
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
};

startServer().catch((err) => {
  console.error("No se pudo iniciar el servidor:", err.message);
  process.exit(1);
});
