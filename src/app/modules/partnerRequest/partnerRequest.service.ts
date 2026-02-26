import ApiError from '../../../errors/ApiError';
import { StatusCodes } from 'http-status-codes';
import QueryBuilder from '../../builder/QueryBuilder';
import { IPartnerRequest } from './partnerRequest.interface';
import { PartnerRequest } from './partnerRequest.model';
import mongoose from 'mongoose';
import { emailHelper } from '../../../helpers/emailHelper';
import { emailTemplate } from '../../../shared/emailTemplate';
import { PartnerShipStatus } from './partnerRequest.constant';
import { User } from '../user/user.model';
import generateRandomPassword from '../../../util/generateRandomPassword';
import { USER_ROLES } from '../../../enums/user';
import { Notification } from '../notification/notification.mode';
import { NotificationCount } from '../notification/notificationCountModel';

const createToDB = async (payload: IPartnerRequest) => {
  // 🔎 Check existing email & phone
  const [isEmailExist, isPhoneExist] = await Promise.all([
    PartnerRequest.exists({ contactEmail: payload.contactEmail }),
    PartnerRequest.exists({ contactPhone: payload.contactPhone }),
  ]);

  if (isEmailExist) {
    throw new ApiError(
      StatusCodes.CONFLICT,
      'Application already exists with this email'
    );
  }

  if (isPhoneExist) {
    throw new ApiError(
      StatusCodes.CONFLICT,
      'Application already exists with this phone number'
    );
  }

  // ✅ Create Application First
  const application = await PartnerRequest.create(payload);

  // 🔔 Find Admins & Super Admins
  const adminOrSuperAdminUsers = await User.find({
    role: { $in: [USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN] },
  });

  // 🔔 Notify Admins
  for (const admin of adminOrSuperAdminUsers) {
    // 📧 Send Email
    if (admin.email) {
      const emailPayload = {
        userName: payload.contactName,
        userEmail: payload.contactEmail,
        userContact: payload.contactPhone,
        userMessage: '',
        adminEmail: admin.email
      };

      const sendEmail =
        emailTemplate.applicationFormAdmin(emailPayload);

      emailHelper.sendEmail(sendEmail);
    }

    // 🔔 Create Notification
    Notification.create({
      receiver: admin._id,
      title: 'New Partnership Application Submitted',
      message: 'A new partnership application has been submitted',
      sender: null,
      refId: application._id,
      path: '/admin/membership-applications', // better route
      seen: false,
    });

    // 🔢 Increase Notification Count
    NotificationCount.findOneAndUpdate(
      { user: admin._id },
      { $inc: { count: 1 } },
      { new: true, upsert: true }
    );
  }

  return application;
};



const getAllFromDB = async (query: Record<string, any>) => {
  const qb = new QueryBuilder(PartnerRequest.find(), query)
    .paginate()
    .search(['companyName', 'contactName', 'contactEmail', 'partnerShipId'])
    .fields()
    .filter()
    .sort();

  const data = await qb.modelQuery.lean();
  const pagination = await qb.getPaginationInfo();

  return { pagination, data };
};

const getByIdFromDB = async (id: mongoose.Types.ObjectId) => {
  const application = await PartnerRequest.findById(id).lean();
  if (!application) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Partner request not found');
  }
  return application;
};

const updateInDB = async (
  id: mongoose.Types.ObjectId,
  payload: Partial<IPartnerRequest>
) => {
  const application = await PartnerRequest.findById(id).lean();

  if (!application) {
    throw new ApiError(
      StatusCodes.NOT_FOUND,
      'Partner request not found'
    );
  }

  const previousStatus = application.partnerShipStatus;
  const newStatus = payload.partnerShipStatus;

  console.log({
    previousStatus,
    newStatus
  });

  // ✅ If status is being changed to ACTIVE
  if (newStatus === PartnerShipStatus.ACTIVE && previousStatus !== PartnerShipStatus.ACTIVE) {
    // 🔍 Check if user already exists
    let existingUser = await User.findOne({
      $or: [
        { email: application.contactEmail },
        { phone: application.contactPhone },
      ],
    });

    if (!existingUser) {
      // 🔵 Create new user
      const randomPassword = generateRandomPassword(12);

      const newUser = await User.create({
        profileImage: application.prprofileImage,
        name: application.contactName,
        email: application.contactEmail,
        phone: application.contactPhone,
        password: randomPassword,
        verified: true,
        role: USER_ROLES.PARTNER
      });

      // 📧 Send approval email only for new user
      const emailData = emailTemplate.partnerApproved({
        email: application.contactEmail,
        companyName: application.companyName,
        partnerShipId: application.partnerShipId || '',
        contactName: application.contactName,
        password: randomPassword, // optional if needed in template
      });

      emailHelper.sendEmail(emailData);
    }
  }

  // ❌ If status is being changed to REJECTED
  if (
    newStatus === PartnerShipStatus.REJECTED &&
    previousStatus !== PartnerShipStatus.REJECTED
  ) {
    const emailData = emailTemplate.partnerRejected({
      email: application.contactEmail,
      companyName: application.companyName,
      contactName: application.contactName,
    });

    emailHelper.sendEmail(emailData);
  }

  // 🔄 Update PartnerRequest
  const updated = await PartnerRequest.findByIdAndUpdate(id, payload, {
    new: true,
    runValidators: true,
  }).lean();

  if (!updated) {
    throw new ApiError(
      StatusCodes.NOT_FOUND,
      'Partner request not found'
    );
  }

  return updated;
};

const deleteFromDB = async (id: mongoose.Types.ObjectId) => {
  const deleted = await PartnerRequest.findByIdAndDelete(id).lean();
  if (!deleted) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Partner request not found');
  }
  return deleted;
};

export const PartnerRequestService = {
  createToDB,
  getAllFromDB,
  getByIdFromDB,
  updateInDB,
  deleteFromDB,
};
