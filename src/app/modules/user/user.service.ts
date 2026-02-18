import { StatusCodes } from 'http-status-codes';
import ApiError from '../../../errors/ApiError';
import { emailHelper } from '../../../helpers/emailHelper';
import { emailTemplate } from '../../../shared/emailTemplate';
import unlinkFile, { unlinkFiles } from '../../../shared/unlinkFile';
import generateOTP from '../../../util/generateOTP';
import { IUser } from './user.interface';
import { User } from './user.model';
import QueryBuilder from '../../builder/QueryBuilder';
import { userSearchableField } from './user.constant';
import { Event } from '../event/event.model';
import { ExclusiveOffer } from '../exclusiveOffer/exclusiveOffer.model';
import { Club } from '../club/club.model';
import { MemberShipApplication } from '../membershipApplication/membershipApplication.model';
import { Notification } from '../notification/notification.mode';
import { NotificationCount } from '../notification/notificationCountModel';
import { USER_ROLES } from '../../../enums/user';
import admin from '../../../helpers/firebaseConfig';
import { UserProfileUpdateRequest } from './user.profileUpdateRequest';

const createUserToDB = async (
  payload: Partial<IUser>
): Promise<{ message: string }> => {

  // Check if user already exists by email
  if (!payload.email) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Email is required');
  }
  const isExistUser = await User.findOne({ email: payload.email });
  if (isExistUser) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      'User already exists with this email'
    );
  }

  // Check password and confirmPassword match
  if (payload.password !== payload.confirmPassword) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Passwords do not match');
  }

  // Create user
  const createUser = await User.create(payload);
  if (!createUser) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Failed to create user');
  }

  // Send verification email
  const otp = generateOTP();
  const value = {
    otp,
    email: createUser.email,
    name: createUser.name,
  };
  const verifyAccount = emailTemplate.verifyAccount(value);
  emailHelper.sendEmail(verifyAccount);

  // Save OTP and expiry to DB
  const authentication = {
    oneTimeCode: otp,
    expireAt: new Date(Date.now() + 3 * 60000),
  };
  await User.findByIdAndUpdate(createUser._id, { $set: { authentication } });

  return { message: 'User created successfully' };
};

// const sendNotificationToUsers = async (message: string,fcmToken?:string,  usersId: string[] = []) => {
//   const users = usersId.length
//     ? await User.find({
//       _id: { $in: usersId },
//       status: "active",
//     })
//     : await User.find({
//       status: "active",
//       role: { $nin: [USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN] },
//     }) as IUser[];

//  for (const user of users) {
//   // ✅ Use user's own FCM token
//   if (user.fcmToken) {
//     try {
//       const messageInfo = {
//         token: user.fcmToken,
//         notification: {
//           title: "New Notification",
//           body: message,
//         },
//         data: {
//           receiver: String(user._id),
//           sender: "system",
//           title: message,
//           path: "/notifications",
//         },
//       };
//       await admin.messaging().send(messageInfo);
//     } catch (error) {
//       console.error("FCM send error:", error);
//     }
//   }

//   // DB Notification
//   Notification.create({
//     receiver: user._id,
//     title: "New Notification",
//     message,
//     sender: null,
//     path: "/notifications",
//     seen: false,
//   }).catch(() => {});

//   NotificationCount.findOneAndUpdate(
//     { user: user._id },
//     { $inc: { count: 1 } },
//     { new: true, upsert: true }
//   ).catch(() => {});
// }

// };

const sendNotificationToUsers = async (
  message: string,
  usersId: string[] = []
) => {
  const users = usersId.length
    ? await User.find({ _id: { $in: usersId }, status: 'active' })
        .select('fcmToken _id role active')
        .lean()
    : ((await User.find({
        status: 'active',
        role: { $nin: [USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN] },
      })
        .select('fcmToken _id role active')
        .lean()) as IUser[]);


  // Push notifications
  const pushResults = await Promise.allSettled(
    users
      .filter(user => user.fcmToken)
      .map(user =>
        admin.messaging().send({
          token: user.fcmToken!,
          notification: {
            title: 'New Notification',
            body: message,
          },
          data: {
            receiver: String(user._id),
            sender: 'system',
            path: '/notifications',
          },
        })
      )
  );

  // DB operations (with logging)
  await Promise.allSettled(
    users.map(async user => {
      try {
        await Notification.create({
          receiver: user._id,
          title: 'New Notification',
          message,
          refId: user._id,
          sender: null,
          path: '/notifications',
          seen: false,
        });

        await NotificationCount.findOneAndUpdate(
          { user: user._id },
          { $inc: { count: 1 } },
          { new: true, upsert: true }
        );
      } catch (err) {
        console.error('Notification DB error for user:', user._id, err);
      }
    })
  );
};

const updateUserToDB = async (
  userId: string,
  payload: Partial<IUser>
): Promise<IUser | null> => {
  const isExistUser = await User.findById(userId);
  if (!isExistUser) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "User doesn't exist!");
  }

  // unlink old image ONLY if image changed
  if (
    payload.profileImage &&
    isExistUser.profileImage &&
    isExistUser.profileImage !== payload.profileImage
  ) {
    unlinkFile(isExistUser.profileImage);
  }

  // prevent empty update
  if (Object.keys(payload).length === 0) {
    return isExistUser;
  }

  if (payload?.fcmToken) {
    await User.findOneAndUpdate(
      { _id: userId },
      { $set: payload },
      {
        new: true,
        runValidators: true,
        strict: true,
      }
    );
  } else {
    const updateUserRequest = await UserProfileUpdateRequest.findOneAndUpdate(
      { user: userId },
      { $set: payload },
      {
        new: true,
        runValidators: true,
        strict: true,
        upsert: true, // 👈 create if not found
      }
    );

    // 🔔 Notify all admins
    const admins = await User.find({
      role: { $in: [USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN] },
    });

    for (const admin of admins) {
      Notification.create({
        receiver: admin._id,
        title: 'User Profile Update Request',
        message: `${
          isExistUser.name || 'A user'
        } submitted a profile update request.`,
        sender: isExistUser._id,
        refId: updateUserRequest?._id,
        path: '/users', // admin page to review requests
        seen: false,
      }).catch(() => {});

      // 🔢 Increment notification count
      NotificationCount.findOneAndUpdate(
        { user: admin._id },
        { $inc: { count: 1 } },
        { new: true, upsert: true }
      ).catch(() => {});
    }
  }

  return isExistUser;
};

