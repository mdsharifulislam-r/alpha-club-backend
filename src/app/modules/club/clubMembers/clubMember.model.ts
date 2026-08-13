import { model, Schema } from 'mongoose';
import {
  IClubMember,
  ClubMemberModel,
} from './clubMember.interface';

const clubMemberSchema = new Schema<IClubMember, ClubMemberModel>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    club: {
      type: Schema.Types.ObjectId,
      ref: 'Club',
      required: true,
    },
  },
  { timestamps: true }
);

// Ensure unique combination of user and club
clubMemberSchema.index({ user: 1, club: 1 }, { unique: true });

export const ClubMember = model<IClubMember, ClubMemberModel>('ClubMember',clubMemberSchema);

