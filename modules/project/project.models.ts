// modules/project/models/project.model.ts

import mongoose, { Document, Schema } from "mongoose";

interface IProjectUser {
  userId: mongoose.Types.ObjectId;
  role: "admin" | "manager" | "developer";
}

export interface IProject extends Document {
  title: string;
  description: string;
  users: IProjectUser[];
  tasks: mongoose.Types.ObjectId[];
  archived: boolean;
  priority: "low" | "medium" | "high";
  status: "active" | "pending" | "completed" | "archived";
  budget?: { value: number; currency: "BDT" | "USD" };
  amount?: string | number;
}

const ProjectSchema: Schema = new Schema(
  {
    title: { type: String, required: true },
    description: { type: String },
    users: [
      {
        userId: { type: mongoose.Types.ObjectId, ref: "User", required: true },
        role: {
          type: String,
          enum: ["admin", "manager", "developer"],
          required: true,
        },
      },
    ],
    timeline: { start: Date, end: Date },
    tasks: [{ type: mongoose.Types.ObjectId, ref: "Task" }],
    archived: { type: Boolean, default: false },
    priority: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium",
    },
    status: {
      type: String,
      enum: ["active", "pending", "completed", "archived"],
      default: "active",
    },
    currency: { type: String, enum: ["BDT", "USD"], default: "BDT" },
    amount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.model<IProject>("Project", ProjectSchema);
