import { model, Schema } from 'mongoose';
import { FaqModel, IFaq } from './faq.interface';


const faqSchema = new Schema<IFaq, FaqModel>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String
    },
  },
  { timestamps: true }
);

export const Faq = model<IFaq, FaqModel>('Faq',faqSchema);

