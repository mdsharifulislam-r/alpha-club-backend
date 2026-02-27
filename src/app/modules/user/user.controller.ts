import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../../shared/catchAsync';
import { getMultipleFilesPath, getSingleFilePath } from '../../../shared/getFilePath';
import sendResponse from '../../../shared/sendResponse';
import { UserService } from './user.service';
import { USER_ROLES } from '../../../enums/user';


//create user
const createNewUser = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {

    const {email, name , password , confirmPassword } = req.body;
     await UserService.createUserToDB({email, name , password, confirmPassword});

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: 'User Created successfully. Please check your email to activate your account'
    });
  }
);

//update profile
const updateUser = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {

    const userId = req.user?.id;
    let profileImage = getSingleFilePath(req.files, 'profileImage');

    const { name, preferences, restaurant_crowd_status , status, fcmToken} = req.body;

    const data: any = {};

    if (profileImage) data.profileImage = profileImage;
    if (name != null) data.name = name;
    if (fcmToken != null) data.fcmToken = fcmToken;
    if (preferences != null) data.preferences = preferences;
    if (restaurant_crowd_status != null) data.restaurant_crowd_status = restaurant_crowd_status;
    if(req?.user?.role === USER_ROLES.SUPER_ADMIN && req?.body?.role != null) data.role = req?.body?.role

    const result = await UserService.updateUserToDB(userId, data);

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: 'User updated successfully',
      data: result,
    });
  }
);

//update single user
const updateSingleUser = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {

    const userId = req.params?.id;
    let profileImage = getSingleFilePath(req.files, 'profileImage');

    const { name, preferences, restaurant_crowd_status, status} = req.body;

    const data: any = {};

    if (profileImage) data.profileImage = profileImage;
    if (name != null) data.name = name;
    if (preferences != null) data.preferences = preferences;
    if (restaurant_crowd_status != null) data.restaurant_crowd_status = restaurant_crowd_status;
    if(req?.user?.role === USER_ROLES.SUPER_ADMIN && req?.body?.role != null) data.role = req?.body?.role
    if (status) data.status = status

    const result = await UserService.updateSingleUserToDB(userId, data);

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: 'User updated successfully',
      data: result,
    });
  }
);

// GET all users
const getAllUsers = catchAsync(async (req: Request, res: Response) => {
  const result = await UserService.getAllUsers(req.query , req.user?.id);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Users retrieved successfully',
    data: result,
  });
});

// GET profile users
const getProfile = catchAsync(async (req: Request, res: Response) => {
  const result = await UserService.getProfile(req.user?.id);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Users profile retrive successfully',
    data: result,
  });
});

const getStatistics = catchAsync(async (req: Request, res: Response) => {
  const year = req.query.year as string | undefined;
  
  const result = await UserService.getStatistics(year);
  
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Statistics retrieved successfully',
    data: result,
  });
});


const sendNotificationToUsers = catchAsync(async (req: Request, res: Response) => {
  const result = await UserService.sendNotificationToUsers(req.body?.message, req.body?.usersId);
  
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Notification send successfully',
    data: result,
  });
});


const approvePendingUser = catchAsync(async (req: Request, res: Response) => {
  const result = await UserService.approvePendingUser(req.params?.id,req?.body?.status);
  
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'User approved successfully',
    data: result,
  });
});

const getAllPartnersUsers = catchAsync(async (req: Request, res: Response) => {
  const result = await UserService.getAllPartnersUsers(req.query , req.user?.id);
  
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Users retrieved successfully',
    data: result,
  });
});


export const UserController = {
  updateUser,
  createNewUser,
  getAllUsers,
  getProfile,
  getStatistics,
  updateSingleUser,
  sendNotificationToUsers,
  approvePendingUser,
  getAllPartnersUsers
};
