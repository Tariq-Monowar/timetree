import mongoose, { Document, Schema } from "mongoose";

export interface INotification extends Document {
  recipient: mongoose.Types.ObjectId;
  sender?: mongoose.Types.ObjectId;
  projectId?: mongoose.Types.ObjectId;
  taskId?: mongoose.Types.ObjectId;
  message: string;
  type: "task-update" | "new-assignment" | "project-status" | "general";
  read: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const NotificationSchema: Schema = new Schema(
  {
    recipient: [{ type: mongoose.Types.ObjectId, ref: "User", required: true }],
    sender: { type: mongoose.Types.ObjectId, ref: "User" },
    projectId: { type: mongoose.Types.ObjectId, ref: "Project" },
    taskId: { type: mongoose.Types.ObjectId, ref: "Task" },
    message: { type: String, required: true, trim: true },
    type: {
      type: String,
      enum: ["task-update", "new-assignment", "project-status", "general"],
      default: "general",
    },
    read: { type: Boolean, default: false },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

const NotificationModel = mongoose.model<INotification>(
  "Notification",
  NotificationSchema
);

export default NotificationModel;
