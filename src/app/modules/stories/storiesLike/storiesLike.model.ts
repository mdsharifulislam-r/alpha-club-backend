import { model, Schema } from 'mongoose';
import { IStoryLike, StoryLikeModel } from './storiesLike.interface';

const storyLikeSchema = new Schema<IStoryLike, StoryLikeModel>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    story: {
      type: Schema.Types.ObjectId,
      ref: 'Story',
      required: true,
    },
  },
  { timestamps: true }
);

// Ensure unique combination of user and story
storyLikeSchema.index({ user: 1, story: 1 }, { unique: true });

export const StoryLike = model<IStoryLike, StoryLikeModel>(
  'StoryLike',
  storyLikeSchema
);


