import { Router } from "express";
import * as authController from "./auth.controller";
import { validate } from "../../middlewares/validate";
import { registerValidationSchema, loginValidationSchema } from "./auth.validation";
import { authenticate } from "../../middlewares/authenticate";
import { authRateLimiter } from "../../middlewares/rateLimiter";

const router = Router();

router.post(
  "/register",
  authRateLimiter,
  validate(registerValidationSchema),
  authController.register
);

router.post(
  "/login",
  authRateLimiter,
  validate(loginValidationSchema),
  authController.login
);

router.get("/me", authenticate, authController.getMe);

export const authRoutes = router;
