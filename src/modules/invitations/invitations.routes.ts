import { Router } from "express";
import * as invitationsController from "./invitations.controller";
import { authenticate } from "../../middlewares/authenticate";

const router = Router();

router.use(authenticate);

router.get("/mine", invitationsController.getMine);
router.post("/:id/accept", invitationsController.accept);
router.post("/:id/decline", invitationsController.decline);

export const invitationsRoutes = router;
