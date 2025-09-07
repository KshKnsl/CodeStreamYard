import dotenv from "dotenv";
import mongoose from "mongoose";
import express from "express";
import cors from "cors";
import morgan from "morgan";
import session from "express-session";
import MongoStore from "connect-mongo";
import passport from "passport";
import path from "path";
import cookieParser from "cookie-parser";
import { createServer } from "http";
import publicFilesRouter from "./routes/publicFiles";
import configurePassport from "./config/passport";
import authRoutes from "./routes/auth";
import userRoutes from "./routes/user";
import gitRoutes from "./routes/github";
import projectRoutes from "./routes/project";
import utilRoutes from "./routes/util";

dotenv.config();
mongoose
  .connect(process.env.MONGODB_URI || "mongodb://localhost:27017/terminaux")
  .then(() => console.info("Connected to MongoDB"))
  .catch((err) => console.error(`MongoDB error: ${err}`));

const app = express();
const httpServer = createServer(app);

app.use(
  cors({
    origin: true,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Cookie", "Set-Cookie"],
    exposedHeaders: ["Set-Cookie"],
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));
app.use(cookieParser(process.env.SESSION_SECRET));
app.set("trust proxy", 1);

app.use(
  session({
    store: MongoStore.create({
      mongoUrl: process.env.MONGODB_URI || "mongodb://localhost:27017/terminaux",
      ttl: 24 * 60 * 60, // Session TTL in seconds
      autoRemove: "native", // Use MongoDB's TTL index
      touchAfter: 24 * 3600, // Minimize unnecessary updates
    }),
    secret: process.env.SESSION_SECRET!,
    resave: false,
    saveUninitialized: false,
    proxy: true,
    rolling: true,
    unset: "destroy",
    cookie: {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: 24 * 60 * 60 * 1000,
    },
  })
);

app.use(passport.initialize());
app.use(passport.session());
configurePassport();

app.use((req: express.Request, res: express.Response, next: express.NextFunction) => {
  // Allow auth routes and root path
  if (req.path.startsWith("/auth") || req.path === "/") {
    return next();
  }

  // Check authentication for protected routes
  if (!req.isAuthenticated()) {
    return res.status(401).json({
      error: "Unauthorized",
      message: "Authentication required",
      isAuthenticated: false,
    });
  }

  next();
});

app.use(publicFilesRouter);

app.use("/auth", authRoutes);
app.use("/user", userRoutes);
app.use("/users", userRoutes);
app.use("/github", gitRoutes);
app.use("/project", projectRoutes);
app.use("/util", utilRoutes);
app.get("/", (_req: express.Request, res: express.Response) => {
  res.status(200).json({
    message: "Welcome to CodeStreamYard!",
    description:
      "CodeStreamYard is a platform for live coding tutorials, featuring live stream coding and real-time chat. It allows developers to conduct interactive sessions, with AI and OCR models providing real-time code updates and explanations. CodeStreamYard aims to create an engaging and interactive learning environment for developers and viewers.",
  });
});

app.use(express.static(path.join(__dirname, "public")));

const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => {
  console.info(`Server running on port ${PORT}`);
});

export default app;
