
import mongoose from "mongoose";
import { dev } from "./db";

export const dbConnection = async (): Promise<void> => {
  try {
    await mongoose.connect(dev.db.url);
    console.log("Connected to database...");
  } catch (error) {
    console.error("Database connection error:", error);
    process.exit(1);
  }
};
