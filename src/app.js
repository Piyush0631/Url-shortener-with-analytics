import express from "express";
import cookieParser from "cookie-parser";
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

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
