// modules/project/controllers/project.controller.ts
import NotificationModel from "../notification/notification.models";
import { Request, Response } from "express";

interface CustomRequest extends Request {
  userId?: string;
}

class notificationController {
  // Get the latest 10 notifications for a user
  getAllNotifications = async (req: CustomRequest, res: Response): Promise<void> => {
    try {
      const userId = req.userId;
      const notifications = await NotificationModel.find({ recipient: userId })
        .populate("sender", "name email")
        .populate("projectId", "title")
        .populate("taskId", "taskName")
        .sort({ createdAt: -1 })
        .limit(10);  

      res.status(200).json({
       notifications
      });
    } catch (error) {
      res.status(500).json(error);
    }
  };

  // Mark a single notification as read
  markNotificationAsRead = async (req: CustomRequest, res: Response): Promise<void> => {
    try {
      const notificationId = req.params.notificationId;
      const notification = await NotificationModel.findByIdAndUpdate(
        notificationId,
        { read: true },
        { new: true }
      );

      if (!notification) {
        res.status(404).json({ success: false, message: "Notification not found" });
        return;
      }

      res.status(200).json({
        success: true,
        message: "Notification marked as read",
        data: notification,
      });
    } catch (error) {
      res.status(500).json(error);
    }
  };

  // Mark all notifications for a user as read
  markAllNotificationsAsRead = async (req: CustomRequest, res: Response): Promise<void> => {
    try {
      const userId = req.userId;
      await NotificationModel.updateMany({ recipient: userId, read: false }, { read: true });

      res.status(200).json({
        success: true,
        message: "All notifications marked as read",
      });
    } catch (error) {
      res.status(500).json(error);
    }
  };

  // Create a new notification
  createNewNotification = async (req: CustomRequest, res: Response): Promise<void> => {
    try {
      const { recipient, sender, projectId, taskId, message, type } = req.body;

      const newNotification = new NotificationModel({
        recipient,
        sender,
        projectId,
        taskId,
        message,
        type,
      });

      await newNotification.save();

      res.status(201).json({
        success: true,
        message: "Notification created successfully",
        data: newNotification,
      });
    } catch (error) {
      res.status(500).json(error);
    }
  };

  // Delete a single notification
  deleteNotification = async (req: CustomRequest, res: Response): Promise<void> => {
    try {
      const notificationId = req.params.notificationId;
      const deletedNotification = await NotificationModel.findByIdAndDelete(notificationId);

      if (!deletedNotification) {
        res.status(404).json({ success: false, message: "Notification not found" });
        return;
      }

      res.status(200).json({
        success: true,
        message: "Notification deleted successfully",
      });
    } catch (error) {
      res.status(500).json(error);
    }
  };

  // Delete all notifications for a user
  deleteAllNotifications = async (req: CustomRequest, res: Response): Promise<void> => {
    try {
      const userId = req.userId;
      await NotificationModel.deleteMany({ recipient: userId });

      res.status(200).json({
        success: true,
        message: "All notifications deleted successfully",
      });
    } catch (error) {
      res.status(500).json(error);
    }
  };
}

export default new notificationController();
