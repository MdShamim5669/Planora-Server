import { Router } from "express";
import * as eventsController from "./events.controller";
import { authenticate, optionalAuthenticate } from "../../middlewares/authenticate";
import { validate } from "../../middlewares/validate";
import {
  createEventValidationSchema,
  updateEventValidationSchema,
  listEventsQuerySchema,
} from "./events.validation";

const router = Router();

// Public / Optional auth routes
router.get("/", validate(listEventsQuerySchema), optionalAuthenticate, eventsController.listEvents);
router.get("/featured", eventsController.getFeatured);
router.get("/upcoming", eventsController.getUpcoming);

// Protected routes (declared before :id)
router.get("/mine", authenticate, eventsController.getMine);
router.post("/", authenticate, validate(createEventValidationSchema), eventsController.create);

// Event ID routes
router.get("/:id", optionalAuthenticate, eventsController.getById);
router.patch("/:id", authenticate, validate(updateEventValidationSchema), eventsController.update);
router.delete("/:id", authenticate, eventsController.remove);

// Participation sub-routes under /events/:id
import * as participationsController from "../participations/participations.controller";
router.post("/:id/join", authenticate, participationsController.joinFree);
router.get("/:id/participants", authenticate, participationsController.listParticipants);

// Invitation sub-routes under /events/:id
import * as invitationsController from "../invitations/invitations.controller";
import { createInvitationValidationSchema } from "../invitations/invitations.validation";
router.post(
  "/:id/invitations",
  authenticate,
  validate(createInvitationValidationSchema),
  invitationsController.invite
);
router.get("/:id/invitations", authenticate, invitationsController.getEventInvitations);

// Review sub-routes under /events/:id
import * as reviewsController from "../reviews/reviews.controller";
import { createReviewValidationSchema } from "../reviews/reviews.validation";
router.get("/:id/reviews", reviewsController.getEventReviews);
router.post(
  "/:id/reviews",
  authenticate,
  validate(createReviewValidationSchema),
  reviewsController.create
);

export const eventsRoutes = router;
