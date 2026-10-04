import { Router } from "express";
import * as reviewsController from "./reviews.controller";
import { authenticate } from "../../middlewares/authenticate";
import { validate } from "../../middlewares/validate";
import { updateReviewValidationSchema } from "./reviews.validation";

const router = Router();

router.use(authenticate);

router.get("/mine", reviewsController.getMine);
router.patch("/:id", validate(updateReviewValidationSchema), reviewsController.update);
router.delete("/:id", reviewsController.remove);

export const reviewsRoutes = router;
