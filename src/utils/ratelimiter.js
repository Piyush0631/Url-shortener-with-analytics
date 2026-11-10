import { rateLimit } from "express-rate-limit";
import { RedisStore } from "rate-limit-redis";
import redis from "../config/redis.js";

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 100,

  store: new RedisStore({
    sendCommand: (...args) => redis.call(...args),
    prefix: "rate-limit:",
  }),
  message: "Too many requests, please try again later",
  standardHeaders: "draft-8",
  legacyHeaders: false,
});
export default limiter;
