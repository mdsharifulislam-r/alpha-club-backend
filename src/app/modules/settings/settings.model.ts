import { model, Schema } from 'mongoose';
import {
  ISettings,
  SettingsModel,
} from './settings.interface';

const settingsSchema = new Schema<ISettings, SettingsModel>(
  {
    about: {
      description: {
        type: String,
        trim: true,
      },
    },
    privacy_policy: {
      description: {
        type: String,
        trim: true,
      },
    },
    terms_of_services: {
      description: {
        type: String,
        trim: true,
      },
    },
  },
  { timestamps: true }
);

export const Settings = model<ISettings, SettingsModel>(
  'Settings',
  settingsSchema
);

