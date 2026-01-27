import { model, Schema } from 'mongoose';
import {
  IEventRegistration,
  EventRegistrationModel,
} from './eventRegistration.interface';
import { EventRegistrationStatus } from './enventRegistration.constant';

const eventRegistrationSchema = new Schema<IEventRegistration, EventRegistrationModel>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    event: {
      type: Schema.Types.ObjectId,
      ref: 'Event',
      required: true,
    },
    guests:[
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
          lowercase: true,
        },
        phone: {
          type: String,
          required: true,
          trim: true,
        },
      }
    ],
    status: {
      type: String,
      enum: EventRegistrationStatus,
      default: EventRegistrationStatus.PENDING,
    },
  },
  { timestamps: true }
);

export const EventRegistration = model<IEventRegistration, EventRegistrationModel>(
  'EventRegistration',
  eventRegistrationSchema
);
