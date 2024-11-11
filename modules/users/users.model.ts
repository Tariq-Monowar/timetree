import mongoose, { Document, Schema } from "mongoose";

export interface IUser extends Document {
  name?: string;
  email?: string;
  password?: string;
  skills?: string[];
  availability: boolean;
  bio: string;
  _id: string;
}

const UserSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    skills: [{ type: String }],
    bio: { type: String },
    availability: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model<IUser>("User", UserSchema);
