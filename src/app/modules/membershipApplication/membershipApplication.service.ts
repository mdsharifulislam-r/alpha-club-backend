import ApiError from '../../../errors/ApiError';
import { StatusCodes } from 'http-status-codes';
import QueryBuilder from '../../builder/QueryBuilder';
import { IMemberShipApplication } from './membershipApplication.interface';
import { MemberShipApplication } from './membershipApplication.model';
import { MembershipStatus } from './membershipApplication..constant';
import mongoose from 'mongoose';
import { User } from '../user/user.model';
import { emailHelper } from '../../../helpers/emailHelper';
import { emailTemplate } from '../../../shared/emailTemplate';
import generateRandomPassword from '../../../util/generateRandomPassword';
import { USER_ROLES } from '../../../enums/user';
import { MemberShipPlan } from '../membershipPlan/membershipPlan.model';
import { NotificationCount } from '../notification/notificationCountModel';
import { Notification } from '../notification/notification.mode';

// const createToDB = async (payload: IMemberShipApplication) => {
//   // Check membership plan
//   const plan = await MemberShipPlan.findOne({
//     membershipType: payload.membershipType,
//   });

//   if (!plan) {
//     throw new ApiError(
//       StatusCodes.BAD_REQUEST,
//       `Membership type "${payload.membershipType}" not found`
//     );
//   }

//   if(!plan.familyMembershipOptions?.enableFamilyMembers && payload.familyMembers && payload.familyMembers?.length > 0) {

//     throw new ApiError(
//       StatusCodes.BAD_REQUEST,
//       `Family membership is not enabled for this plan.`
//     );
//   }

//   // Handle family members ONLY if family is enabled
//   if (plan.familyMembershipOptions?.enableFamilyMembers) {
//     const limit = plan.familyMembershipOptions.familyMembershipLimit ?? 0;
//     const count = payload.familyMembers?.length ?? 0;

//     if (count > limit) {
//       throw new ApiError(
//         StatusCodes.BAD_REQUEST,
//         `Family member limit exceeded`
//       );
//     }
//   } else {
//     // If not family membership, ignore familyMembers
//     payload.familyMembers = [];
//   }

//   // Duplicate check by phone number
//   const phoneExists = await MemberShipApplication.findOne({
//     phone: payload.phone,
//     membershipStatus: {
//       $in: [MembershipStatus.PENDING, MembershipStatus.ACTIVE],
//     },
//   });

//   if (phoneExists) {
//     throw new ApiError(
//       StatusCodes.BAD_REQUEST,
//       `You already applied with this phone number`
//     );
//   }

//   // Duplicate check by email
//   const emailExists = await MemberShipApplication.findOne({
//     email: payload.email,
//     membershipStatus: {
//       $in: [MembershipStatus.PENDING, MembershipStatus.ACTIVE],
//     },
//   });

//   if (emailExists) {
//     throw new ApiError(
//       StatusCodes.BAD_REQUEST,
//       `You already applied with this email`
//     );
//   }

//   // Set default status
//   payload.membershipStatus = MembershipStatus.PENDING;

//   // Expiry date → 4 years
//   const expireDate = new Date();
//   expireDate.setFullYear(expireDate.getFullYear() + 4);
//   payload.expireId = expireDate;

//   return await MemberShipApplication.create(payload);
// };
const createToDB = async (payload: IMemberShipApplication) => {
  // Check membership plan
  const plan = await MemberShipPlan.findOne({
    membershipType: payload.membershipType,
  });

  if (!plan) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      `Membership type "${payload.membershipType}" not found`
    );
  }

  if (
    !plan.familyMembershipOptions?.enableFamilyMembers &&
    payload.familyMembers &&
    payload.familyMembers?.length > 0
  ) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      `Family membership is not enabled for this plan.`
    );
  }

  // Handle family members ONLY if family is enabled
  if (plan.familyMembershipOptions?.enableFamilyMembers) {
    const limit = plan.familyMembershipOptions.familyMembershipLimit ?? 0;
    const count = payload.familyMembers?.length ?? 0;

    if (count > limit) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        `Family member limit exceeded`
      );
    }
  } else {
    // If not family membership, ignore familyMembers
    payload.familyMembers = [];
  }

  // Duplicate check by phone number
  const phoneExists = await MemberShipApplication.findOne({
    phone: payload.phone,
    membershipStatus: {
      $in: [MembershipStatus.PENDING, MembershipStatus.ACTIVE],
    },
  });

  if (phoneExists) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      `You already applied with this phone number`
    );
  }

  // Duplicate check by email
  const emailExists = await MemberShipApplication.findOne({
    email: payload.email,
    membershipStatus: {
      $in: [MembershipStatus.PENDING, MembershipStatus.ACTIVE],
    },
  });

  if (emailExists) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      `You already applied with this email`
    );
  }

  // Set default status
  payload.membershipStatus = MembershipStatus.PENDING;

  // Expiry date → 4 years
  const expireDate = new Date();
  expireDate.setFullYear(expireDate.getFullYear() + 4);
  payload.expireId = expireDate;

  // 🔔 Notify Admins
  const adminOrSuperAdminUsers = await User.find({
    role: { $in: [USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN] },
  });

  for (const admin of adminOrSuperAdminUsers) {
    // 📧 Email
    if (admin.email) {
      const emailPayload = {
        userName: payload.name,
        userEmail: payload.email,
        userContact: payload.phone,
        adminEmail: admin.email,
        membershipType: payload.membershipType
      };

      const sendEmail =
        emailTemplate.membershipApplicationForm(emailPayload);
      emailHelper.sendEmail(sendEmail);
    }

    // 🔔 Notification
    Notification.create({
      receiver: admin._id,
      title: "New Membership Application Submitted",
      message: 'A new membership application has been submitted',
      sender: null,
      refId: admin._id,
      path: "/membership-application",
      seen: false,
    }).catch(() => { });

    // 🔢 Notification count
    NotificationCount.findOneAndUpdate(
      { user: admin._id },
      { $inc: { count: 1 } },
      { new: true, upsert: true }
    ).catch(() => { });
  }

  return await MemberShipApplication.create(payload);
};

