import { model, Schema } from 'mongoose';
import { FaqContactModel, IFaqContact } from './faqContact.interface';

const faqContactSchema = new Schema<IFaqContact, FaqContactModel>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    contact: {
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
    message: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { timestamps: true }
);

export const FaqContact = model<IFaqContact, FaqContactModel>(
  'FaqContact',
  faqContactSchema
);


