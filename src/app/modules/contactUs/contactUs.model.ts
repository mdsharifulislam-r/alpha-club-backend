import { model, Schema } from 'mongoose';
import { ContactUsModel, IContactUs } from './contactUs.interface';

const contactUsSchema = new Schema<IContactUs, ContactUsModel>(
  {
    image: {
      type: String,
      trim: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

export const ContactUs = model<IContactUs, ContactUsModel>(
  'ContactUs',
  contactUsSchema
);

