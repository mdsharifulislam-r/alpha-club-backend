import { Model } from "mongoose";

export type ISettings = {
  _id?: string;
  about?: {
    description: string;
  };
  privacy_policy?: {
    description: string;
  };
  terms_of_services?: {
    description: string;
  };
  createdAt?: Date;
  updatedAt?: Date;
};

export type SettingsModel = Model<ISettings>;

