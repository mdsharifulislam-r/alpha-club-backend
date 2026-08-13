import express from 'express';
import validateRequest from '../../middlewares/validateRequest';
import auth from '../../middlewares/auth';
import { USER_ROLES } from '../../../enums/user';
import { SettingsValidation } from './settings.validation';
import { SettingsController } from './settings.controller';

const router = express.Router();

// About routes
router
  .route('/about')
  .post(
    validateRequest(SettingsValidation.aboutZodSchema),
    auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN, USER_ROLES.USER),
    SettingsController.upsertAbout
  )
  .get(
    SettingsController.getAbout
  );

// Privacy Policy routes
router
  .route('/privacy-policy')
  .post(
    validateRequest(SettingsValidation.privacyPolicyZodSchema),
    auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN, USER_ROLES.USER),
    SettingsController.upsertPrivacyPolicy
  )
  .get(
    SettingsController.getPrivacyPolicy
  );

// Terms of Services routes
router
  .route('/terms-of-services')
  .post(
    validateRequest(SettingsValidation.termsOfServicesZodSchema),
    auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN, USER_ROLES.USER),
    SettingsController.upsertTermsOfServices
  )
  .get(
    SettingsController.getTermsOfServices
  );

export const SettingsRoutes = router;

