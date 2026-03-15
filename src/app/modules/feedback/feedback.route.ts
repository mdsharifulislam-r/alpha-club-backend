import express from "express";
import auth from "../../middlewares/auth";
import { USER_ROLES } from "../../../enums/user";
import { FeedbackController } from "./feedback.controller";

const router = express.Router();

router
  .route("/")
  .post(FeedbackController.createFeedback)
  .get(FeedbackController.getAllFeedbacks); 


router.get('/overview', auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN , USER_ROLES.PARTNER, USER_ROLES.USER), FeedbackController.overview);
router
  .route("/:id")
  .get(FeedbackController.getFeedbackById)
  .patch(
    auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN), 
    FeedbackController.updateFeedback
  )
  .delete(
    auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
    FeedbackController.deleteFeedback
  );

export const FeedbackRoutes = router;