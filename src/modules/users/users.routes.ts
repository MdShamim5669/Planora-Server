import { Router } from "express";
import * as usersController from "./users.controller";
import { authenticate } from "../../middlewares/authenticate";
import { validate } from "../../middlewares/validate";
import {
  updateProfileValidationSchema,
  updateNotificationsValidationSchema,
} from "./users.validation";

const router = Router();

router.use(authenticate);

router.patch("/me", validate(updateProfileValidationSchema), usersController.updateProfile);
router.patch(
  "/me/notifications",
  validate(updateNotificationsValidationSchema),
  usersController.updateNotifications
);

export const usersRoutes = router;
