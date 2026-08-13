import { Model } from "mongoose";

export type IEvent = {
  _id?: string;
  name: string;                    // Event name
  title: string;                   // Event title
  image?: string;                  // Event image
  location?: string;               // Event location
  description?: string;            // Event description
  eventDate?: Date;               // Event date
  eventTime?: string;             // Event time
  enableToJoin?:Boolean,
  joinStatus?:string;
  createdAt?: Date;
  updatedAt?: Date;
};

export type EventModel = Model<IEvent>;

