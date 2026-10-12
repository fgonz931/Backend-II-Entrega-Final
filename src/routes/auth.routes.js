import express from "express";
import passport from "passport";
import {
  register,
  login,
  githubCallback,
  logout,
} from "../controllers/auth.controllers.js";

const authRouter = express.Router();

// POST /api/v1/auth/register
authRouter.post("/register", register);

// POST /api/v1/auth/login
authRouter.post(
  "/login",
  passport.authenticate("local", {
    session: true,
    failureMessage: true,
  }),
  login,
);

// GET /api/v1/auth/github
authRouter.get(
  "/github",
  passport.authenticate("github", { scope: ["user:email"] }),
);

// GET /api/v1/auth/github/callback
authRouter.get(
  "/github/callback",
  passport.authenticate("github", { failureRedirect: "/" }),
  githubCallback,
);

// POST /api/v1/auth/logout
authRouter.post("/logout", logout);

export default authRouter;
