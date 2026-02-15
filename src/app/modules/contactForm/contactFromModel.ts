import { model, Schema } from 'mongoose';
import { ContactFormModel, IContactForm } from './contactForm.interface';

const faqContactSchema = new Schema<IContactForm, ContactFormModel>(
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
            trim: true,
        },
        memberShipId: {
            type: String,
            trim: true,
        },
    },
    { timestamps: true }
);

export const ContactForm = model<IContactForm, ContactFormModel>('ContactForm',faqContactSchema);

