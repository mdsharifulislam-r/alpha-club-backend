import express from 'express';
import validateRequest from '../../middlewares/validateRequest';
import auth from '../../middlewares/auth';
import { USER_ROLES } from '../../../enums/user';
import { ExclusiveOfferValidation } from './exclusiveOffer.validation';
import { ExclusiveOfferController } from './exclusiveOffer.controller';
import fileUploadHandler from '../../middlewares/fileUploadHandler';

const router = express.Router();

router
  .route('/')
  .post(
    fileUploadHandler(),
    validateRequest(ExclusiveOfferValidation.createZodSchema),
    auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN, USER_ROLES.USER, USER_ROLES.PARTNER),
    ExclusiveOfferController.create
  )
  .get(
    auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN, USER_ROLES.USER, USER_ROLES.PARTNER),
    ExclusiveOfferController.getAll
  );

 router.get("/my-offers",
    auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN, USER_ROLES.USER, USER_ROLES.PARTNER),
    ExclusiveOfferController.getMyOffers
 )

router
  .route('/:id')
  .get(
    auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN, USER_ROLES.USER, USER_ROLES.PARTNER),
    ExclusiveOfferController.getById
  )
  .patch(
    fileUploadHandler(),
    // validateRequest(ExclusiveOfferValidation.updateZodSchema),
    auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN, USER_ROLES.USER, USER_ROLES.PARTNER),
    ExclusiveOfferController.update
  )
  .delete(
    auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN, USER_ROLES.USER, USER_ROLES.PARTNER),
    ExclusiveOfferController.remove
  );

router
  .route('/favourite/:id')
  .post(
    auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN, USER_ROLES.USER, USER_ROLES.PARTNER),
    ExclusiveOfferController.createFavorite
  );

router
  .route('/all/favourite')
  .get(
    auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN, USER_ROLES.USER, USER_ROLES.PARTNER),
    ExclusiveOfferController.getFavourites
  );

export const ExclusiveOfferRoutes = router;
