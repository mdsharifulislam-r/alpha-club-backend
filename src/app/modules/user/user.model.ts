import bcrypt from 'bcrypt';
import { StatusCodes } from 'http-status-codes';
import { model, Schema } from 'mongoose';
import config from '../../../config';
import { USER_ROLES } from '../../../enums/user';
import ApiError from '../../../errors/ApiError';
import { IUser, UserModal } from './user.interface';

const userSchema = new Schema<IUser, UserModal>(
  {
    name: {
      type: String,
      required: true,
    },
    profileImage: {
      type: String,
      default: 'https://i.ibb.co/z5YHLV9/profile.png',
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      select: 0,
      minlength: 8,
    },
    status: {
      type: String,
      enum: ['active', 'block'],
      default: 'active',
    },
    role: {
      type: String,
      enum: Object.values(USER_ROLES),
      default: USER_ROLES.USER,
    },
    verified: {
      type: Boolean,
      default: false,
    },
    hasPasswordSave: {
      type: Boolean,
      default: false,
    },
    fcmToken: {
      type: String
    },
    application_form: {
      type: Schema.Types.ObjectId,
      ref: 'MemberShipApplication'
    },
    
    authentication: {
      type: {
        isResetPassword: {
          type: Boolean,
          default: false,
        },
        oneTimeCode: {
          type: Number,
          default: null,
        },
        expireAt: {
          type: Date,
          default: null,
        },
      },
      select: false,
    },
  },
  { timestamps: true }
);

//exist user check
userSchema.statics.isExistUserById = async (id: string) => {
  const isExist = await User.findById(id);
  return isExist;
};

userSchema.statics.isExistUserByEmail = async (email: string) => {
  const isExist = await User.findOne({ email });
  return isExist;
};

//is match password
userSchema.statics.isMatchPassword = async (
  password: string,
  hashPassword: string
): Promise<boolean> => {
  return await bcrypt.compare(password, hashPassword);
};

//check user
userSchema.pre('save', async function (next) {

  //check user
  // const isExist = await User.findOne({ email: this.email });
  // if (isExist) {
  //   console.log(isExist)
  //   throw new ApiError(StatusCodes.BAD_REQUEST, 'Email already exist!');
  // }

  if (!this.password) {
    return;
  }

  //password hash
  this.password = await bcrypt.hash(
    this.password,
    Number(config.bcrypt_salt_rounds)
  );
  next();
});


userSchema.virtual('profileUpdateRequest', {
  ref: 'UserProfileUpdateRequest',
  localField: '_id',
  foreignField: 'user',
  justOne: true,
});

userSchema.set('toJSON', { virtuals: true });
userSchema.set('toObject', { virtuals: true });
export const User = model<IUser, UserModal>('User', userSchema);
