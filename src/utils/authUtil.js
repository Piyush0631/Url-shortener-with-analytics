import jwt from "jsonwebtoken";
import crypto from "crypto";

export const createAccessToken = (id) => {
  const token = jwt.sign({ userId: id }, process.env.JWT_SECRET, {
    expiresIn: "15m",
  });
  return token;
};

export const createRefreshToken = () => {
  return crypto.randomBytes(64).toString("hex");
};

export function setTokenCookie(res, refreshToken) {
  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
}
