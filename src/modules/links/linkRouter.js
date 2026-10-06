import { Router } from "express";
import linkController from "./linkController.js";
import { authMiddleware } from "../auth/authMiddleware.js";
import { authorizeLinkOwner as linkMiddleware } from "./linkMiddleware.js";
const linkRouter = Router();

linkRouter.post("/", authMiddleware, linkController.createShortUrl);
linkRouter.get("/", authMiddleware, linkController.getLinks);
linkRouter.get(
  "/:shortCode",
  authMiddleware,
  linkMiddleware,
  linkController.getLinkByShortCode,
);
linkRouter.delete(
  "/:shortCode",
  authMiddleware,
  linkMiddleware,
  linkController.deleteLinkByShortCode,
);

export default linkRouter;
