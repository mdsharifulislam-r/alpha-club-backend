import bcrypt from 'bcrypt';
import { StatusCodes } from 'http-status-codes';
import { JwtPayload, Secret } from 'jsonwebtoken';
import config from '../../../config';
import ApiError from '../../../errors/ApiError';
import { emailHelper } from '../../../helpers/emailHelper';
import { jwtHelper } from '../../../helpers/jwtHelper';
import { emailTemplate } from '../../../shared/emailTemplate';
import {
  IAuthResetPassword,
  IChangePassword,
  ILoginData,
} from '../../../types/auth';
import { User } from '../user/user.model';
import generateOTP from '../../../util/generateOTP';
import { IUser } from '../user/user.interface';
import { USER_ROLES } from '../../../enums/user';
import { IMemberShipApplication } from '../membershipApplication/membershipApplication.interface';


//resend otp
const resendOTPtoDB = async (email: string) => {
  const registedUser = await User.findOne({ email }).lean()

  if (registedUser?.verified) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'This account already verified');
  }

  if (!registedUser) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'User not found');
  }

  //send mail
  const otp = generateOTP();
  const value = {
    otp,
    email: registedUser.email,
    name: registedUser.name
  };
  const verifyAccount = emailTemplate.verifyAccount(value);
  emailHelper.sendEmail(verifyAccount);

  // Save OTP and expiry to DB
  const authentication = {
    oneTimeCode: otp,
    expireAt: new Date(Date.now() + 3 * 60000),
  };
  await User.findByIdAndUpdate(registedUser._id, { $set: { authentication } });


  return { message: 'OTP resend successfully' };
};


// VERIFY ACC. WITH OTP
const verifyOTPToDB = async (payload: { email: string, oneTimeCode: number }) => {
  const { email, oneTimeCode } = payload;

  const registedUser = await User.findOne({ email }, '_id verified authentication role').lean() as IUser;

  if (!registedUser) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'User not found');
  }

  if (registedUser.verified) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'This account already verified');
  }

  // Check if authentication, OTP, and expireAt exist
  if (!registedUser?.authentication?.oneTimeCode) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'OTP not found or not requested');
  }

  // Check OTP match
  if (registedUser.authentication.oneTimeCode !== oneTimeCode) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Invalid OTP');
  }

  // Check OTP expiry
  const now = new Date();
  if (registedUser.authentication.expireAt && registedUser.authentication.expireAt < now) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'OTP has expired');
  }

  // Mark user as verified and clear OTP
  await User.findByIdAndUpdate(
    registedUser._id,
    {
      $set: {
        verified: true,
        'authentication.oneTimeCode': null,
        'authentication.expireAt': null,
      },
    },
    { new: true }
  );

  //create token
  const createToken = jwtHelper.createToken(
    { id: registedUser._id, role: registedUser.role },
    config.jwt.jwt_secret as Secret,
    config.jwt.jwt_expire_in as string
  );


  return { message: 'Account verified successfully', token: createToken };
};

// VERIFY OTP TO RESET PASSWORD
const verifyResetOtp = async (payload: { email: string, oneTimeCode: number }) => {
  const { email, oneTimeCode } = payload;

  const registedUser = await User.findOne({ email }, '_id verified authentication').lean() as IUser;

  if (!registedUser) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'User not found');
  }


  // Check if authentication, OTP, and expireAt exist
  if (!registedUser?.authentication?.oneTimeCode) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'OTP not found or not requested');
  }
  
  // Check OTP match
  if (registedUser.authentication.oneTimeCode !== Number(oneTimeCode)) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Invalid OTP');
  }

  // Check OTP expiry
  const now = new Date();
  if (registedUser.authentication.expireAt && registedUser.authentication.expireAt < now) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'OTP has expired');
  }

  // Mark user as verified and clear OTP
  // await User.findByIdAndUpdate(
  //   registedUser._id,
  //   {
  //     $set: {
  //       verified: true,
  //       'authentication.oneTimeCode': null,
  //       'authentication.expireAt': null,
  //       'authentication.isResetPassword': true
  //     },
  //   },
  //   { new: true }
  // );

  // //create token
  // const createToken = jwtHelper.createToken(
  //   { id: registedUser._id, role: registedUser.role },
  //   config.jwt.jwt_secret as Secret,
  //   config.jwt.jwt_expire_in as string
  // );


  return { message: 'OTP verified successfully' };
};


