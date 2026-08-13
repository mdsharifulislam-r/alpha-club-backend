import express from 'express';
import validateRequest from '../../../middlewares/validateRequest';
import auth from '../../../middlewares/auth';
import { USER_ROLES } from '../../../../enums/user';
import { MemberShipFeatureValidation } from './memberShipFeatures.validation';
import { MemberShipFeatureController } from './memberShipFeatures.controller';
import fileUploadHandler from '../../../middlewares/fileUploadHandler';

const router = express.Router();

router
  .route('/')
  .post(
    auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN, USER_ROLES.USER),
    fileUploadHandler(),
    MemberShipFeatureController.create
  )
  .get(
    auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN, USER_ROLES.USER),
    MemberShipFeatureController.getAll
  );

router
  .route('/:id')
  .get(
    auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN, USER_ROLES.USER),
    MemberShipFeatureController.getById
  )
  .patch(
      fileUploadHandler(),
    auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
    MemberShipFeatureController.update
  )
  .delete(
    auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
    MemberShipFeatureController.remove
  );

export const MemberShipFeatureRoutes = router;

