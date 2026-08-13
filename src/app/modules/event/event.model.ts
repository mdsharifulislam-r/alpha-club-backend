import { model, Schema } from 'mongoose';
import {
  IEvent,
  EventModel,
} from './event.interface';

const eventSchema = new Schema<IEvent, EventModel>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    image: {
      type: String,
      trim: true,
    },
    location: {
      type: String,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    eventDate: {
      type: Date,
    },
    eventTime: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

export const Event = model<IEvent, EventModel>(
  'Event',
  eventSchema
);