const updateSingleUserToDB = async (
  userId: string,
  payload: Partial<IUser>
): Promise<IUser | null> => {

  const isExistUser = await User.findById(userId);
  if (!isExistUser) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "User doesn't exist!");
  }

  // unlink old image ONLY if image changed
  if (
    payload.profileImage &&
    isExistUser.profileImage &&
    isExistUser.profileImage !== payload.profileImage
  ) {
    unlinkFile(isExistUser.profileImage);
  }

  // prevent empty update
  if (Object.keys(payload).length === 0) {
    return isExistUser;
  }

  const updatedUser = await User.findOneAndUpdate(
    { _id: userId },
    { $set: payload },
    {
      new: true,
      runValidators: true,
      strict: true,
    }
  );

  return updatedUser;
};

const getAllUsers = async (query: Record<string, any>, userId: string) => {
  const result = new QueryBuilder(User.find({ _id: { $ne: userId } }), query)
    .paginate()
    .search(userSearchableField)
    .fields()
    .filter()
    .sort();

  const data = await result.modelQuery
    .populate('application_form', 'membershipType')
    .populate('profileUpdateRequest'); // ✅ added

  const pagination = await result.getPaginationInfo();

  return {
    pagination,
    data,
  };
};

const getProfile = async (userId: string) => {
  const user = await User.findOne({ _id: userId })
    .populate({ path: 'application_form' })
    .lean();
  if (!user) {
    throw new ApiError(500, 'User not found');
  }
  return user;
};

const approvePendingUser = async (userId: string, status: string) => {
  const updateUserRequest = await UserProfileUpdateRequest.findOne({
    user: userId,
    status: 'pending',
  });

  if (!updateUserRequest) {
    throw new ApiError(404, 'Profile update request not found');
  }

  const updatedInfo: Record<string, any> = {};

  if (updateUserRequest.name) {
    updatedInfo.name = updateUserRequest.name;
  }

  if (updateUserRequest.profileImage) {
    updatedInfo.profileImage = updateUserRequest.profileImage;
  }

  if (status !== 'rejected') {
    const user = await User.findOneAndUpdate(
      { _id: userId },
      { $set: updatedInfo },
      { new: true }
    );

    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    if (updateUserRequest.name) {
      await MemberShipApplication.findByIdAndUpdate(user.application_form, {
        name: updateUserRequest.name,
      });
    }
  }

  await UserProfileUpdateRequest.findOneAndDelete({ user: userId });

  if (userId) {
    const message =
      status !== 'approved'
        ? 'Your profile update request has been approved.'
        : 'Your profile update request has been rejected.';

    Notification.create({
      receiver: userId,
      title: 'Profile Update Request',
      message,
      sender: null, // system notification
      refId: updateUserRequest._id,
      path: '/profile',
      seen: false,
    }).catch(() => {});

    // Update notification count
    NotificationCount.findOneAndUpdate(
      { user: userId },
      { $inc: { count: 1 } },
      { new: true, upsert: true }
    ).catch(() => {});
  }
  return updateUserRequest;
};

const getStatistics = async (year?: string) => {
  // Get total counts
  const totalUser = await User.countDocuments();
  const totalEvent = await Event.countDocuments();
  const totalExclusiveOffer = await ExclusiveOffer.countDocuments();
  const totalClubs = await Club.countDocuments();

  // Determine the year to use
  const targetYear = year ? parseInt(year) : new Date().getFullYear();
  const startDate = new Date(targetYear, 0, 1); // January 1st of the year
  const endDate = new Date(targetYear, 11, 31, 23, 59, 59, 999); // December 31st of the year

  // Get user statistics by month for the specified year
  const userStats = await User.aggregate([
    {
      $match: {
        createdAt: {
          $gte: startDate,
          $lte: endDate,
        },
      },
    },
    {
      $group: {
        _id: { $month: '$createdAt' },
        count: { $sum: 1 },
      },
    },
    {
      $sort: { _id: 1 },
    },
  ]);

  // Create a map of month number to count
  const monthMap = new Map<number, number>();
  userStats.forEach(stat => {
    monthMap.set(stat._id, stat.count);
  });

  // Format as month names (jan, feb, mar, etc.)
  const monthNames = [
    'jan',
    'feb',
    'mar',
    'apr',
    'may',
    'jun',
    'jul',
    'aug',
    'sep',
    'oct',
    'nov',
    'dec',
  ];

  const userStatistics: Record<string, number> = {};
  monthNames.forEach((month, index) => {
    userStatistics[month] = monthMap.get(index + 1) || 0;
  });

  return {
    totalUser,
    totalEvent,
    totalExclusiveOffer,
    totalClubs,
    year: targetYear,
    userStatistics,
  };
};
export const UserService = {
  createUserToDB,
  getAllUsers,
  updateUserToDB,
  getProfile,
  getStatistics,
  updateSingleUserToDB,
  sendNotificationToUsers,
  approvePendingUser,
};