//login
const loginUserFromDB = async (payload: ILoginData) => {
  const { phone, password } = payload;
  const isExistUser = await User.findOne({ phone }).select('+password');

  if (!isExistUser) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "User doesn't exist!");
  }

  //check verified and status
  if (!isExistUser.verified) {


    // Send verification email
    const otp = generateOTP();
    const value = {
      otp,
      email: isExistUser?.email,
      name: isExistUser?.name
    };
    const verifyAccount = emailTemplate.verifyAccount(value);
    emailHelper.sendEmail(verifyAccount);

    // Save OTP and expiry to DB
    const authentication = {
      oneTimeCode: otp,
      expireAt: new Date(Date.now() + 3 * 60000),
    };
    await User.findByIdAndUpdate(isExistUser._id, { $set: { authentication } });

    throw new ApiError(
      StatusCodes.FORBIDDEN,
      'Please verify your account, then try to login again'
    );

  }
  
// const loginUserFromDB = async (payload: ILoginData) => {
//   const { email, password } = payload;
//   const isExistUser = await User.findOne({ email }).select('+password');

//   if (!isExistUser) {
//     throw new ApiError(StatusCodes.BAD_REQUEST, "User doesn't exist!");
//   }

//   //check verified and status
//   if (!isExistUser.verified) {


//     // Send verification email
//     const otp = generateOTP();
//     const value = {
//       otp,
//       email: isExistUser?.email,
//       name: isExistUser?.name
//     };
//     const verifyAccount = emailTemplate.verifyAccount(value);
//     emailHelper.sendEmail(verifyAccount);

//     // Save OTP and expiry to DB
//     const authentication = {
//       oneTimeCode: otp,
//       expireAt: new Date(Date.now() + 3 * 60000),
//     };
//     await User.findByIdAndUpdate(isExistUser._id, { $set: { authentication } });

//     throw new ApiError(
//       StatusCodes.FORBIDDEN,
//       'Please verify your account, then try to login again'
//     );


//   }

  //check user status
  if (isExistUser.status === 'block') {
    throw new ApiError(
      StatusCodes.FORBIDDEN,
      'Your Membership has expired.'
      // 'You don’t have permission to access this content.It looks like your account has been blocked.'
    );
  }

  //check match password
  if (
    password &&
    !(await User.isMatchPassword(password, isExistUser.password))
  ) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Password is incorrect!');
  }

  //create token
  const createToken = jwtHelper.createToken(
    { id: isExistUser._id, role: isExistUser.role },
    config.jwt.jwt_secret as Secret,
    config.jwt.jwt_expire_in as string
  );

  // Exclude password before returning user object
  const { password: _password, ...userWithoutPassword } = isExistUser.toObject ? isExistUser.toObject() : isExistUser;
  return { token:createToken, user: userWithoutPassword };
};
const adminloginUserFromDB = async (payload: ILoginData) => {
  const { email, password } = payload;
  const isExistUser = await User.findOne({ email }).select('+password');

  if (!isExistUser) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "User doesn't exist!");
  }

  if (isExistUser.role !== USER_ROLES.ADMIN && isExistUser.role !== USER_ROLES.SUPER_ADMIN) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'You don’t have permission to access dashboard.');
  }


  //check user status
  if (isExistUser.status === 'block') {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      'You don’t have permission to access this content.It looks like your account has been blocked.'
    );
  }

  //check match password
  if (
    password &&
    !(await User.isMatchPassword(password, isExistUser.password))
  ) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Password is incorrect!');
  }

  //create token
  const createToken = jwtHelper.createToken(
    { id: isExistUser._id, role: isExistUser.role },
    config.jwt.jwt_secret as Secret,
    config.jwt.jwt_expire_in as string
  );

  return { createToken };
};

