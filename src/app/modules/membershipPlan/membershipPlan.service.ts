import ApiError from '../../../errors/ApiError';
import { StatusCodes } from 'http-status-codes';
import QueryBuilder from '../../builder/QueryBuilder';
import { IMemberShipPlan } from './membershipPlan.interface';
import { MemberShipPlan } from './membershipPlan.model';
import { MemberShipFeature } from './memberShipFeatures/memberShipFeatures.model';
import mongoose from 'mongoose';
import { USER_ROLES } from '../../../enums/user';

const createToDB = async (payload: IMemberShipPlan) => {

  const existingType = await MemberShipPlan.findOne({ membershipType: payload.membershipType });

  if (payload.familyMembershipOptions) {
    try {
      payload.familyMembershipOptions = JSON.parse(payload.familyMembershipOptions as unknown as string);
    } catch (err) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Invalid familyMembershipOptions format. Must be a JSON string.');
    }
  }

  if (existingType) {
    throw new ApiError(StatusCodes.CONFLICT, 'Membership type already exists.');
  }

  return await MemberShipPlan.create(payload);
};


const getAllFromDB = async (query: Record<string, any>, role: string) => {

  if (role === USER_ROLES.USER) {
    query.isActive = true;
  }
  const qb = new QueryBuilder(MemberShipPlan.find().populate({
    path: 'features',
    select: 'icon title description',
    match: { isActive: true },
  }),
    query
  )
    .paginate()
    .search(['title', 'description'])
    .fields()
    .filter()
    .sort();

  const data = await qb.modelQuery.lean();
  const pagination = await qb.getPaginationInfo();

  return {
    pagination,
    data,
  };
};

const getByIdFromDB = async (type: string) => {
  const plan = await MemberShipPlan.findOne({ membershipType: type })
    .populate({
      path: 'features',
      select: 'icon title description',
      match: { isActive: true },
    })
    .lean();

  if (!plan) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Membership plan not found');
  }
  return plan;
};

const updateInDB = async (type: string, payload: Partial<IMemberShipPlan>) => {


  if (payload.familyMembershipOptions) {
    try {
      payload.familyMembershipOptions = JSON.parse(payload.familyMembershipOptions as unknown as string);
    } catch (err) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Invalid familyMembershipOptions format. Must be a JSON string.');
    }
  }

  // Fetch existing plan to check current features
  const existingPlan = await MemberShipPlan.findOne({ membershipType: type }).lean();

  if (!existingPlan) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Membership plan not found');
  }

  if (
    payload.features &&
    Array.isArray(payload.features) &&
    payload.features.length === 1 &&
    Array.isArray(existingPlan.features)
  ) {
    const featureIdToAdd = payload.features[0];
    // Use String comparison to ensure match (ObjectId can be objects/strings)
    const exists = existingPlan.features.some(
      (id: any) => String(id) === String(featureIdToAdd)
    );
    if (!exists) {
      payload.features = [...existingPlan.features, featureIdToAdd];
    } else {
      delete payload.features;
    }
  }

  const updated = await MemberShipPlan.findOneAndUpdate(
    { membershipType: type },
    payload,
    {
      new: true,
      runValidators: true,
    }
  )
    .populate({
      path: 'features',
      select: 'icon title description',
      match: { isActive: true },
    })
    .lean();

  if (!updated) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Membership plan not found');
  }
  return updated;
};

const deleteFromDB = async (type: string) => {
  const plan = await MemberShipPlan.findOne({ membershipType: type }).lean();
  if (!plan) {
    throw new ApiError(StatusCodes.NOT_FOUND, `No membership plan found with type: ${type}`);
  }
  const deleted = await MemberShipPlan.findOneAndDelete({ membershipType: type }).lean();
  return deleted;
};


const featureComparison = async () => {

  // Get all plans with their features and titles
  const plans = await MemberShipPlan.find({})
    .populate({
      path: 'features',
      select: 'title',
      match: { isActive: true },
      options: { lean: true },
    })
    .lean();

  // Prepare a lookup for plan membershipType -> Set<featureId>
  const planFeatureMap: { [membershipType: string]: Set<string> } = {};

  plans.forEach(plan => {
    const type = plan.membershipType;
    const features: any[] = plan.features || [];
    planFeatureMap[type] = new Set(features.map(f => f._id?.toString()));
  });

  // Get all unique features { _id, title }
  // Gather all from all plans, then dedupe by _id
  const allFeaturesArr: { _id: string, title: string }[] = [];
  const featureSeen = new Set();

  plans.forEach(plan => {
    (plan.features || []).forEach((feature: any) => {
      if (feature && feature._id && !featureSeen.has(feature._id.toString())) {
        allFeaturesArr.push({
          _id: feature._id.toString(),
          title: feature.title,
        });
        featureSeen.add(feature._id.toString());
      }
    });
  });

  // Build the comparison
  // For each feature, output: { feature: title, [plan]: boolean ... }
  let comparison: any[] = allFeaturesArr.map(feat => {
    const entry: any = { feature: feat.title };
    let allTrue = true;
    for (const planType of Object.keys(planFeatureMap)) {
      const hasFeature = planFeatureMap[planType].has(feat._id);
      entry[planType] = hasFeature;
      if (!hasFeature) {
        allTrue = false;
      }
    }
    entry._allTrue = allTrue; // Mark for sorting
    return entry;
  });

  // Move all entries with allTrue === true to the top
  comparison = [
    ...comparison.filter(entry => entry._allTrue === true),
    ...comparison.filter(entry => entry._allTrue !== true),
  ].map(({ _allTrue, ...rest }) => rest); // Remove _allTrue from result

  return comparison;
};

export const MemberShipPlanService = {
  createToDB,
  getAllFromDB,
  getByIdFromDB,
  updateInDB,
  deleteFromDB,
  featureComparison
};

