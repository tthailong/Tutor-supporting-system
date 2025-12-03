import express from "express";
import {
    getNotifications,
    createNotification,
    markAsRead,
    deleteNotification,
    confirmManualMatchRequest,
    getMatchingNotifications
} from "../controllers/notificationController.js";

const notificationRouter = express.Router();

notificationRouter.get("/:userId", getNotifications);
notificationRouter.post("/", createNotification);
notificationRouter.put("/:notiId/read", markAsRead);
notificationRouter.get("/:notiId/matching", getMatchingNotifications);
notificationRouter.post("/:notiId/confirm-match", confirmManualMatchRequest);
notificationRouter.delete("/:notiId", deleteNotification);

export default notificationRouter;