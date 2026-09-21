import catchAsync from "../../utils/catchAsync.js";
import AppError from "../../utils/appError.js";
import { registerSchema } from "./authValidator.js";
import { loginSchema } from "./authValidator.js";
import {
  createAccessToken,
  createRefreshToken,
  setTokenCookie,
  hashRefreshToken,
} from "../../utils/authUtil.js";
import authService from "./authService.js";
import bcrypt from "bcryptjs";
import prisma from "../../config/db.js";
import crypto from "crypto";

const register = catchAsync(async (req, res, next) => {
  const data = registerSchema.parse(req.body);

  const user = await authService.register(
    data.username,
    data.email,
    data.password,
  );

  res.status(201).json({
    success: true,
    data: user,
  });
});

const login = catchAsync(async (req, res, next) => {
  const data = loginSchema.parse(req.body);
  const user = await authService.login(data.email, data.password);

  const accessToken = createAccessToken(user.id);
  const refreshToken = createRefreshToken();
  const hashedRefreshToken = hashRefreshToken(refreshToken);
  const familyId = crypto.randomUUID();
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  await prisma.refreshToken.create({
    data: {
      userId: user.id,
      tokenHash: hashedRefreshToken,
      familyId: familyId,
      expiresAt: expiresAt,
    },
  });
  setTokenCookie(res, refreshToken);
  res.status(200).json({
    success: true,
    data: {
      accessToken,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
      },
    },
  });
});

const refresh = catchAsync(async (req, res, next) => {
  const refreshToken = req.cookies.refreshToken;
  if (!refreshToken) {
    throw new AppError("Refresh token not provided", 401);
  }
  const { accessToken, refreshToken: newRefreshToken } =
    await authService.refresh(refreshToken);
  setTokenCookie(res, newRefreshToken);
  res.status(200).json({
    success: true,
    data: {
      accessToken,
    },
  });
});

const logout = catchAsync(async (req, res, next) => {
  const refreshToken = req.cookies.refreshToken;
  if (!refreshToken) {
    throw new AppError("Refresh token not provided", 401);
  }
  await authService.logout(refreshToken);
  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  });
  res.status(200).json({
    success: true,
    message: "Logged out successfully",
  });
});
export default {
  register,
  login,
  refresh,
  logout,
};
