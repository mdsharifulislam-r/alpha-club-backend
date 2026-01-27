import { Model } from "mongoose";
import { FamilyMemberRelation, MembershipStatus } from "./membershipApplication..constant";


export type IMemberShipApplication = {
  _id?: string; // optional because Mongoose will generate it
  memberShipId?: string; // AC-01144 (Auto Generated)
  membershipType: string; // sink with others table
  name: string;
  email: string;
  phone: string;
  address?: string;
  image?:string;
  familyMembers?: Array<{
    name: string;
    email: string;
    relation: FamilyMemberRelation;
  }>;

  membershipStatus: MembershipStatus;
  expireId?: Date;   // new field for separate expiry date

  createdAt?: Date;
  updatedAt?: Date;
};

export type MemberShipApplicationModel = Model<IMemberShipApplication>;