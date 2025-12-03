import Notification from "../models/notificationModel.js";
import registrationModel from "../models/registrationModel.js";
import sessionModel from "../models/sessionModel.js";
import tutorModel from "../models/tutorModel.js";
import User from "../models/User.js";
import asyncHandler from "express-async-handler";

// GET: Lấy tất cả thông báo của 1 user
export const getNotifications = async (req, res) => {
    try {
        const { userId } = req.params;

        const notifications = await Notification.find({ user: userId })
            .populate('studentId', 'name email')
            .populate('registrationId')
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


// GET: Get all matching notifications for the same timeslot/subject/tutor
export const getMatchingNotifications = async (req, res) => {
    try {
        const { notiId } = req.params;

        // 1. Find the reference notification
        const referenceNotification = await Notification.findById(notiId)
            .populate('studentId', 'name email')
            .populate('registrationId');

        if (!referenceNotification) {
            return res.status(404).json({ success: false, message: "Notification not found" });
        }

        if (referenceNotification.type !== "MANUAL_MATCH_REQUEST") {
            return res.status(400).json({ success: false, message: "Invalid notification type" });
        }

        // 2. Find all matching notifications with same criteria
        const matchingNotifications = await Notification.find({
            type: "MANUAL_MATCH_REQUEST",
            isRead: false,
            user: referenceNotification.user, // Same tutor
            subject: referenceNotification.subject,
            "selectedTimeSlot.date": referenceNotification.selectedTimeSlot.date,
            "selectedTimeSlot.startTime": referenceNotification.selectedTimeSlot.startTime,
            "selectedTimeSlot.endTime": referenceNotification.selectedTimeSlot.endTime
        })
            .populate('studentId', 'name email')
            .populate('registrationId');

        // 3. Extract student and registration information
        const studentData = matchingNotifications.map(n => ({
            notificationId: n._id,
            studentId: n.studentId?._id,
            studentName: n.studentId?.name,
            studentEmail: n.studentId?.email,
            registrationId: n.registrationId?._id
        })).filter(data => data.studentId); // Filter out any null student IDs

        res.status(200).json({
            success: true,
            count: studentData.length,
            students: studentData,
            timeslot: referenceNotification.selectedTimeSlot,
            subject: referenceNotification.subject
        });

    } catch (err) {
        console.error("Error getting matching notifications:", err);
        res.status(500).json({ success: false, message: err.message });
    }
};


// POST: Confirm manual match request (Tutor confirms)
export const confirmManualMatchRequest = async (req, res) => {
    try {
        const { notiId } = req.params;

        // 1. Find the notification
        const notification = await Notification.findById(notiId)
            .populate('registrationId')
            .populate('studentId', 'name email');

        if (!notification) {
            return res.status(404).json({ success: false, message: "Notification not found" });
        }

        if (notification.type !== "MANUAL_MATCH_REQUEST") {
            return res.status(400).json({ success: false, message: "Invalid notification type" });
        }

        if (!notification.registrationId) {
            return res.status(400).json({ success: false, message: "No registration linked to this notification" });
        }

        // 2. Get registration and tutor info
        const registration = notification.registrationId;
        const tutor = await tutorModel.findById(registration.tutorId);

        if (!tutor) {
            return res.status(404).json({ success: false, message: "Tutor not found" });
        }

        // 3. Create session from the selected timeslot
        const { date, startTime, endTime } = notification.selectedTimeSlot;

        // Create schedule map with the selected date and time
        const scheduleMap = new Map();
        scheduleMap.set(date, [{
            start: startTime,
            end: endTime
        }]);

        const newSession = await sessionModel.create({
            subject: notification.subject,
            tutor: registration.tutorId,
            location: "To be determined", // Default location
            schedule: scheduleMap,
            startDate: new Date(date),
            duration: 1, // Default 1 week
            capacity: 10, // Default capacity
            description: registration.description || `Session for ${notification.subject}`,
            students: [registration.studentId],
            status: 'Scheduled'
        });

        // 4. Update tutor's booked slots
        if (!tutor.bookedSlots) {
            tutor.bookedSlots = new Map();
        }

        const existingSlots = tutor.bookedSlots.get(date) || [];
        existingSlots.push({
            start: startTime,
            end: endTime,
            sessionId: newSession._id
        });
        tutor.bookedSlots.set(date, existingSlots);

        await tutor.save();

        // 5. Update registration status
        registration.status = "Matched";
        await registration.save();

        // 6. Mark notification as read
        notification.isRead = true;
        notification.relatedSession = newSession._id;
        await notification.save();

        // 7. Send confirmation notification to student
        await Notification.create({
            user: registration.studentId,
            studentId: registration.studentId, // Add studentId for display in notification details
            title: "Match Confirmed!",
            message: `Your tutor ${tutor.name} has confirmed your session for ${notification.subject} on ${date} at ${startTime}-${endTime}`,
            type: "MATCH_SUCCESS",
            relatedSession: newSession._id,
            metadata: {
                tutorName: tutor.name,
                subject: notification.subject,
                date,
                startTime,
                endTime
            }
        });

        res.status(200).json({
            success: true,
            message: "Match confirmed and session created successfully",
            session: newSession,
            registration
        });

    } catch (err) {
        console.error("Error confirming match request:", err);
        res.status(500).json({ success: false, message: err.message });
    }
};
