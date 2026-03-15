import { model, Schema, Model } from 'mongoose';
import { ITeamContact, TeamContactModel } from './teamContact.interface';

const teamContactSchema = new Schema<ITeamContact, TeamContactModel>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    title: {
      type: String,
      trim: true,
    },
    phone: {
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
    location: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

export const TeamContact = model<ITeamContact, TeamContactModel>('TeamContact',teamContactSchema);