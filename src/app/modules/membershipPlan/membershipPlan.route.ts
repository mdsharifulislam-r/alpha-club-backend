import express from 'express';
import validateRequest from '../../middlewares/validateRequest';
import auth from '../../middlewares/auth';
import { USER_ROLES } from '../../../enums/user';
import { MemberShipPlanController } from './membershipPlan.controller';
import fileUploadHandler from '../../middlewares/fileUploadHandler';

const router = express.Router();

router
.route('/feature-comparison')
.get(
  auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN, USER_ROLES.USER),
  MemberShipPlanController.getFeatureComparison
);

router
  .route('/')
  .post(
    fileUploadHandler(),
    auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
    MemberShipPlanController.create
  )
  .get(
    // auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN, USER_ROLES.USER),
    MemberShipPlanController.getAll
  );

router
  .route('/:type')
  .get(
    auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN, USER_ROLES.USER),
    MemberShipPlanController.getById
  )
  .patch(
    fileUploadHandler(),
    auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN, USER_ROLES.USER),
    MemberShipPlanController.update
  )
  .delete(
    auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN , USER_ROLES.USER),
    MemberShipPlanController.remove
  );


  


export const MemberShipPlanRoutes = router;

