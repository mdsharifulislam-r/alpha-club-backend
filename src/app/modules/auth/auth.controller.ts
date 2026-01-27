import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { AuthService } from './auth.service';

// Handles account renewal requests
const renualRequest = catchAsync(async (req: Request, res: Response) => {
  const { phone } = req.body;
  // You may want to handle more fields depending on requirements
  await AuthService.renualRequestToDB(phone);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Your renewal request has been sent.'
  });
});

const verifyOtp = catchAsync(async (req: Request, res: Response) => {
  const { ...verifyData } = req.body;
  const result = await AuthService.verifyOTPToDB(verifyData);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: result.message,
    data: result
  });
});

const verifyResetOtp = catchAsync(async (req: Request, res: Response) => {
  const { ...verifyData } = req.body;
  const result = await AuthService.verifyResetOtp(verifyData);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'OTP sent successfully.',
    data: result
  });
});

const loginUser = catchAsync(async (req: Request, res: Response) => {
  const { ...loginData } = req.body;
  const result = await AuthService.loginUserFromDB(loginData);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'User logged in successfully.',
    data: result
  });
});

const adminLoginUser = catchAsync(async (req: Request, res: Response) => {
  const { ...loginData } = req.body;
  const result = await AuthService.adminloginUserFromDB(loginData);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Admin logged in successfully.',
    data: { token: result.createToken },
  });
});

const forgetPassword = catchAsync(async (req: Request, res: Response) => {
  const email = req.body.email;
  await AuthService.forgetPasswordToDB(email);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Please check your email. We have sent you an OTP.'
  });
});

const resetPassword = catchAsync(async (req: Request, res: Response) => {
  const { ...resetData } = req.body;
  const result = await AuthService.resetPasswordToDB(resetData);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Your password has been successfully reset.',
    data: result,
  });
});

const resendOTPtoDB = catchAsync(async (req: Request, res: Response) => {
  const email = req.body.email;
  await AuthService.resendOTPtoDB(email);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'OTP resend successfully',
  });
});

const changePassword = catchAsync(async (req: Request, res: Response) => {
  const user = req.user;
  const { ...passwordData } = req?.body;
  await AuthService.changePasswordToDB(user, passwordData);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Your password has been successfully changed',
  });
});

export const AuthController = {
  verifyOtp,
  verifyResetOtp,
  loginUser,
  forgetPassword,
  resetPassword,
  resendOTPtoDB,
  changePassword,
  adminLoginUser,
  renualRequest
};
