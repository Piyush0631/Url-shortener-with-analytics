import express from "express";
import cookieParser from "cookie-parser";
import authRouter from "./modules/auth/authRoute.js";
import linkRouter from "./modules/links/linkRouter.js";
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use("/api/v1/auth", authRouter);
app.use("/api/v1/links", linkRouter);
app.use((error, req, res, _next) => {
  console.error(error);
  const statusCode = error.statusCode || 500;
  const errorMessage = error.isOperational
    ? error.message
    : "Internal server error";
  res.status(statusCode).json({
    success: false,
    error: errorMessage,
  });
});

export default app;
