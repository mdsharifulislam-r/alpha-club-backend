import { Model, Types } from 'mongoose';

export type IStoryLike = {
  _id?: string;
  user: Types.ObjectId;             // Reference to User
  story: Types.ObjectId;            // Reference to Story
  createdAt?: Date;
  updatedAt?: Date;
};

export type StoryLikeModel = Model<IStoryLike>;


