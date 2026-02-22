import express from 'express';
import auth from '../../middlewares/auth';
import { USER_ROLES } from '../../../enums/user';
import { DailyAttendanceController } from './daily-attendance.controller';


const router = express.Router();

router
  .route('/')
  .post(
    auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN, USER_ROLES.PARTNER),
    DailyAttendanceController.create
  )
  .get(
    auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN, USER_ROLES.PARTNER),
    DailyAttendanceController.getAll
  );



router.get('/overview', auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN, USER_ROLES.PARTNER), DailyAttendanceController.attendanceOverview);

router
  .route('/:id')
  .get(
    auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN, USER_ROLES.PARTNER),
    DailyAttendanceController.getById
  )
  .patch(
    auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN, USER_ROLES.PARTNER),
    DailyAttendanceController.update
  )
  .delete(
    auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN, USER_ROLES.PARTNER),
    DailyAttendanceController.remove
  );

export const DailyAttendanceRoutes = router;