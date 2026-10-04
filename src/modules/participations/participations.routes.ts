import { Router } from "express";
import * as participationsController from "./participations.controller";
import { authenticate } from "../../middlewares/authenticate";

const router = Router();

router.use(authenticate);

// Participation moderation and self records
router.get("/mine", participationsController.getMine);
router.patch("/:id/approve", participationsController.approve);
router.patch("/:id/reject", participationsController.reject);
router.patch("/:id/ban", participationsController.ban);

export const participationsRoutes = router;
