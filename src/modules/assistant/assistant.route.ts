import { Router } from "express";
import { optionalAuthenticate } from "../../middlewares/authenticate";
import { assistantLimiter } from "../../middlewares/rateLimiter";
import { validate } from "../../middlewares/validate";
import { askSchema } from "./assistant.validation";
import * as assistantController from "./assistant.controller";

const router = Router();

router.post(
  "/ask",
  optionalAuthenticate,
  assistantLimiter,
  validate(askSchema),
  assistantController.ask
);

export const assistantRoutes = router;
export default router;
