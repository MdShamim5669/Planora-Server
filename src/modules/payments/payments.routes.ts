import { Router } from "express";
import * as paymentsController from "./payments.controller";
import { authenticate } from "../../middlewares/authenticate";
import { validate } from "../../middlewares/validate";
import { initPaymentValidationSchema } from "./payments.validation";

const router = Router();

// User payment initiation & history
router.post(
  "/init",
  authenticate,
  validate(initPaymentValidationSchema),
  paymentsController.initPayment
);
router.get("/mine", authenticate, paymentsController.getMine);

// Gateway callbacks (Public / Gateway called)
router.post("/success", paymentsController.handleSuccessCallback);
router.post("/fail", paymentsController.handleFailCallback);
router.post("/cancel", paymentsController.handleCancelCallback);
router.post("/ipn", paymentsController.handleIpn);

export const paymentsRoutes = router;
