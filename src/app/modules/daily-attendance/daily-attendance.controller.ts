import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { DailyAttendanceService } from './dailyAttendance.service';

/**
 * Create Attendance
 */
const create = catchAsync(async (req: Request, res: Response) => {
  const data = {
    ...req.body,
    creator: req?.user?.id
  };

  const result = await DailyAttendanceService.createToDB(data);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.CREATED,
    message: 'Attendance created successfully',
    data: result,
  });
});

/**
 * Get All Attendance
 */
const getAll = catchAsync(async (req: Request, res: Response) => {
  const result = await DailyAttendanceService.getAllFromDB(req.query);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Attendance retrieved successfully',
    pagination: result.pagination,
    data: result.data,
  });
});

/**
 * Get Attendance By ID
 */
const getById = catchAsync(async (req: Request, res: Response) => {
  const result = await DailyAttendanceService.getByIdFromDB(
    req.params?.id as string
  );

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Attendance retrieved successfully',
    data: result,
  });
});

/**
 * Update Attendance
 */
const update = catchAsync(async (req: Request, res: Response) => {
  const id = req?.params?.id as string;

  const result = await DailyAttendanceService.updateInDB(id, req.body);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Attendance updated successfully',
    data: result,
  });
});

/**
 * Delete Attendance
 */
const remove = catchAsync(async (req: Request, res: Response) => {
  const result = await DailyAttendanceService.deleteFromDB(
    req.params?.id as string
  );

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Attendance deleted successfully',
    data: result,
  });
});

const attendanceOverview = catchAsync(async (req: Request, res: Response) => {
  const result = await DailyAttendanceService.attendanceOverview(req?.user?.id);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Attendance overview retrieved successfully',
    data: result,
  });
});

export const DailyAttendanceController = {
  create,
  getAll,
  getById,
  update,
  remove,
  attendanceOverview
};