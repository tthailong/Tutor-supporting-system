import Notification from "../models/notificationModel.js";


// GET: Lấy tất cả thông báo của 1 user
export const getNotifications = async (req, res) => {
    try {
        const { userId } = req.params;

        const notifications = await Notification.find({ user: userId })
            .sort({ createdAt: -1 });

        res.status(200).json({ success: true, notifications });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};


// POST: Tạo thông báo
export const createNotification = async (req, res) => {
    try {
        const newNoti = await Notification.create(req.body);
        res.status(201).json({ success: true, notification: newNoti });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};


// PUT: Mark as read
export const markAsRead = async (req, res) => {
    try {
        const { notiId } = req.params;

        const updated = await Notification.findByIdAndUpdate(
            notiId,
            { isRead: true },
            { new: true }
        );

        res.status(200).json({ success: true, notification: updated });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};


// DELETE: Xóa thông báo
export const deleteNotification = async (req, res) => {
    try {
        const { notiId } = req.params;

        await Notification.findByIdAndDelete(notiId);

        res.status(200).json({ success: true, message: "Notification removed" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};