import ApiError from '../../../errors/ApiError';
import { StatusCodes } from 'http-status-codes';
import QueryBuilder from '../../builder/QueryBuilder';
import { IContactForm } from './contactForm.interface';
import { ContactForm } from './contactFromModel';
import { MemberShipApplication } from '../membershipApplication/membershipApplication.model';
import { emailTemplate } from '../../../shared/emailTemplate';
import { emailHelper } from '../../../helpers/emailHelper';
import { User } from '../user/user.model';
import { USER_ROLES } from '../../../enums/user';
import { Notification } from '../notification/notification.mode';
import { NotificationCount } from '../notification/notificationCountModel';
import { RedisHelper } from '../../../tools/redis/redis.helper';

const FIVE_MIN = 5 * 60;

// const createToDB = async (payload: IContactForm) => {
//   // Save Contact Form as usual
//   await ContactForm.create(payload);

//   if (payload.membershipType) {
//     const expireDate = new Date();
//     expireDate.setFullYear(expireDate.getFullYear() + 4);
//     await MemberShipApplication.create({
//       name: payload.name,
//       phone: payload.contact,
//       email: payload.email,
//       membershipType: payload.membershipType,
//       expireId: expireDate,
//     });
//   }

//   const adminOrSuperAdminUsers = await User.find({
//     role: { $in: [USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN] }
//   });

//   for (const admin of adminOrSuperAdminUsers) {
//     if (admin.email) {
//       const emailPayload = {
//         userName: payload.name,
//         userEmail: payload.email,
//         userContact: payload.contact,
//         userMessage: payload.message ?? "",
//         adminEmail: admin.email,
//       };
//       const sendEmail = emailTemplate.applicationFormAdmin(emailPayload);
//       emailHelper.sendEmail(sendEmail);
//     }
//     // Fire and forget - no await, immediate side effect
//     Notification.create({
//       receiver: admin._id,
//       title: "New Membership Application Submitted",
//       message: payload.message ?? "",
//       sender: null,
//       refId: admin._id,
//       path: "/user/contact-from",
//       seen: false
//     }).then(() => {}).catch(() => {});

//     // increment count if exists, otherwise create with count 1 using upsert
//     NotificationCount.findOneAndUpdate(
//       { user: admin._id },
//       { $inc: { count: 1 } },
//       { new: true, upsert: true }
//     ).then(() => {}).catch(() => {});
//   }

 
// };

const createToDB = async (payload: IContactForm) => {
  const membershipChecks = payload.membershipType
    ? [
        MemberShipApplication.findOne({ email: payload.email }).select('_id').lean(),
        MemberShipApplication.findOne({ phone: payload.contact }).select('_id').lean(),
      ]
    : [Promise.resolve(null), Promise.resolve(null)];

  const [emailExists, phoneExists, emailExistsInApplication, phoneExistsInApplication] =
    await Promise.all([
      ContactForm.findOne({ email: payload.email }).select('_id').lean(),
      ContactForm.findOne({ contact: payload.contact }).select('_id').lean(),
      ...membershipChecks,
    ]);

  if (emailExists) {
    throw new ApiError(
      StatusCodes.CONFLICT,
      "Application already exists with this email"
    );
  }

  if (phoneExists) {
    throw new ApiError(
      StatusCodes.CONFLICT,
      "Application already exists with this phone number"
    );
  }

  if (payload.membershipType) {
    if (emailExistsInApplication) {
      throw new ApiError(
        StatusCodes.CONFLICT,
        "Membership application already exists with this email"
      );
    }

    if (phoneExistsInApplication) {
      throw new ApiError(
        StatusCodes.CONFLICT,
        "Membership application already exists with this phone number"
      );
    }
  }

  // ✅ Save Contact Form
  await ContactForm.create(payload);
  await RedisHelper.bust(
    'contact-forms:*',
    'applications:*',
    'notifications:*',
    'notification-count:*',
  );

  // ✅ Save Membership Application
  if (payload.membershipType) {
    const expireDate = new Date();
    expireDate.setFullYear(expireDate.getFullYear() + 4);

    await MemberShipApplication.create({
      name: payload.name,
      phone: payload.contact,
      email: payload.email,
      membershipType: payload.membershipType,
      expireId: expireDate,
    });
  }

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
        userContact: payload.contact,
        userMessage: payload.message ?? "",
        adminEmail: admin.email,
      };

      const sendEmail =
        emailTemplate.applicationFormAdmin(emailPayload);
      emailHelper.sendEmail(sendEmail);
    }

    // 🔔 Notification
    Notification.create({
      receiver: admin._id,
      title: "New Membership Application Submitted",
      message: payload.message ?? "",
      sender: null,
      refId: admin._id,
      path: "/user/contact-from",
      seen: false,
    }).catch(() => {});

    // 🔢 Notification count
    NotificationCount.findOneAndUpdate(
      { user: admin._id },
      { $inc: { count: 1 } },
      { new: true, upsert: true }
    ).catch(() => {});
  }
};


