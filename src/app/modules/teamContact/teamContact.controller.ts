import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { TeamContactService } from './teamContact.service';

// ✅ Create a new Team Contact
const createTeamContact = catchAsync(async (req: Request, res: Response) => {
  const data = { ...req.body };
  const result = await TeamContactService.createTeamContact(data);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.CREATED,
    message: 'Team contact created successfully',
    data: result,
  });
});

// ✅ Get all Team Contacts
const getAllTeamContacts = catchAsync(async (req: Request, res: Response) => {
  const result = await TeamContactService.getAllTeamContacts(req.query);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Team contacts retrieved successfully',
    pagination: result.pagination,
    data: result.data,
  });
});

// ✅ Get Team Contact by ID
const getTeamContactById = catchAsync(async (req: Request, res: Response) => {
  const result = await TeamContactService.getTeamContactById(req.params.id);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Team contact retrieved successfully',
    data: result,
  });
});

// ✅ Update Team Contact
const updateTeamContact = catchAsync(async (req: Request, res: Response) => {
  const result = await TeamContactService.updateTeamContact(req.params.id, req.body);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Team contact updated successfully',
    data: result,
  });
});

// ✅ Delete Team Contact
const deleteTeamContact = catchAsync(async (req: Request, res: Response) => {
  const result = await TeamContactService.deleteTeamContact(req.params.id);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Team contact deleted successfully',
    data: result,
  });
});

export const TeamContactController = {
  createTeamContact,
  getAllTeamContacts,
  getTeamContactById,
  updateTeamContact,
  deleteTeamContact,
};