import { Model, mongo } from "mongoose";
import { EventRegistrationStatus } from "./enventRegistration.constant";
import { IUser } from "../../user/user.interface";
import { IEvent } from "../event.interface";

export type IEventRegistration = {
  _id?: string;
  user: mongo.ObjectId | IUser;           
  event: mongo.ObjectId | IEvent;                        
  status?: EventRegistrationStatus;
  registrationEnable:Boolean,
  guests?:[
    {
      name:string,
      email:string,
      phone:string
    }
  ],
  createdAt?: Date;
  updatedAt?: Date;
};

export type EventRegistrationModel = Model<IEventRegistration>;