const createFormToDB = async (payload: IContactForm) => {
  const membershipChecks = payload.membershipType
    ? [
        MemberShipApplication.findOne({ email: payload.email }).select('_id').lean(),
        MemberShipApplication.findOne({ phone: payload.contact }).select('_id').lean(),
      ]
    : [Promise.resolve(null), Promise.resolve(null)];

  const [emailExists, phoneExists, emailExistsInApplication, phoneExistsInApplication] =
    await Promise.all([
      ContactForm.findOne({ email: payload.email }).select('_id').lean(),
      ContactForm.findOne({ contact: payload.contact }).select('_id').lean(),
      ...membershipChecks,
    ]);

  if (emailExists && payload.membershipType) {
    throw new ApiError(
      StatusCodes.CONFLICT,
      "Application already exists with this email"
    );
  }

  if (phoneExists && payload.membershipType) {
    throw new ApiError(
      StatusCodes.CONFLICT,
      "Application already exists with this phone number"
    );
  }

  if (payload.membershipType) {
    if (emailExistsInApplication && payload.membershipType) {
      throw new ApiError(
        StatusCodes.CONFLICT,
        "Membership application already exists with this email"
      );
    }

    if (phoneExistsInApplication && payload.membershipType) {
      throw new ApiError(
        StatusCodes.CONFLICT,
        "Membership application already exists with this phone number"
      );
    }
  }

  // ✅ Save Contact Form
  await ContactForm.create(payload);
  await RedisHelper.bust(
    'contact-forms:*',
    'applications:*',
    'notifications:*',
    'notification-count:*',
  );

  // ✅ Save Membership Application
  if (payload.membershipType) {
    const expireDate = new Date();
    expireDate.setFullYear(expireDate.getFullYear() + 4);

    await MemberShipApplication.create({
      name: payload.name,
      phone: payload.contact,
      email: payload.email,
      membershipType: payload.membershipType,
      expireId: expireDate,
    });
  }

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
        userContact: payload.contact,
        userMessage: payload.message ?? "",
        adminEmail: admin.email,
        membershipType: payload.membershipType
      };

      const sendEmail =
        emailTemplate.applicationFormAdmin(emailPayload);
      emailHelper.sendEmail(sendEmail);
    }

    // 🔔 Notification
    Notification.create({
      receiver: admin._id,
      title: "New Membership Application Submitted",
      message: payload.message ?? "",
      sender: null,
      refId: admin._id,
      path: "/user/contact-from",
      seen: false,
    }).catch(() => {});

    // 🔢 Notification count
    NotificationCount.findOneAndUpdate(
      { user: admin._id },
      { $inc: { count: 1 } },
      { new: true, upsert: true }
    ).catch(() => {});
  }
};

const getAllFromDB = async (query: Record<string, any>) => {
  const cache = await RedisHelper.redisGet('contact-forms', query);
  if (cache) {
    return cache;
  }

  const qb = new QueryBuilder(
    ContactForm.find().select('name contact email message createdAt'),
    query
  )
    .paginate()
    .search(['name', 'contact', 'email', 'message'])
    .fields()
    .filter()
    .sort();
  
  const { data, pagination } = await qb.exec(q => q.lean());
  const result = { pagination, data };
  await RedisHelper.redisSet('contact-forms', result, query, FIVE_MIN);
  return result;
};

const getByIdFromDB = async (id: string) => {
  const cache = await RedisHelper.redisGet(`contact-form:${id}`);
  if (cache) {
    return cache;
  }

  const contactForm = await ContactForm.findById(id).lean();
  
  if (!contactForm) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Contact form not found');
  }
  await RedisHelper.redisSet(`contact-form:${id}`, contactForm, {}, FIVE_MIN);
  return contactForm;
};

const updateInDB = async (id: string, payload: Partial<IContactForm>) => {
  const updated = await ContactForm.findByIdAndUpdate(
    id,
    payload,
    {
      new: true,
      runValidators: true,
    }
  ).lean();

  if (!updated) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Contact form not found');
  }
  await RedisHelper.bust('contact-forms:*', `contact-form:${id}:*`);
  return updated;
};

const deleteFromDB = async (id: string) => {
  const contactForm = await ContactForm.findById(id).lean();
  if (!contactForm) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Contact form not found');
  }
  const deleted = await ContactForm.findByIdAndDelete(id).lean();
  await RedisHelper.bust('contact-forms:*', `contact-form:${id}:*`);
  return deleted;
};

export const ContactFormService = {
  createToDB,
  createFormToDB,
  getAllFromDB,
  getByIdFromDB,
  updateInDB,
  deleteFromDB,
};
