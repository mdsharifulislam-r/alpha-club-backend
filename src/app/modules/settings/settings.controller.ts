import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { SettingsService } from './settings.service';

const upsertAbout = catchAsync(async (req: Request, res: Response) => {
  const { description } = req.body;
  
  const result = await SettingsService.upsertAbout(description);
  
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'About updated successfully',
    data: result.about,
  });
});

const upsertPrivacyPolicy = catchAsync(async (req: Request, res: Response) => {
  const { description } = req.body;
  
  const result = await SettingsService.upsertPrivacyPolicy(description);
  
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Privacy policy updated successfully',
    data: result.privacy_policy,
  });
});

const upsertTermsOfServices = catchAsync(async (req: Request, res: Response) => {
  const { description } = req.body;
  
  const result = await SettingsService.upsertTermsOfServices(description);
  
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Terms of services updated successfully',
    data: result.terms_of_services,
  });
});

const getAbout = catchAsync(async (req: Request, res: Response) => {
  const result = await SettingsService.getAbout();
  
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'About retrieved successfully',
    data: result,
  });
});

const getPrivacyPolicy = catchAsync(async (req: Request, res: Response) => {
  const result = await SettingsService.getPrivacyPolicy();
  
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Privacy policy retrieved successfully',
    data: result,
  });
});

const getTermsOfServices = catchAsync(async (req: Request, res: Response) => {
  const result = await SettingsService.getTermsOfServices();
  
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Terms of services retrieved successfully',
    data: result,
  });
});

export const SettingsController = {
  upsertAbout,
  upsertPrivacyPolicy,
  upsertTermsOfServices,
  getAbout,
  getPrivacyPolicy,
  getTermsOfServices,
};

