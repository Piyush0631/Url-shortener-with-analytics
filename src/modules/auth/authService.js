import bcrypt from "bcryptjs";
import prisma from "../../config/db.js";
import {
  createAccessToken,
  createRefreshToken,
  hashRefreshToken,
} from "../../utils/authUtil.js";
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

const refresh = async (refreshToken) => {
  const hashedRefreshToken = hashRefreshToken(refreshToken);

  const storedToken = await prisma.refreshToken.findUnique({
    where: { tokenHash: hashedRefreshToken },
  });
  if (!storedToken) {
    throw new AppError("Invalid refresh token", 401);
  }
  if (storedToken.revoked) {
    await prisma.refreshToken.updateMany({
      where: { familyId: storedToken.familyId },
      data: { revoked: true },
    });
    throw new AppError("Session compromised — please log in again", 401);
  }
  if (storedToken.expiresAt < new Date()) {
    throw new AppError("Refresh token has expired", 401);
  }
  const newRawToken = createRefreshToken();
  const newTokenHash = hashRefreshToken(newRawToken);
  const newExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  await prisma.$transaction([
    prisma.refreshToken.update({
      where: { id: storedToken.id },
      data: { revoked: true },
    }),
    prisma.refreshToken.create({
      data: {
        userId: storedToken.userId,
        tokenHash: newTokenHash,
        familyId: storedToken.familyId,
        expiresAt: newExpiresAt,
      },
    }),
  ]);
  const accessToken = createAccessToken(storedToken.userId);
  return { accessToken, refreshToken: newRawToken };
};

const logout = async (refreshToken) => {
  const hashedRefreshToken = hashRefreshToken(refreshToken);
  const storedToken = await prisma.refreshToken.findUnique({
    where: { tokenHash: hashedRefreshToken },
  });

  if (!storedToken) {
    throw new AppError("Invalid refresh token", 401);
  }
  await prisma.refreshToken.updateMany({
    where: { familyId: storedToken.familyId },
    data: { revoked: true },
  });
};
export default {
  register,
  login,
  refresh,
  logout,
};
