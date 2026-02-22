import ApiError from '../../../errors/ApiError';
import { StatusCodes } from 'http-status-codes';
import QueryBuilder from '../../builder/QueryBuilder';
import { IExclusiveOffer } from './exclusiveOffer.interface';
import { ExclusiveOffer } from './exclusiveOffer.model';
import { getLatLongWithLocalRequest } from './exclusiveOffer.util';
import { FavouriteExclusiveOffer } from './favourite/favouriteExclusiveOffer.model';
import mongoose from 'mongoose';
import { USER_ROLES } from '../../../enums/user';

const createToDB = async (payload: IExclusiveOffer) => {
  const { latitude, longitude } = await getLatLongWithLocalRequest(
    String(payload.address)
  );
  payload.location = {
    type: 'Point',
    coordinates: [longitude, latitude], // [lng, lat]
  };
  return await ExclusiveOffer.create(payload);
};

// const getAllFromDB = async (query: Record<string, any>, userId: string) => {
//   const { lat, lng, maxKm, minKm, category } = query;

//   let data: any[] = [];
//   let pagination = {};

//   if (lat && lng) {
//     const geoNearQuery: any = {
//       near: {
//         type: 'Point',
//         coordinates: [Number(lng), Number(lat)],
//       },
//       distanceField: 'distance',
//       spherical: true,
//       ...(maxKm ? { maxDistance: Number(maxKm) * 1000 } : {}),
//       ...(minKm ? { minDistance: Number(minKm) * 1000 } : {}),
//     };

//     const aggregationStages: any[] = [
//       { $geoNear: geoNearQuery }
//     ];

//     aggregationStages.push(
//       {
//         $lookup: {
//           from: 'categories',
//           localField: 'category',
//           foreignField: '_id',
//           as: 'category',
//         },
//       },
//       {
//         $unwind: {
//           path: '$category',
//           preserveNullAndEmptyArrays: true,
//         },
//       }
//     );

//     // Filter by category
//     if (category) {
//       const mongoose = require('mongoose');
//       const catId = /^[a-fA-F0-9]{24}$/.test(category)
//         ? new mongoose.Types.ObjectId(category)
//         : category;

//       aggregationStages.push({
//         $match: { 'category._id': catId },
//       });
//     }

//     // 🔥 Favourite lookup
//     aggregationStages.push({
//       $lookup: {
//         from: 'favouriteexclusiveoffers',
//         let: { offerId: '$_id' },
//         pipeline: [
//           {
//             $match: {
//               $expr: {
//                 $and: [
//                   { $eq: ['$exclusiveOffer', '$$offerId'] },
//                   { $eq: ['$user', userId] },
//                 ],
//               },
//             },
//           },
//         ],
//         as: 'favourite',
//       },
//     });

//     aggregationStages.push({
//       $addFields: {
//         isFavourite: { $gt: [{ $size: '$favourite' }, 0] },
//       },
//     });

//     aggregationStages.push(
//       {
//         $project: {
//           favourite: 0,
//           distance: 1,
//           image: 1,
//           name: 1,
//           discount: 1,
//           title: 1,
//           location: 1,
//           isFavourite: 1,
//           category: {
//             _id: 1,
//             name: 1,
//           },
//         },
//       }
//     );

//     // Pagination
//     const page = Number(query.page) || 1;
//     const limit = Number(query.limit) || 10;
//     const skip = (page - 1) * limit;

//     const countAggregation = [...aggregationStages, { $count: 'total' }];
//     const totalResult = await ExclusiveOffer.aggregate(countAggregation);
//     const total = totalResult[0]?.total || 0;

//     data = await ExclusiveOffer.aggregate([
//       ...aggregationStages,
//       { $skip: skip },
//       { $limit: limit },
//     ]);

//     pagination = {
//       total,
//       limit,
//       page,
//       totalPage: Math.ceil(total / limit),
//     };
//   }

//  else {
//     let modelQuery = ExclusiveOffer.find()
//       .select('name title image discount') as any;

//     const qb = new QueryBuilder(modelQuery, { ...query })
//       .paginate()
//       .search(['name', 'title'])
//       .filter(['lat', 'lng', 'km', 'minKm'])
//       .sort();

//     data = await qb.modelQuery
//       .populate('category', 'name')
//       .lean();

//     pagination = await qb.getPaginationInfo();

//     const offerIds = data.map((offer: any) => offer._id);

//     const favs = await FavouriteExclusiveOffer.find(
//       {
//         user: userId,
//         exclusiveOffer: { $in: offerIds },
//       },
//       'exclusiveOffer'
//     ).lean();

//     const favSet = new Set(
//       favs.map((f: any) => String(f.exclusiveOffer))
//     );

//     console.log(userId)

