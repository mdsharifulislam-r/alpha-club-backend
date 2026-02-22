import express from 'express';
import validateRequest from '../../middlewares/validateRequest';
import auth from '../../middlewares/auth';
import { USER_ROLES } from '../../../enums/user';
import { MemberShipApplicationValidation } from './membershipApplication.validation';
import { MemberShipApplicationController } from './membershipApplication.controller';
import fileUploadHandler from '../../middlewares/fileUploadHandler';

const router = express.Router();

router
  .route('/')
  .post(
    auth(USER_ROLES.USER, USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
    validateRequest(MemberShipApplicationValidation.createZodSchema),
    MemberShipApplicationController.create
  )
  .get(
    auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN , USER_ROLES.PARTNER),
    MemberShipApplicationController.getAll
  );

router.post('/crate-from',
   fileUploadHandler(),
  MemberShipApplicationController.createFrom);

router
  .route('/:id')
  .get(
    auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN, USER_ROLES.USER),
    MemberShipApplicationController.getById
  )
  .patch(
    auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
    MemberShipApplicationController.update
  )
  .delete(
    auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
    MemberShipApplicationController.remove
  );

export const MemberShipApplicationRoutes = router;

