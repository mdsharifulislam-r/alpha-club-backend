import express from 'express';
import { USER_ROLES } from '../../../enums/user';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { AuthController } from './auth.controller';
import { AuthValidation } from './auth.validation';
const router = express.Router();

router.post(
  '/login',
  // validateRequest(AuthValidation.createLoginZodSchema),
  AuthController.loginUser
);

router.post(
  '/admin-login',
  // validateRequest(AuthValidation.createLoginZodSchema),
  AuthController.adminLoginUser
);

router.post('/partner-login', AuthController.partnerLoginUser);

router.post(
  '/resend-otp',
  validateRequest(AuthValidation.createResendOTPZodSchema),
  AuthController.resendOTPtoDB
);

router.post(
  '/verify-otp',
  AuthController.verifyOtp
);

router.post(
  '/forget-password',
  validateRequest(AuthValidation.createForgetPasswordZodSchema),
  AuthController.forgetPassword
);


router.post(
  '/verify-reset-otp',
  AuthController.verifyResetOtp
);

router.post(
  '/reset-password',
  validateRequest(AuthValidation.createResetPasswordZodSchema),
  AuthController.resetPassword
);

router.post(
  '/renewal-request',
  AuthController.renualRequest
);

router.post(
  '/change-password',
  auth(USER_ROLES.ADMIN,USER_ROLES.SUPER_ADMIN,USER_ROLES.USER),
  validateRequest(AuthValidation.createChangePasswordZodSchema),
  AuthController.changePassword
);


export const AuthRoutes = router;