//     data = data.map((offer: any) => ({
//       ...offer,
//       isFavourite: favSet.has(String(offer._id)),
//     }));
//   }

//   return { pagination, data };
// };
// const getAllFromDB = async (query: Record<string, any>) => {
//   const { lat, lng, maxKm, minKm, category } = query;

//   let data: any[] = [];
//   let pagination = {};

//   if (lat && lng) {
//     // Build geoNear base
//     const geoNearQuery: any = {
//       near: {
//         type: 'Point',
//         coordinates: [Number(lng), Number(lat)],
//       },
//       distanceField: 'distance',
//       spherical: true,
//       ...(maxKm ? { maxDistance: Number(maxKm) * 1000 } : {}),
//       ...(minKm ? { minDistance: Number(minKm) * 1000 } : {}),
//     };

//     const aggregationStages: any[] = [{ $geoNear: geoNearQuery }];

//     aggregationStages.push(
//       {
//         $lookup: {
//           from: 'categories',
//           localField: 'category',
//           foreignField: '_id',
//           as: 'category',
//         },
//       },
//       {
//         $unwind: {
//           path: '$category',
//           preserveNullAndEmptyArrays: true,
//         },
//       },
//       {
//         $project: {
//           distance: 1,
//           image: 1,
//           name: 1,
//           discount: 1,
//           title: 1,
//           category: {
//             _id: 1,
//             name: 1,
//           },
//           location: 1,
//         },
//       }
//     );

//     // Pagination settings
//     const page = Number(query.page) || 1;
//     const limit = Number(query.limit) || 10;
//     const skip = (page - 1) * limit;

//     // Count total after geoNear (no match by category)
//     const countAggregation = [...aggregationStages, { $count: 'total' }];
//     const totalResult = await ExclusiveOffer.aggregate(countAggregation).exec();
//     const total = totalResult[0]?.total || 0;

//     // Results with pagination
//     data = await ExclusiveOffer.aggregate([
//       ...aggregationStages,
//       { $skip: skip },
//       { $limit: limit },
//     ]).exec();

//     pagination = {
//       total,
//       limit,
//       page,
//       totalPage: Math.ceil(total / limit),
//     };
//   }
//  else {
//     let modelQuery = ExclusiveOffer.find().select('name title image discount') as any;

//     const qb = new QueryBuilder(modelQuery, { ...query })
//       .paginate()
//       .search(['name', 'title'])
//       .filter(['lat', 'lng', 'km', 'minKm'])
//       .sort();

//     data = await qb.modelQuery.populate('category', 'name');
//     pagination = await qb.getPaginationInfo();
//   }

//   return { pagination, data };
// };

