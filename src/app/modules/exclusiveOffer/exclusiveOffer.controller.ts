import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { ExclusiveOfferService } from './exclusiveOffer.service';
import {
  getMultipleFilesPath,
  getSingleFilePath,
} from '../../../shared/getFilePath';
import { USER_ROLES } from '../../../enums/user';

const create = catchAsync(async (req: Request, res: Response) => {
  const image = getMultipleFilesPath(req.files, 'image');
  const { user: bodyUser, ...rest } = req.body;

  const isPartner = req.user?.role === USER_ROLES.PARTNER;

  const data = {
    ...rest,
    ...(image ? { image } : {}),
    user: isPartner ? req.user?.id : bodyUser,
    status: isPartner ? "pending" : "approved",
    published: isPartner ? false : true,
  };

  const result = await ExclusiveOfferService.createToDB(data);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.CREATED,
    message: 'Exclusive offer created successfully',
    data: result,
  });
});

const getAll = catchAsync(async (req: Request, res: Response) => {
  const result = await ExclusiveOfferService.getAllFromDB(
    req.query,
    req?.user?.id as string,
    req?.user?.role,
  );

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Exclusive offers retrieved successfully',
    //@ts-ignore
    pagination: result.pagination,
    data: result.data,
  });
});

const getMyOffers = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.id;

  if (!userId) {
    throw new Error('User ID not found');
  }

  const result = await ExclusiveOfferService.getMyOffersFromDB(
    req.query,
    userId,
    req?.user?.role,
  );

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Exclusive offer retrieved successfully',
    data: result,
  });
});

const getById = catchAsync(async (req: Request, res: Response) => {
  const result = await ExclusiveOfferService.getByIdFromDB(
    req.params?.id as string,
    req?.user?.id
  );

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Exclusive offer retrieved successfully',
    data: result,
  });
});

const update = catchAsync(async (req: Request, res: Response) => {
  const id = req?.params?.id;
  const image = getMultipleFilesPath(req.files, 'image');

  const data = {
    ...req.body,
    ...(image && { image }),
  };

  const result = await ExclusiveOfferService.updateInDB(id, data);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Exclusive offer updated successfully',
    data: result,
  });
});

const remove = catchAsync(async (req: Request, res: Response) => {
  const result = await ExclusiveOfferService.deleteFromDB(req.params?.id);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Exclusive offer deleted successfully',
    data: result,
  });
});

const createFavorite = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?._id || req.user?.id; // assuming req.user is populated by auth middleware
  const exclusiveOfferId = req.params?.id;

  const result = await ExclusiveOfferService.createFavourite({
    user: userId,
    exclusiveOffer: exclusiveOfferId,
  });

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Exclusive offer added to favorites successfully',
    data: result,
  });
});

const getFavourites = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.id;

  if (!userId) {
    throw new Error('User ID not found');
  }

  const result = await ExclusiveOfferService.getFavouritesFromDB(
    userId,
    req.query,
  );

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Favourite exclusive offers retrieved successfully',
    pagination: result.pagination,
    data: result.data,
  });
});

export const ExclusiveOfferController = {
  create,
  getAll,
  getById,
  update,
  remove,
  createFavorite,
  getFavourites,
  getMyOffers,
};
