import { Router } from "express";
import * as adminController from "./admin.controller";
import { authenticate } from "../../middlewares/authenticate";
import { requireRole } from "../../middlewares/requireRole";
import { validate } from "../../middlewares/validate";
import { Role } from "@prisma/client";
import { setFeatureValidationSchema, adminListQuerySchema } from "./admin.validation";

const router = Router();

// Gated with authentication and ADMIN role (PRD 3.3, 9.8)
router.use(authenticate, requireRole(Role.ADMIN));

router.get("/stats", adminController.getStats);
router.get("/events", validate(adminListQuerySchema), adminController.getEvents);
router.get("/users", validate(adminListQuerySchema), adminController.getUsers);

router.delete("/events/:id", adminController.deleteEvent);
router.delete("/users/:id", adminController.deleteUser);
router.patch("/events/:id/feature", validate(setFeatureValidationSchema), adminController.setFeature);

export const adminRoutes = router;
