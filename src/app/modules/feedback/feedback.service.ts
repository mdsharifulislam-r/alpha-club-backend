import { StatusCodes } from "http-status-codes";
import ApiError from "../../../errors/ApiError";
import { ITeamContact, TeamContactModel } from "./feedback.interface";
import { Feedback } from "./feedback.model";
import QueryBuilder from "../../builder/QueryBuilder";
import { ExclusiveOffer } from "../exclusiveOffer/exclusiveOffer.model";
import { Event } from "../event/event.model";
import dayjs from "dayjs";
import { FavouriteExclusiveOffer } from "../exclusiveOffer/favourite/favouriteExclusiveOffer.model";
import { RedisHelper } from "../../../tools/redis/redis.helper";

const HOUR = 60 * 60;
const FIVE_MIN = 5 * 60;

// ✅ Create new feedback
const createFeedback = async (payload: ITeamContact) => {
  const feedback = await Feedback.create(payload);
  await RedisHelper.bust('feedbacks:*');
  return feedback.toObject();
};

// ✅ Get all feedbacks with optional pagination/search/filter
const getAllFeedbacks = async (query: Record<string, any>) => {
  const cache = await RedisHelper.redisGet('feedbacks', query);
  if (cache) {
    return cache;
  }

  const qb = new QueryBuilder(Feedback.find(), query)
    .paginate()
    .search(["comment"]) // only search in comment
    .filter(["partner", "rating"]) // optional filters
    .sort()
    .fields();

  const { data, pagination } = await qb.exec(q =>
    q.lean().populate("partner", "name email"),
  );
  const result = { data, pagination };
  await RedisHelper.redisSet('feedbacks', result, query, HOUR);
  return result;
};

// ✅ Get feedback by ID
const getFeedbackById = async (id: string) => {
  const cache = await RedisHelper.redisGet(`feedback:${id}`);
  if (cache) {
    return cache;
  }

  const feedback = await Feedback.findById(id)
    .populate("partner", "name email") // optional: populate partner info
    .lean();

  if (!feedback) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Feedback not found");
  }
  await RedisHelper.redisSet(`feedback:${id}`, feedback, {}, HOUR);
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
  await RedisHelper.bust('feedbacks:*', `feedback:${id}:*`);
  return updated;
};

// ✅ Delete feedback
const deleteFeedback = async (id: string) => {
  const deleted = await Feedback.findByIdAndDelete(id).lean();

  if (!deleted) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Feedback not found");
  }
  await RedisHelper.bust('feedbacks:*', `feedback:${id}:*`);
  return deleted;
};


const getPartnerOverView = async (userId: string) => {
  const cache = await RedisHelper.redisGet(`partner-overview:${userId}`);
  if (cache) {
    return cache;
  }

  const startOfMonth = dayjs().startOf("month").toDate();
  const endOfMonth = dayjs().endOf("month").toDate();

  const [availableOffer, upcomingEvent, favouriteOffer] = await Promise.all([
    ExclusiveOffer.countDocuments({ published: true, status: "approved" }),
    Event.countDocuments({
      eventDate: { $gte: startOfMonth, $lte: endOfMonth },
    }),
    FavouriteExclusiveOffer.countDocuments({ user: userId }),
  ]);

  const data = { availableOffer, upcomingEvent , favouriteOffer};
  await RedisHelper.redisSet(`partner-overview:${userId}`, data, {}, FIVE_MIN);
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