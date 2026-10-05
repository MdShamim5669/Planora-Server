import { Router } from "express";
import { IRouteModule } from "./routes.interface";
import { authRoutes } from "../modules/auth/auth.routes";
import { usersRoutes } from "../modules/users/users.routes";
import { eventsRoutes } from "../modules/events/events.routes";
import { participationsRoutes } from "../modules/participations/participations.routes";
import { invitationsRoutes } from "../modules/invitations/invitations.routes";
import { paymentsRoutes } from "../modules/payments/payments.routes";
import { reviewsRoutes } from "../modules/reviews/reviews.routes";
import { adminRoutes } from "../modules/admin/admin.routes";
import { assistantRoutes } from "../modules/assistant/assistant.route";

const router = Router();

const moduleRoutes: IRouteModule[] = [
  { path: "/auth", route: authRoutes },
  { path: "/users", route: usersRoutes },
  { path: "/events", route: eventsRoutes },
  { path: "/participations", route: participationsRoutes },
  { path: "/invitations", route: invitationsRoutes },
  { path: "/payments", route: paymentsRoutes },
  { path: "/reviews", route: reviewsRoutes },
  { path: "/admin", route: adminRoutes },
  { path: "/assistant", route: assistantRoutes },
];

// Base /api/v1 route info
router.get("/", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "Planora API v1 is active",
    version: "1.0.0",
    health: "/health",
  });
});

moduleRoutes.forEach((module) => {
  router.use(module.path, module.route);
});

export const IndexRoutes = router;
export default router;
