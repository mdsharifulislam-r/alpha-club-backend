import { model, Schema } from 'mongoose';
import { IStory, StoryModel } from './stories.interface';

const storySchema = new Schema<IStory, StoryModel>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    image:[
      {
        type: String,
        trim: true,
      }
    ],
    published: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

export const Story = model<IStory, StoryModel>('Story', storySchema);

