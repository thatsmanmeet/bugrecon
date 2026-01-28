import express from "express";
import colors from "colors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import helmet from "helmet";
import hpp from "hpp";
import rateLimit from "express-rate-limit";
import path from "path";
import { connectDB } from "./db/dbconnect.js";
import compression from "compression";
import userRouter from "./routes/user.routes.js";
import projectRouter from "./routes/project.routes.js";
import commentRouter from "./routes/comment.routes.js";
import issueRouter from "./routes/issue.routes.js";
import documentationRouter from "./routes/documentation.routes.js";

dotenv.config();
const app = express();
const port = process.env.PORT || 4008;

// security middlewares
app.use(
  "/api",
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: process.env.RATE_LIMIT_REQUEST,
    message: "Too many requests from this IP address. Please try again later.",
    statusCode: 429,
    legacyHeaders: false,
  }),
);
app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "HEAD", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "X-Requested-With",
      "device-remember-token",
      "Access-Control-Allow-Origin",
      "Origin",
      "Accept",
    ],
  }),
);
app.use(helmet());
app.use(hpp());

// request middlewares
const __dirname = path.resolve();
app.use(compression());
app.use(express.json({ limit: "50kb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(
  helmet.contentSecurityPolicy({
    useDefaults: true,
    directives: {
      "img-src": ["'self'", "https:", "data:"],
    },
  }),
);
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// routes
connectDB();
app.use("/api/v1/users", userRouter);
app.use("/api/v1/projects", projectRouter);
app.use("/api/v1/issues", issueRouter);
app.use("/api/v1/comments", commentRouter);
app.use("/api/v1/documentations", documentationRouter);

if (process.env.NODE_ENV !== "production") {
  app.get("/", (req, res) => {
    res.json({
      status: "ok",
      message: "Development server is running...",
    });
  });
} else {
  app.use(express.static(path.join(__dirname, "frontend/dist")));
  app.get("/*splat", (req, res) => {
    res.sendFile(path.resolve(__dirname, "frontend", "dist", "index.html"));
  });
}

// error handling
// 404 Handler (always at the bottom)
app.use((req, res) => {
  res.status(404).json({
    status: 404,
    message: "Route not found!",
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  res.status(err.statusCode || 500);
  res.json({
    status: err.statusCode || 500,
    success: false,
    data: null,
    errCode: err.errCode || null,
    message: err?.message || "Internal Server Error",
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`.blue);
});