//forget password
const forgetPasswordToDB = async (email: string) => {

  const isExistUser = await User.isExistUserByEmail(email) as IUser;
  if (!isExistUser) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "User doesn't exist!");
  }

  //send mail
  const otp = generateOTP();
  const value = {
    otp,
    email: isExistUser.email,
    name: isExistUser.name
  };
  const forgetPassword = emailTemplate.resetPassWord(value);
  emailHelper.sendEmail(forgetPassword);

  //save to DB
  const authentication = {
    isResetPassword: false,
    oneTimeCode: otp,
    expireAt: new Date(Date.now() + 3 * 60000),
  };
  await User.findByIdAndUpdate(isExistUser._id, { $set: { authentication } });

};

//reset password
const resetPasswordToDB = async (payload: IAuthResetPassword) => {

  const { newPassword, confirmPassword, otp } = payload;

  if (!otp) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'OTP is required');
  }


  // check user exists
  const isExistUser = await User.findOne({ 'authentication.oneTimeCode': otp})
    .select('_id password')
    .lean();
  if (!isExistUser) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'OTP is not valid to find user');
  }


  //check password
  if (newPassword !== confirmPassword) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      "New password and Confirm password doesn't match!"
    );
  }

  //hash password
  const hashPassword = await bcrypt.hash(
    newPassword,
    Number(config.bcrypt_salt_rounds)
  );

  const updateData = {
    password: hashPassword,
    authentication: {
      expireAt: null,
      oneTimeCode: null,
      isResetPassword: false
    },
  };

  await User.findByIdAndUpdate({ _id: isExistUser._id }, updateData, {
    new: true,
  });

  return { message: 'Password reset successful' };
};

// change password
const changePasswordToDB = async (
  user: JwtPayload,
  payload: IChangePassword
) => {
  const { currentPassword, newPassword, confirmPassword } = payload;
  const isExistUser = await User.findById(user.id).select('+password');
  if (!isExistUser) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "User doesn't exist!");
  }

  //current password match
  if (
    currentPassword &&
    !(await User.isMatchPassword(currentPassword, isExistUser.password))
  ) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Password is incorrect');
  }

  //newPassword and current password
  if (currentPassword === newPassword) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      'Please give different password from current password'
    );
  }
  //new password and confirm password check
  if (newPassword !== confirmPassword) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      "Password and Confirm password doesn't matched"
    );
  }

  //hash password
  const hashPassword = await bcrypt.hash(
    newPassword,
    Number(config.bcrypt_salt_rounds)
  );

  const updateData = {
    password: hashPassword,
    hasPasswordSave: true,
  };
  await User.findOneAndUpdate({ _id: user.id }, updateData, { new: true });
};


const renualRequestToDB = async (phone: string) => {
  // Find the user by phone number
  const user = await User.findOne({ phone })
    .lean()
    .populate({
      path: 'application_form',
      select: 'memberShipId membershipType', // select only these two
    });
  if (!user) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "User doesn't exist!");
  }

  // Find all admins & super admins
  const admins = await User.find({
    role: { $in: [USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN] }
  }).lean();

  // Prepare optional values in case application_form is available
  const memberShipId = (user.application_form as any)?.memberShipId || '';
  const membershipType = (user.application_form as any )?.membershipType || '';

  // Send renewal request email to each admin/super admin - run in background (no await)
  admins.forEach((admin) => {
    const renewalRequestEmail = emailTemplate.renewalRequest({
      name: user.name,
      email: user.email,
      phone: user.phone,
      adminEmail: admin.email,
      memberShipId,
      membershipType,
    });
    emailHelper.sendEmail(renewalRequestEmail); // no await, runs in background
  });

};

export const AuthService = {
  adminloginUserFromDB,
  forgetPasswordToDB,
  loginUserFromDB,
  resetPasswordToDB,
  resendOTPtoDB,
  verifyOTPToDB,
  verifyResetOtp,
  changePasswordToDB,
  renualRequestToDB

};
