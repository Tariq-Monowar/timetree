// notification.route.ts
import express from "express";
import notificationController from "./notification.controller";
import { verifyUser } from "../../middleware/verifyUser";

const router = express.Router();

router.get(
  "/user",
  verifyUser,
  notificationController.getAllNotifications
);

router.put(
  "/read/:notificationId",
  verifyUser,
  notificationController.markNotificationAsRead
);

router.put(
  "/read-all",
  verifyUser,
  notificationController.markAllNotificationsAsRead
);

router.post("/", verifyUser, notificationController.createNewNotification);

router.delete(
  "/:notificationId",
  verifyUser,
  notificationController.deleteNotification
);

router.delete(
  "/user",
  verifyUser,
  notificationController.deleteAllNotifications
);

export default router;
