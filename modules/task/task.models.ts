import mongoose, { Schema, Document } from "mongoose";

export interface ITask extends Document {
  taskName: string;
  description?: string;
  assignedTo: mongoose.Schema.Types.ObjectId;
  priority: "low" | "medium" | "high" | "critical";
  status: "pending" | "in-progress" | "completed" | "on-hold" | "archived";
  projectId: mongoose.Schema.Types.ObjectId;
  dueDate?: Date;
  createdAt: Date;
  updatedAt: Date;
  dependencies: mongoose.Schema.Types.ObjectId[];
  notificationsEnabled: boolean;
  assignedAt?: Date;
  completedAt?: Date;
}

const TaskSchema: Schema = new Schema(
  {
    taskName: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    assignedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    assignedTo: { type: Schema.Types.ObjectId, ref: "User", required: true },
    priority: {
      type: String,
      enum: ["low", "medium", "high", "critical"],
      default: "medium",
    },
    status: {
      type: String,
      enum: ["pending", "in-progress", "completed", "on-hold", "archived"],
      default: "pending",
    },
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },
    dependencies: [{ type: Schema.Types.ObjectId, ref: "Task" }],
    dueDate: { type: Date },
    notificationsEnabled: { type: Boolean, default: true },
    assignedAt: { type: Date },
    completedAt: { type: Date },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

TaskSchema.virtual("isOverdue").get(function (this: ITask) {
  return (
    this.dueDate && new Date() > this.dueDate && this.status !== "completed"
  );
});

TaskSchema.pre("save", async function (next) {
  next();
});

// Create and export the Task model
const TaskModel = mongoose.model<ITask>("Task", TaskSchema);

export default TaskModel;
