import { Router } from "express";
import redirect from "./redirectController.js";
const redirectRouter = Router();

redirectRouter.get("/:shortCode", redirect);

export default redirectRouter;
