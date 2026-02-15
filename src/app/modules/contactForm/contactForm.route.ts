import express from 'express';
import auth from '../../middlewares/auth';
import { USER_ROLES } from '../../../enums/user';
import { ContactFormController } from './contactForm.controller';

const router = express.Router();

// Create contact form (no file upload handler needed)
router
  .route('/')
  .post(ContactFormController.create)
  .get(ContactFormController.getAll);

// Operations for a specific contact form by id

router.post('/create-form', ContactFormController.createForm);
router
  .route('/:id')
  .get(    ContactFormController.getById)
  .patch(
    auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
    ContactFormController.update
  )
  .delete(
    auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
    ContactFormController.remove
  );

export const ContactFormRoutes = router;
