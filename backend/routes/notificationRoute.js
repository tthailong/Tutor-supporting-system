import express from "express";
import {
    getNotifications,
    createNotification,
    markAsRead,
    deleteNotification
} from "../controllers/notificationController.js";

const notificationRouter = express.Router();

notificationRouter.get("/:userId", getNotifications);
notificationRouter.post("/", createNotification);
notificationRouter.put("/:notiId/read", markAsRead);
notificationRouter.delete("/:notiId", deleteNotification);

export default notificationRouter;