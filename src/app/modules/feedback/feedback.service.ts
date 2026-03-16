import { StatusCodes } from "http-status-codes";
import ApiError from "../../../errors/ApiError";
import { ITeamContact, TeamContactModel } from "./feedback.interface";
import { Feedback } from "./feedback.model";
import QueryBuilder from "../../builder/QueryBuilder";
import { ExclusiveOffer } from "../exclusiveOffer/exclusiveOffer.model";
import { Event } from "../event/event.model";
import dayjs from "dayjs";
import { FavouriteExclusiveOffer } from "../exclusiveOffer/favourite/favouriteExclusiveOffer.model";

// ✅ Create new feedback
const createFeedback = async (payload: ITeamContact) => {
  const feedback = await Feedback.create(payload);
  return feedback.toObject();
};

// ✅ Get all feedbacks with optional pagination/search/filter
const getAllFeedbacks = async (query: Record<string, any>) => {
  const qb = new QueryBuilder(Feedback.find(), query)
    .paginate()
    .search(["comment"]) // only search in comment
    .filter(["partner", "rating"]) // optional filters
    .sort()
    .fields();

  const data = await qb.modelQuery.lean().populate("partner", "name email");
  const pagination = await qb.getPaginationInfo();

  return { data, pagination };
};

// ✅ Get feedback by ID
const getFeedbackById = async (id: string) => {
  const feedback = await Feedback.findById(id)
    .populate("partner", "name email") // optional: populate partner info
    .lean();

  if (!feedback) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Feedback not found");
  }
  return feedback;
};

// ✅ Update feedback
const updateFeedback = async (id: string, payload: Partial<ITeamContact>) => {
  const updated = await Feedback.findByIdAndUpdate(id, payload, {
    new: true,
    runValidators: true,
  }).lean();

  if (!updated) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Feedback not found");
  }
  return updated;
};

// ✅ Delete feedback
const deleteFeedback = async (id: string) => {
  const deleted = await Feedback.findByIdAndDelete(id).lean();

  if (!deleted) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Feedback not found");
  }
  return deleted;
};


const getPartnerOverView = async (userId: string) => {
  const availableOffer = await ExclusiveOffer.countDocuments({ published: true, status: "approved" }).lean();

  const startOfMonth = dayjs().startOf("month").toDate();
  const endOfMonth = dayjs().endOf("month").toDate();

  const upcomingEvent = await Event.countDocuments({
    eventDate: { $gte: startOfMonth, $lte: endOfMonth }
  }).lean();

  const favouriteOffer = await FavouriteExclusiveOffer.countDocuments({user: userId}).lean();

  const data = { availableOffer, upcomingEvent , favouriteOffer};

  return data;
};

export const FeedbackService = {
  createFeedback,
  getAllFeedbacks,
  getFeedbackById,
  updateFeedback,
  deleteFeedback,
  getPartnerOverView
};