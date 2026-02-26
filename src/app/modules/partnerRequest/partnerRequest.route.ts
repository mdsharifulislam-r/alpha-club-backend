import express from 'express';
import validateRequest from '../../middlewares/validateRequest';
import auth from '../../middlewares/auth';
import { USER_ROLES } from '../../../enums/user';
import fileUploadHandler from '../../middlewares/fileUploadHandler';
import { PartnerRequestController } from './partnerRequest.controller';

const router = express.Router();

router
  .route('/')
  .post(
    fileUploadHandler(),            // run upload first
    PartnerRequestController.create // then handle creation
  )
  .get(
    // auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
    PartnerRequestController.getAll
  );

router.post('/crate-from',
  fileUploadHandler(),
  PartnerRequestController.createFrom);

router
  .route('/:id')
  .get(
    auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN, USER_ROLES.USER),
    PartnerRequestController.getById
  )
  .patch(
    // auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
    PartnerRequestController.update
  )
  .delete(
    auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
    PartnerRequestController.remove
  );

export const PartnerRequestRoutes = router;

