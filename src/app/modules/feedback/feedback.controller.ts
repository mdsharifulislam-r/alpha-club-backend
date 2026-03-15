import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import { FeedbackService } from "./feedback.service";

// ✅ Create new feedback
const createFeedback = catchAsync(async (req: Request, res: Response) => {
  const { partner, rating, comment } = req.body;

  const result = await FeedbackService.createFeedback({
    partner,
    rating,
    comment,
  });

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.CREATED,
    message: "Feedback created successfully",
    data: result,
  });
});

// ✅ Get all feedbacks
const getAllFeedbacks = catchAsync(async (req: Request, res: Response) => {
  const result = await FeedbackService.getAllFeedbacks(req.query);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: "Feedbacks retrieved successfully",
    pagination: result.pagination,
    data: result.data,
  });
});

// ✅ Get feedback by ID
const getFeedbackById = catchAsync(async (req: Request, res: Response) => {
  const result = await FeedbackService.getFeedbackById(req.params.id);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: "Feedback retrieved successfully",
    data: result,
  });
});

// ✅ Update feedback
const updateFeedback = catchAsync(async (req: Request, res: Response) => {
  const { partner, rating, comment } = req.body;

  const result = await FeedbackService.updateFeedback(req.params.id, {
    partner,
    rating,
    comment,
  });

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: "Feedback updated successfully",
    data: result,
  });
});

// ✅ Delete feedback
const deleteFeedback = catchAsync(async (req: Request, res: Response) => {
  const result = await FeedbackService.deleteFeedback(req.params.id);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: "Feedback deleted successfully",
    data: result,
  });
});

const overview = catchAsync(async (req: Request, res: Response) => {
  const result = await FeedbackService.getPartnerOverView(req?.user?.id);
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: "Feedback overview retrieved successfully",
    data: result,
  });
})

export const FeedbackController = {
  createFeedback,
  getAllFeedbacks,
  getFeedbackById,
  updateFeedback,
  deleteFeedback,
  overview
};