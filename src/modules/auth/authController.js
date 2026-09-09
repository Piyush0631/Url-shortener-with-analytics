import catchAsync from "../../utils/catchAsync.js";
import AppError from "../../utils/appError.js";
import { registerSchema } from "./authValidator.js";
import { loginSchema } from "./authValidator.js";
import {
  createAccessToken,
  createRefreshToken,
  setTokenCookie,
} from "../../utils/authUtil.js";
import authService from "./authService.js";
import bcrypt from "bcryptjs";
import prisma from "../../config/db.js";
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
  const hashedRefreshToken = await bcrypt.hash(refreshToken, 12);
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  await prisma.refreshToken.create({
    data: {
      userId: user.id,
      tokenHash: hashedRefreshToken,
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
export default {
  register,
  login,
};
