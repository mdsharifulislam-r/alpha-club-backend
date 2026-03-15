import express from 'express';
import auth from '../../middlewares/auth';
import { USER_ROLES } from '../../../enums/user';
import { TeamContactController } from './teamContact.controller';

const router = express.Router();


// ✅ Create a new contact (no file upload)
router
  .route('/')
  .post(TeamContactController.createTeamContact)
  .get(TeamContactController.getAllTeamContacts);

// ✅ Operations for a specific contact by ID
router
  .route('/:id')
  .get(TeamContactController.getTeamContactById)
  .patch(
    auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN), 
    TeamContactController.updateTeamContact
  )
  .delete(
    auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN), 
    TeamContactController.deleteTeamContact
  );

export const TeamContactRoutes = router;