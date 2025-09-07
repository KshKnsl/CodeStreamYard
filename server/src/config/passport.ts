import passport from "passport";
import { Strategy as GitHubStrategy } from "passport-github2";
import { User, UserInterface } from "../models/user";
declare global {
  namespace Express {
    interface User extends UserInterface {}
  }
}

export default function configurePassport(): void {
  passport.serializeUser((u: UserInterface, done) => {
    done(null, u.id);
  });

  passport.deserializeUser(async (id: string, done) => {
    const u = await User.findById(id);
    if (!u) return done(null, false);
    return done(null, u);
  });

  // @ts-ignore
  passport.use(
    new GitHubStrategy(
      {
        clientID: process.env.GITHUB_CLIENT_ID || "",
        clientSecret: process.env.GITHUB_CLIENT_SECRET || "",
        scope: ["user:email", "repo"],
      },
      async (at: string, rt: string, p: any, done: any) => {
        const email = p.emails[0].value;
        const u = await User.findOne({ email });

        if (!u) {
          const newU = await User.create({
            username: p.username,
            displayName: p.displayName || p.username || email,
            avatar: p.photos?.[0]?.value || null,
            githubId: p.id,
            accessToken: at,
            refreshToken: rt,
            email,
          });
          return done(null, newU);
        }

        const updatedU = await User.findOneAndUpdate(
          { email },
          {
            username: p.username,
            displayName: p.displayName || p.username || email,
            avatar: p.photos?.[0]?.value || null,
            githubId: p.id,
            accessToken: at,
            refreshToken: rt,
            email,
          },
          { new: true }
        );
        return done(null, updatedU);
      }
    )
  );
}
