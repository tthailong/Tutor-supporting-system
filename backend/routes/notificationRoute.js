import express from "express";
import {
    getNotifications,
    createNotification,
    markAsRead,
    deleteNotification,
    confirmManualMatchRequest
} from "../controllers/notificationController.js";

const notificationRouter = express.Router();

notificationRouter.get("/:userId", getNotifications);
notificationRouter.post("/", createNotification);
notificationRouter.put("/:notiId/read", markAsRead);
notificationRouter.post("/:notiId/confirm-match", confirmManualMatchRequest);
notificationRouter.delete("/:notiId", deleteNotification);

export default notificationRouter;