import bcrypt from "bcryptjs";
import prisma from "../../config/db.js";

import AppError from "../../utils/appError.js";

const register = async (username, email, password) => {
  const normalizedEmail = email.trim().toLowerCase();
  const existingUser = await prisma.user.findFirst({
    where: {
      OR: [{ email: normalizedEmail }, { username }],
    },
  });
  if (existingUser) {
    if (existingUser.email === normalizedEmail) {
      throw new AppError("Email already in use", 400);
    }

    if (existingUser.username === username) {
      throw new AppError("Username already in use", 400);
    }
  }
  const hashedPassword = await bcrypt.hash(password, 12);

  const user = await prisma.user.create({
    data: {
      username,
      email: normalizedEmail,
      password: hashedPassword,
    },
    select: {
      id: true,
      username: true,
      email: true,
      createdAt: true,
    },
  });
  return user;
};

const login = async (email, password) => {
  const normalizedEmail = email.trim().toLowerCase();

  const user = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  });
  if (!user) {
    throw new AppError("Invalid email or password", 401);
  }
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new AppError("Invalid email or password", 401);
  }
  return user;
};
export default {
  register,
  login,
};
