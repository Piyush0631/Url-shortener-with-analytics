import { Router } from "express";
import analyticsController from "./analyticsController.js";
import { authMiddleware } from "../auth/authMiddleware.js";
import { authorizeLinkOwner } from "../links/linkMiddleware.js";
const analyticsRouter = Router();

analyticsRouter.get(
  "/:shortCode/raw",
  authMiddleware,
  authorizeLinkOwner,
  analyticsController.getAnalytics,
);
analyticsRouter.get(
  "/:shortCode/summary",
  authMiddleware,
  authorizeLinkOwner,
  analyticsController.getSummary,
);

export default analyticsRouter;