const getAllFromDB = async (query: Record<string, any>, userId: string, role: string) => {
  const { lat, lng, maxKm, minKm, category } = query;

  let data: any[] = [];
  let pagination: any = {};

  // If the user's role is 'USER', only fetch published offers
  if (role && role === USER_ROLES.USER || role === USER_ROLES.PARTNER) {
    query.published = true;
    query.status = true;
  }

  if (lat && lng) {
    const userObjectId = new mongoose.Types.ObjectId(userId);

    const geoNearQuery: any = {
      near: {
        type: 'Point',
        coordinates: [Number(lng), Number(lat)],
      },
      distanceField: 'distance',
      spherical: true,
      ...(maxKm ? { maxDistance: Number(maxKm) * 1000 } : {}),
      ...(minKm ? { minDistance: Number(minKm) * 1000 } : {}),
      ...(query.published !== undefined ? { query: { published: query.published } } : {}),
    };

    const aggregationStages: any[] = [{ $geoNear: geoNearQuery }];

    aggregationStages.push(
      {
        $lookup: {
          from: 'categories',
          localField: 'category',
          foreignField: '_id',
          as: 'category',
        },
      },
      {
        $unwind: {
          path: '$category',
          preserveNullAndEmptyArrays: true,
        },
      }
    );

    // Filter by category
    if (category) {
      const catId = /^[a-fA-F0-9]{24}$/.test(category)
        ? new mongoose.Types.ObjectId(category)
        : category;

      aggregationStages.push({
        $match: { 'category._id': catId },
      });
    }

    // Favourite lookup (FIXED ObjectId comparison)
    aggregationStages.push({
      $lookup: {
        from: 'favouriteexclusiveoffers',
        let: { offerId: '$_id' },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ['$exclusiveOffer', '$$offerId'] },
                  { $eq: ['$user', userObjectId] },
                ],
              },
            },
          },
        ],
        as: 'favourite',
      },
    });

    aggregationStages.push({
      $addFields: {
        isFavourite: { $gt: [{ $size: '$favourite' }, 0] },
      },
    });

    aggregationStages.push({
      $project: {
        distance: 1,
        image: 1,
        name: 1,
        discount: 1,
        title: 1,
        location: 1,
        isFavourite: 1,
        description: 1,
        published:1,
        status:1,
        category: {
          _id: 1,
          name: 1,
        },
      },
    });

    // Pagination
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;
    const skip = (page - 1) * limit;

    const countAggregation = [...aggregationStages, { $count: 'total' }];
    const totalResult = await ExclusiveOffer.aggregate(countAggregation);
    const total = totalResult[0]?.total || 0;

    data = await ExclusiveOffer.aggregate([
      ...aggregationStages,
      { $skip: skip },
      { $limit: limit },
    ]);

    pagination = {
      total,
      limit,
      page,
      totalPage: Math.ceil(total / limit),
    };
  } else {
    let modelQuery = ExclusiveOffer.find().select(
      'name title image discount description location address published status'
    ) as any;

    const qb = new QueryBuilder(modelQuery, { ...query })
      .paginate()
      .search(['name', 'title'])
      .filter(['lat', 'lng', 'km', 'minKm'])
      .sort();

    data = await qb.modelQuery.populate('category', 'name').lean();

    pagination = await qb.getPaginationInfo();

    const offerIds = data.map((offer: any) => offer._id);

    const favs = await FavouriteExclusiveOffer.find(
      {
        user: userId,
        exclusiveOffer: { $in: offerIds },
      },
      'exclusiveOffer'
    ).lean();

    const favSet = new Set(favs.map((f: any) => String(f.exclusiveOffer)));

    data = data.map((offer: any) => ({
      ...offer,
      isFavourite: favSet.has(String(offer._id)),
    }));
  }

  return { pagination, data };
};
const getMyOffersFromDB = async (query: Record<string, any>, userId: string, role: string) => {
  const { lat, lng, maxKm, minKm, category } = query;

  console.log(query,'my  -query');
  let data: any[] = [];
  let pagination: any = {};

  // If the user's role is 'USER', only fetch published offers
  if (role && role === USER_ROLES.USER) {
    query.published = true;
  }
  query.user = userId;

  if (lat && lng) {
    const userObjectId = new mongoose.Types.ObjectId(userId);

    const geoNearQuery: any = {
      near: {
        type: 'Point',
        coordinates: [Number(lng), Number(lat)],
      },
      distanceField: 'distance',
      spherical: true,
      ...(maxKm ? { maxDistance: Number(maxKm) * 1000 } : {}),
      ...(minKm ? { minDistance: Number(minKm) * 1000 } : {}),
      ...(query.published !== undefined ? { query: { published: query.published } } : {}),
    };

    const aggregationStages: any[] = [{ $geoNear: geoNearQuery }];

    aggregationStages.push(
      {
        $lookup: {
          from: 'categories',
          localField: 'category',
          foreignField: '_id',
          as: 'category',
        },
      },
      {
        $unwind: {
          path: '$category',
          preserveNullAndEmptyArrays: true,
        },
      }
    );

    // Filter by category
    if (category) {
      const catId = /^[a-fA-F0-9]{24}$/.test(category)
        ? new mongoose.Types.ObjectId(category)
        : category;

      aggregationStages.push({
        $match: { 'category._id': catId },
      });
    }

    // Favourite lookup (FIXED ObjectId comparison)
    aggregationStages.push({
      $lookup: {
        from: 'favouriteexclusiveoffers',
        let: { offerId: '$_id' },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ['$exclusiveOffer', '$$offerId'] },
                  { $eq: ['$user', userObjectId] },
                ],
              },
            },
          },
        ],
        as: 'favourite',
      },
    });

    aggregationStages.push({
      $addFields: {
        isFavourite: { $gt: [{ $size: '$favourite' }, 0] },
      },
    });

    aggregationStages.push({
      $project: {
        distance: 1,
        image: 1,
        name: 1,
        discount: 1,
        title: 1,
        location: 1,
        isFavourite: 1,
        description: 1,
        published:1,
        status:1,
        category: {
          _id: 1,
          name: 1,
        },
      },
    });

    // Pagination
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;
    const skip = (page - 1) * limit;

    const countAggregation = [...aggregationStages, { $count: 'total' }];
    const totalResult = await ExclusiveOffer.aggregate(countAggregation);
    const total = totalResult[0]?.total || 0;

    data = await ExclusiveOffer.aggregate([
      ...aggregationStages,
      { $skip: skip },
      { $limit: limit },
    ]);

    pagination = {
      total,
      limit,
      page,
      totalPage: Math.ceil(total / limit),
    };
  } else {
    let modelQuery = ExclusiveOffer.find().select(
      'name title image discount description location address published status'
    ) as any;

    const qb = new QueryBuilder(modelQuery, { ...query })
      .paginate()
      .search(['name', 'title'])
      .filter(['lat', 'lng', 'km', 'minKm'])
      .sort();

    data = await qb.modelQuery.populate('category', 'name').lean();

    pagination = await qb.getPaginationInfo();

    const offerIds = data.map((offer: any) => offer._id);

    const favs = await FavouriteExclusiveOffer.find(
      {
        user: userId,
        exclusiveOffer: { $in: offerIds },
      },
      'exclusiveOffer'
    ).lean();

    const favSet = new Set(favs.map((f: any) => String(f.exclusiveOffer)));

    data = data.map((offer: any) => ({
      ...offer,
      isFavourite: favSet.has(String(offer._id)),
    }));
  }

  return { pagination, data };
};

