import Notification from "../models/notificationModel.js";

export const sendNoti = async (userId, title, message) => {
  try {
    await Notification.create({
      user: userId,
      title,
      message,
      isRead: false
    });
  } catch (err) {
    console.error("Notification error:", err.message);
  }
};