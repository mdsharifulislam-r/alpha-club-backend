import express from 'express';
import validateRequest from '../../../middlewares/validateRequest';
import auth from '../../../middlewares/auth';
import { USER_ROLES } from '../../../../enums/user';
import { CategoryValidation } from './category.validation';
import { CategoryController } from './category.controller';

const router = express.Router();

router
  .route('/')
  .post(
    validateRequest(CategoryValidation.createZodSchema),
    auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN , USER_ROLES.USER, USER_ROLES.PARTNER),
    CategoryController.create
  )
  .get(
    auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN, USER_ROLES.USER, USER_ROLES.PARTNER),
    CategoryController.getAll
  );

router
  .route('/:id')
  .get(
    auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN, USER_ROLES.USER, USER_ROLES.PARTNER),
    CategoryController.getById
  )
  .patch(
    validateRequest(CategoryValidation.updateZodSchema),
    auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN, USER_ROLES.USER, USER_ROLES.PARTNER),
    CategoryController.update
  )
  .delete(
    auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN, USER_ROLES.USER, USER_ROLES.PARTNER),
    CategoryController.remove
  );

export const CategoryRoutes = router;

