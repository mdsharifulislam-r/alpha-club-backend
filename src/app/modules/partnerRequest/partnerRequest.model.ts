import { model, Schema } from 'mongoose';
import { IPartnerRequest, PartnerRequestModel } from './partnerRequest.interface';
import { PartnerShipStatus } from './partnerRequest.constant';

const partnerShipApplicationSchema = new Schema<IPartnerRequest, PartnerRequestModel>(
  {
    partnerShipId: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
    },
    companyName: { type: String, required: true, trim: true },
    profileImage: { type: String, default: 'https://i.ibb.co/z5YHLV9/profile.png', trim: true },
    industry: { type: String, required: true, trim: true },
    contactName: { type: String, required: true, trim: true },
    contactEmail: { type: String, required: true, trim: true },
    contactPhone: { type: String, required: true, trim: true },
    website: { type: String, required: true, trim: true },
    message: { type: String, required: true, trim: true },
    partnerShipStatus: {
      type: String,
      enum: Object.values(PartnerShipStatus),
      default: PartnerShipStatus.PENDING,
      required: true,
    }
  },
  { timestamps: true }
);

// Generate memberShipId before saving using increment logic

const findLastMemberShipId = async (): Promise<string | undefined> => {
  const prefix = 'PC-';

  const lastApplication = await PartnerRequest.findOne(
    { partnerShipId: { $regex: `^${prefix}\\d{5}$` } },
    { partnerShipId: 1, _id: 0 }
  )
    .sort({ partnerShipId: -1 }) // 🔥 sort by ID, not createdAt
    .lean();

  return lastApplication?.partnerShipId;
};

export const generateMemberShipId = async (): Promise<string> => {
  const prefix = 'PC-';
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

partnerShipApplicationSchema.pre('save', async function (next) {
  if (!this.partnerShipId) {
    this.partnerShipId = await generateMemberShipId();
  }
  next();
});

export const PartnerRequest = model<IPartnerRequest, PartnerRequestModel>('PartnerRequest',
  partnerShipApplicationSchema
);

