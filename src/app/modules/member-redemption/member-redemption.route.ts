import express from 'express';
import auth from '../../middlewares/auth';
import { USER_ROLES } from '../../../enums/user';
import { MemberRedemptionController } from './member-redemption.controller';

const router = express.Router();

// Create & Get All Redemptions
router
  .route('/')
  .post(
    auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN, USER_ROLES.PARTNER),
    MemberRedemptionController.create
  )
  .get(
    auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN, USER_ROLES.PARTNER),
    MemberRedemptionController.getAll
  );

// 🔹 Redemption overview (attendance-style stats)
router.get(
  '/overview',
  auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN, USER_ROLES.PARTNER),
  MemberRedemptionController.redemptionOverview
);

// 🔹 Get / Update / Delete by ID
router
  .route('/:id')
  .get(
    auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN, USER_ROLES.PARTNER),
    MemberRedemptionController.getById
  )
  .patch(
    auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN, USER_ROLES.PARTNER),
    MemberRedemptionController.update
  )
  .delete(
    auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN, USER_ROLES.PARTNER),
    MemberRedemptionController.remove
  );

export const MemberRedemptionRoutes = router;