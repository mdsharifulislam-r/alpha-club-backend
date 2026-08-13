import express from 'express';
import auth from '../../middlewares/auth';
import { USER_ROLES } from '../../../enums/user';
import { FaqController } from './faq.controller';
import fileUploadHandler from '../../middlewares/fileUploadHandler';

const router = express.Router();

router
  .route('/')
  .post(
    fileUploadHandler(),
    auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
    FaqController.create
  )
  .get(
    auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN, USER_ROLES.USER),
    FaqController.getAll
  );

router
  .route('/:id')
  .get(
    auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN, USER_ROLES.USER),
    FaqController.getById
  )
  .patch(
    fileUploadHandler(),
    auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
    FaqController.update
  )
  .delete(auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN), FaqController.remove);
 

router.route('/contact').post(
    auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN, USER_ROLES.USER),
    FaqController.createContact);

router
  .route('/contact')
  .get(auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN, USER_ROLES.USER),FaqController.getAllContacts);

router
  .route('/contact/:id')
  .get(auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN, USER_ROLES.USER),FaqController.getContactById);

router
  .route('/contact/all')
  .get(auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN, USER_ROLES.USER),FaqController.getAllContactsForAdmin);


export const FaqRoutes = router;
