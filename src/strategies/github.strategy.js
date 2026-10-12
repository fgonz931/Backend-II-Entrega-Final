import passport from "passport";
import { Strategy as GitHubStrategy } from "passport-github2";
import User from "../models/users.model.js";

passport.use(
  new GitHubStrategy(
    {
      clientID: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      callbackURL: process.env.GITHUB_CALLBACK_URL,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        console.log("GitHub profile:", profile.id, profile.displayName);

        let user = await User.findOne({ githubId: profile.id });

        if (!user) {
          user = await User.create({
            name: profile.displayName || profile.username,
            email:
              profile.emails?.[0]?.value || `${profile.username}@github.com`,
            githubId: profile.id,
            role: "user",
          });
          console.log("Usuario de GitHub creado:", user.email);
        } else {
          console.log("Usuario de GitHub ya existe:", user.email);
        }

        return done(null, user);
      } catch (error) {
        console.error("Error en GitHub strategy:", error);
        return done(error);
      }
    },
  ),
);

passport.serializeUser((user, done) => {
  done(null, user._id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error);
  }
});

export default passport;
