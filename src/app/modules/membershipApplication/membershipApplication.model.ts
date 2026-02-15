import { model, Schema } from 'mongoose';
import { IMemberShipApplication, MemberShipApplicationModel } from './membershipApplication.interface';
import { MembershipStatus, FamilyMemberRelation } from './membershipApplication..constant';

const familyMemberSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
    },
    relation: {
      type: String,
      enum: Object.values(FamilyMemberRelation),
      required: true,
    },
  },
  { _id: false }
);

const memberShipApplicationSchema = new Schema<IMemberShipApplication, MemberShipApplicationModel>(
  {
    memberShipId: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
    },
    membershipType: {
      type: String,
      required: true,
      trim: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    address: {
      type: String,
      trim: true,
    },
    familyMembers: [familyMemberSchema],
    membershipStatus: {
      type: String,
      enum: Object.values(MembershipStatus),
      default: MembershipStatus.PENDING,
      required: true,
    },
    expireId: {
      type: Date,
    },
    // Extra 
    jobTitle: { type: String },
    organizationName: { type: String },
    dateOfBirth: { type: Date },
    nationality: { type: String },
    countryOfResidence: { type: String },
    residenceAddress: { type: String },
    industrySector: { type: String },
    yearsOfExperience: { type: Number },
    currentEmployer: { type: String },
    workLocation: { type: String },
    annualGrossSalary: { type: Number },
    benefitsAndLifestyleInterests: { type: [String] }, // Array of strings
    image: { type: String },
    logo: { type: String },
    confirmAcknowledgement: { type: Boolean },
    confirmAgreement: { type: Boolean },

  },
  { timestamps: true }
);

// Generate memberShipId before saving using increment logic

const findLastMemberShipId = async (): Promise<string | undefined> => {
  const prefix = 'AC-';
  const lastApplication = await MemberShipApplication.findOne(
    { memberShipId: { $regex: `^${prefix}\\d{5}$` } },
    { memberShipId: 1, _id: 0 }
  )
    .sort({ createdAt: -1 })
    .lean();
  return lastApplication?.memberShipId;
};

export const generateMemberShipId = async (): Promise<string> => {
  const prefix = 'AC-';
  const lastId = await findLastMemberShipId();
  let numericPart = 1;
  if (lastId) {
    const parsed = parseInt(lastId.replace(prefix, ''), 10);
    if (!isNaN(parsed)) {
      numericPart = parsed + 1;
    }
  }
  const newId = String(numericPart).padStart(5, '0');
  return `${prefix}${newId}`;
};

memberShipApplicationSchema.pre('save', async function (next) {
  if (!this.memberShipId) {
    this.memberShipId = await generateMemberShipId();
  }
  next();
});

export const MemberShipApplication = model<IMemberShipApplication, MemberShipApplicationModel>('MemberShipApplication',
  memberShipApplicationSchema
);