const getAllFromDB = async (query: Record<string, any>) => {
  const qb = new QueryBuilder(MemberShipApplication.find(), query)
    .paginate()
    .search(['name', 'email', 'memberShipId', 'membershipType'])
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

const getByIdFromDB = async (id: mongoose.Types.ObjectId) => {
  const application = await MemberShipApplication.findById(id).lean();
  if (!application) {
    throw new ApiError(
      StatusCodes.NOT_FOUND,
      'Membership application not found'
    );
  }
  return application;
};

// const updateInDB = async (
//   id: mongoose.Types.ObjectId,
//   payload: Partial<IMemberShipApplication>
// ) => {
//   const application = await MemberShipApplication.findById(id).lean();
//   if (!application) {
//     throw new ApiError(
//       StatusCodes.NOT_FOUND,
//       'Membership application not found'
//     );
//   }

//   const previousStatus = application.membershipStatus;
//   const newStatus = payload.membershipStatus;

//   if (newStatus === MembershipStatus.ACTIVE && previousStatus !== MembershipStatus.ACTIVE) {
//     const existingUser = await User.findOne({ email: application.email });

//     if (!existingUser) {
//       const randomPassword = generateRandomPassword(12);

//       await User.create({
//         name: application.name,
//         email: application.email,
//         phone: application.phone,
//         password: randomPassword,
//         verified: true,
//         application_form:application._id
//       });

//       const emailData = emailTemplate.membershipApproved({
//         email: application.email,
//         name: application.name,
//         password: randomPassword,
//         memberShipId: application.memberShipId || '',
//         phone: application.phone
//       });
//       emailHelper.sendEmail(emailData);
//     }
//   }

//   // If status is being changed to REJECTED
//   if (
//     newStatus === MembershipStatus.REJECTED &&
//     previousStatus !== MembershipStatus.REJECTED
//   ) {
//     // Send rejection email
//     const emailData = emailTemplate.membershipRejected({
//       email: application.email,
//       name: application.name,
//     });
//     emailHelper.sendEmail(emailData);
//   }

//   // Update the application
//   const updated = await MemberShipApplication.findByIdAndUpdate(id, payload, {
//     new: true,
//     runValidators: true,
//   }).lean();

//   if (!updated) {
//     throw new ApiError(
//       StatusCodes.NOT_FOUND,
//       'Membership application not found'
//     );
//   }

//   return updated;
// };

const updateInDB = async (
  id: mongoose.Types.ObjectId,
  payload: Partial<IMemberShipApplication>
) => {
  const application = await MemberShipApplication.findById(id).lean();

  if (!application) {
    throw new ApiError(
      StatusCodes.NOT_FOUND,
      'Membership application not found'
    );
  }


  const previousStatus = application.membershipStatus;
  const newStatus = payload.membershipStatus;

  // ✅ If status is being changed to ACTIVE
  if (
    newStatus === MembershipStatus.ACTIVE &&
    previousStatus !== MembershipStatus.ACTIVE
  ) {
    const existingUser = await User.findOne({
      $or: [{ email: application.email }, { phone: application.phone }],
    });


    if (existingUser) {
      await User.findByIdAndUpdate(existingUser._id, {
        application_form: application._id,
      });
    } else {
      const existingUser = await User.findOne({
        $or: [{ email: application.email }, { phone: application.phone }],
      });

      if (existingUser) {
        await User.findByIdAndUpdate(existingUser._id, {
          application_form: application._id,
        });
      } else {
        // 🔵 User does not exist → create new user
        const randomPassword = generateRandomPassword(12);

        await User.create({
          name: application.name,
          email: application.email,
          phone: application.phone,
          password: randomPassword,
          profileImage: application.profileImage,
          verified: true,
          application_form: application._id,
        });

        // 📧 Send approval email only for new users
        const emailData = emailTemplate.membershipApproved({
          email: application.email,
          name: application.name,
          password: randomPassword,
          memberShipId: application.memberShipId || '',
          phone: application.phone,
        });

        await emailHelper.sendEmail(emailData);
      }
    }
  }

  // ❌ If status is being changed to REJECTED
  if (
    newStatus === MembershipStatus.REJECTED &&
    previousStatus !== MembershipStatus.REJECTED
  ) {
    const emailData = emailTemplate.membershipRejected({
      email: application.email,
      name: application.name,
    });

    await emailHelper.sendEmail(emailData);
  }

  // 🔄 Update the application
  const updated = await MemberShipApplication.findByIdAndUpdate(id, payload, {
    new: true,
    runValidators: true,
  }).lean();

  if(payload.profileImage){
     await User.findOneAndUpdate(
       { application_form: id },
       { $set: { profileImage: payload.profileImage } },
       { new: true, runValidators: true }
     )
  }

  if (!updated) {
    throw new ApiError(
      StatusCodes.NOT_FOUND,
      'Membership application not found'
    );
  }

  return updated;
};

const deleteFromDB = async (id: mongoose.Types.ObjectId) => {
  const deleted = await MemberShipApplication.findByIdAndDelete(id).lean();
  if (!deleted) {
    throw new ApiError(
      StatusCodes.NOT_FOUND,
      'Membership application not found'
    );
  }
  return deleted;
};

export const MemberShipApplicationService = {
  createToDB,
  getAllFromDB,
  getByIdFromDB,
  updateInDB,
  deleteFromDB,
};
