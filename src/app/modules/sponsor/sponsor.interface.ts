import { Model } from "mongoose";

export type ISponsor = {
  _id?: string;
  logo?: string;                    // Sponsor logo
  title: string;                    // Sponsor title/name
  location?: string;                // Sponsor location
  description?: string;             // Sponsor description
  image?: string;                   // Sponsor image
  publishing?: boolean;             // Publishing status
  createdAt?: Date;
  updatedAt?: Date;
};

export type SponsorModel = Model<ISponsor>;

