import dotenv from "dotenv";
dotenv.config();
import app from "./app.js";
import prisma from "./config/db.js";
const PORT = process.env.PORT || 9000;

let server;

const start = async () => {
  try {
    await prisma.$connect();
    console.log("PostgreSQL connected successfully");
    server = app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Error starting server:", error);
  }
};

start().catch((error) => {
  console.error("Startup failed:", error);
});
