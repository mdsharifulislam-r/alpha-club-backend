import { Model, Types } from 'mongoose';

export type IStory = {
  _id?: string;
  title: string;                    // Story title
  description?: string;             // Story description
  image?: string[];                   // Story image
  published?: boolean;              // Published status
  createdAt?: Date;
  updatedAt?: Date;
};

export type StoryModel = Model<IStory>;