const getByIdFromDB = async (id: string) => {
  const exclusiveOffer = await ExclusiveOffer.findById(id)
    .populate('category', 'name')
    .lean();

  if (!exclusiveOffer) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Exclusive offer not found');
  }
  return exclusiveOffer;
};

const updateInDB = async (id: string, payload: Partial<IExclusiveOffer> & { removedFiles?: string[] }) => {
  // Always get current document images for update logic
  const existing = await ExclusiveOffer.findById(id).select('image').lean();
  let existingImages: string[] = Array.isArray(existing?.image) ? existing.image.map(String) : [];

  // Handle removing files if removedFiles present in payload
  if (Array.isArray(payload.removedFiles) && payload.removedFiles.length > 0) {
    // Remove any image matching removedFiles from existingImages
    const removedFilesSet = new Set(payload.removedFiles.map(String));
    existingImages = existingImages.filter(img => !removedFilesSet.has(img));
  }

  // Special logic for image updating: append new images if present
  if (payload.hasOwnProperty('image')) {
    let newImages: string[];
    if (Array.isArray(payload.image)) {
      newImages = payload.image.map(img => String(img)).filter(Boolean);
    } else if (payload.image === null || payload.image === undefined) {
      newImages = [];
    } else {
      newImages = [String(payload.image)];
    }

    if (newImages.length > 0) {
      // Combine existing (possibly filtered if removedFiles used) and new, then dedupe
      const combinedImages = Array.from(
        new Set([...existingImages, ...newImages])
      );
      payload.image = combinedImages;
    } else {
      // If nothing new, just keep current (possibly filtered by removedFiles)
      payload.image = existingImages;
    }
  } else if (Array.isArray(payload.removedFiles) && payload.removedFiles.length > 0) {
    // If only removedFiles was given (not a new image array), update with filtered results
    payload.image = existingImages;
  }
  // Else: image property untouched, no update

  // Remove removedFiles from payload to avoid mongoose error (not in schema)
  delete (payload as any).removedFiles;

  const updated = await ExclusiveOffer.findByIdAndUpdate(id, payload, {
    new: true,
    runValidators: true,
  })
    .populate('category', 'name')
    .lean();

  if (!updated) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Exclusive offer not found');
  }
  return updated;
};

const deleteFromDB = async (id: string) => {
  const exclusiveOffer = await ExclusiveOffer.findById(id).lean();
  if (!exclusiveOffer) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Exclusive offer not found');
  }
  const deleted = await ExclusiveOffer.findByIdAndDelete(id).lean();
  return deleted;
};

const createFavourite = async ({
  user,
  exclusiveOffer,
}: {
  user: string;
  exclusiveOffer: string;
}) => {
  // Check if Exclusive Offer exists
  const exclusiveOfferExists = await ExclusiveOffer.findById(
    exclusiveOffer
  ).lean();
  if (!exclusiveOfferExists) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Exclusive offer not found');
  }

  // Check if it's already a favourite for the user (toggle: if so, remove. if not, add)
  const existingFavourite = await FavouriteExclusiveOffer.findOne({
    user,
    exclusiveOffer,
  });

  if (existingFavourite) {
    await FavouriteExclusiveOffer.findByIdAndDelete(existingFavourite._id);
    return { removed: true };
  } else {
    const newFavourite = await FavouriteExclusiveOffer.create({
      user,
      exclusiveOffer,
    });
    return { added: true, favourite: newFavourite };
  }
};

const getFavouritesFromDB = async (
  userId: string,
  query: Record<string, any>
) => {
  const qb = new QueryBuilder(
    FavouriteExclusiveOffer.find({ user: userId }).populate({
      path: 'exclusiveOffer',
      populate: {
        path: 'category',
        select: 'name',
      },
      select: 'name title image description location address discount category',
    }),
    query
  )
    .paginate()
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

export const ExclusiveOfferService = {
  createToDB,
  getAllFromDB,
  getByIdFromDB,
  updateInDB,
  deleteFromDB,
  createFavourite,
  getFavouritesFromDB,
  getMyOffersFromDB
};
