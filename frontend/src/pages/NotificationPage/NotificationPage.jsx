import React, { useEffect, useState } from "react";
import "./NotificationPage.css";
import Sidebar from "../../components/Sidebar/Sidebar";
import { confirmMatchRequest } from "../../services/apiService";
import Sessionform from '../../components/Sessionform/Sessionform';

const NotificationPage = () => {
  const user = JSON.parse(localStorage.getItem("user"));
  console.log("Loaded user from localStorage:", user);
  const token = localStorage.getItem("token"); // <-- retrieve token separately
  const TUTOR_ID = user?.tutorProfile;

  const userId = user?._id || user?.id;

  console.log("Derived userId:", userId);

  const [notifications, setNotifications] = useState([]);
  const [confirmingId, setConfirmingId] = useState(null);
  const loadNoti = async () => {
    const res = await fetch(`/api/notifications/${userId}`);
    const data = await res.json();
    setNotifications(data.notifications || []);
  };
  const markRead = async (id) => {
    await fetch(`/api/notifications/${id}/read`, {
      method: "PUT"
    });
    loadNoti();
  };


  const [isFormOpen, setIsFormOpen] = useState(false);
  const [currentSession, setCurrentSession] = useState(null);
  // 4. Prepare Edit Form
  const handleEditClick = (session) => {
    // Get the explicit date key from the schedule map
    const scheduleKeys = Object.keys(session.schedule || {}).sort();
    const firstDateString = scheduleKeys.length > 0 ? scheduleKeys[0] : null;


    // Get the slots for that date
    const timeSlots = firstDateString ?
      session.schedule[firstDateString].map(t => `${t.start} - ${t.end}`) : [];

    const uiSession = {
      _id: session._id,
      name: session.subject,
      location: session.location,
      capacity: session.capacity,
      duration: session.duration,
      description: session.description,
      studentCount: session.students ? session.students.length : 0,
      startDate: firstDateString,
      timeSlots: timeSlots
    };

    setCurrentSession(uiSession);
    setIsFormOpen(true);
  };

  const handleReviewMatch = async (notification) => {
    try {
      // Fetch all matching notifications for the same timeslot/subject/tutor
      const response = await fetch(`/api/notifications/${notification._id}/matching`);
      const data = await response.json();

      if (!response.ok) {
        console.error("Failed to fetch matching notifications:", data.message);
        // Fall back to single student if API fails
        handleReviewMatchSingle(notification);
        return;
      }
      const { students, count } = data;

      // Find the full registration data linked to the notification
      const registration = notification.registrationId;
      // Prepare data structure expected by the Sessionform
      const dateKey = notification.selectedTimeSlot.date;
      const timeSlotStr = `${notification.selectedTimeSlot.startTime} - ${notification.selectedTimeSlot.endTime}`;
      const prefilledSessionData = {
        name: notification.subject,
        location: "TBD - Please enter room",
        capacity: count, // Set to number of requesting students
        minimumCapacity: count, // NEW: Minimum capacity (cannot be decreased)
        duration: 1,
        description: registration?.description || `Session for ${notification.subject}`,
        startDate: dateKey,
        timeSlots: [timeSlotStr],
        // Metadata for batch enrollment
        studentIds: students.map(s => s.studentId), // All student IDs
        registrationIds: students.map(s => s.registrationId).filter(Boolean), // All registration IDs
        notificationIds: students.map(s => s.notificationId), // All notification IDs
        studentCount: count, // Number of students requesting this timeslot
      };
      setCurrentSession(prefilledSessionData);
      setIsFormOpen(true);
    } catch (error) {
      console.error("Error fetching matching notifications:", error);
      // Fall back to single student
      handleReviewMatchSingle(notification);
    }
  };

  // ADD THIS NEW FALLBACK FUNCTION (place it after handleReviewMatch):
  const handleReviewMatchSingle = (notification) => {
    const registration = notification.registrationId;
    const dateKey = notification.selectedTimeSlot.date;
    const timeSlotStr = `${notification.selectedTimeSlot.startTime} - ${notification.selectedTimeSlot.endTime}`;
    const prefilledSessionData = {
      name: notification.subject,
      location: "TBD - Please enter room",
      capacity: 5,
      duration: 1,
      description: registration?.description || `Session for ${notification.subject}`,
      startDate: dateKey,
      timeSlots: [timeSlotStr],
      notificationId: notification._id,
      registrationId: registration?._id,
      studentId: notification.studentId?._id,
    };
    setCurrentSession(prefilledSessionData);
    setIsFormOpen(true);
  };

  const handleConfirmMatch = async (notification) => {
    if (!window.confirm("Are you sure you want to confirm this match request?")) {
      return;
    }
    handleReviewMatch(notification);
    //setConfirmingId(notificationId);

    /*try {
      await confirmMatchRequest(notificationId);
      alert("Match confirmed successfully! Session has been created.");
      loadNoti(); // Reload notifications
    } catch (err) {
      alert("Failed to confirm match: " + (err.response?.data?.message || err.message));
      console.error("Error confirming match:", err);
    } finally {
      setConfirmingId(null);
    }*/
  };

  const handleConfirmReschedule = async (notification) => {
    if (!window.confirm("Confirming this will immediately change the session time. Proceed?")) {
      return;
    }

    setConfirmingId(notification._id);

    try {
      // Data required by the backend to finalize the reschedule
      const payload = {
        // New time and date are stored in the notification metadata
        date: notification.newDate,
        start: notification.newStart,
        end: notification.newEnd,

        // Notification ID is sent to mark as read/completed on success
        notificationId: notification._id
      };

      // 🛑 Assumes a new API endpoint exists to handle confirmation
      const res = await fetch(`/api/tutor/reschedule-request/${notification.oldSessionId}/confirm`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (data.success) {
        alert(`Session rescheduled to ${payload.date} ${payload.start}-${payload.end}. Student has been notified.`);
        loadNoti(); // Refresh notifications
      } else {
        alert("Reschedule failed: " + data.message);
      }
    } catch (err) {
      console.error("Error confirming reschedule:", err);
      alert("Server error confirming reschedule.");
    } finally {
      setConfirmingId(null);
    }
  };

  const handleSave = async (formData) => {
    try {
      // 1. Prepare Schedule Data
      const selectedDate = formData.startDate;
      const slotsArray = formData.timeSlots.map(slotStr => {
        const [start, end] = slotStr.split(" - ");
        return { start: start.trim(), end: end.trim() };
      });

      const scheduleMapObject = {};
      if (selectedDate && slotsArray.length > 0) {
        scheduleMapObject[selectedDate] = slotsArray;
      } else {
        throw new Error("Please select a Start Date and at least one Time Slot.");
      }

      // 2. Build Base Payload
      const payload = {
        tutorId: TUTOR_ID,
        subject: formData.name,
        location: formData.location,
        startDate: new Date(selectedDate),
        duration: parseInt(formData.duration),
        capacity: parseInt(formData.capacity),
        description: formData.description,
        schedule: scheduleMapObject
      };

      let url = `api/session/create`;
      let method = 'POST';

      // 3. Check for Match Request Metadata (if currentSession exists, it's a review)
      if (currentSession?.studentIds && currentSession.studentIds.length > 0) {
        // Batch enrollment from matching notifications
        payload.studentIdsToEnroll = currentSession.studentIds;
        payload.registrationIds = currentSession.registrationIds;
        payload.notificationIds = currentSession.notificationIds;
      } else if (currentSession?.registrationId) {
        // Single student enrollment (backward compatibility)
        payload.registrationId = currentSession.registrationId;
        payload.studentIdToEnroll = currentSession.studentId;
      } else if (currentSession && currentSession._id) {
        // This case handles generic EDIT (if implemented)
        url = `api/session/${currentSession._id}`;
        method = 'PUT';
        // ... (Add restricted payload logic for PUT if needed, similar to Sessionlist) ...
      }

      // 4. Execute API Call
      const token = localStorage.getItem("token");;
      const res = await fetch(url, {
        method: method,
        headers: {
          "Content-Type": "application/json",
          ...(token && { "Authorization": `Bearer ${token}` })
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      // 5. Handle Response
      if (res.ok) {
        if (currentSession?.notificationIds && currentSession.notificationIds.length > 0) {
          alert(`Match confirmed! Session created with ${currentSession.studentCount} students.`);
          // Notifications are marked as read by the backend
        } else if (currentSession?.registrationId) {
          alert("Match confirmed! Session created successfully.");
          await markRead(currentSession.notificationId);
        } else {
          alert(currentSession ? "Session updated!" : "Session created!");
        }

        // Close form and refresh notifications
        handleFormClose();
      } else {
        alert("Error: " + data.message);
      }
    } catch (error) {
      console.error("Save failed:", error);
      alert(`Save failed: ${error.message}`);
    }
  };
  const handleFormClose = () => {
    setIsFormOpen(false);
    setCurrentSession(null);
    loadNoti(); // Reload notifications after closing the form
  };

  useEffect(() => {
    loadNoti();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <div className="notification-container">
      <Sidebar />
      <div className="notification-list">
        <h2>Notifications</h2>
        {notifications.length === 0 && (
          <p className="empty">No notifications</p>
        )}
        {notifications.map((n) => (
          <div
            key={n._id}
            className={`noti-card ${n.isRead ? "read" : "unread"} ${n.type === 'MANUAL_MATCH_REQUEST' ? 'match-request' : ''}`}
          >
            <h3>{n.title}</h3>
            <p>{n.message}</p>
            {/* Display match request details */}
            {n.type === 'MANUAL_MATCH_REQUEST' && n.subject && n.selectedTimeSlot && (
              <div className="match-details">
                <div className="detail-item">
                  <strong>Subject:</strong> {n.subject}
                </div>
                <div className="detail-item">
                  <strong>Date:</strong> {n.selectedTimeSlot.date}
                </div>
                <div className="detail-item">
                  <strong>Time:</strong> {n.selectedTimeSlot.startTime} - {n.selectedTimeSlot.endTime}
                </div>
                {n.studentId && (
                  <div className="detail-item">
                    <strong>Student:</strong> {n.studentId.name || 'N/A'}
                  </div>
                )}
              </div>
            )}
            <div className="noti-footer">
              <span className="date">{new Date(n.createdAt).toLocaleString()}</span>
              <div className="noti-actions">
                {/* Confirm button for manual match requests */}
                {n.type === 'MANUAL_MATCH_REQUEST' && !n.isRead && (
                  <button
                    className="confirm-btn"
                    //onClick={() => handleConfirmMatch(n._id)}
                    onClick={() => handleConfirmMatch(n)}
                    disabled={confirmingId === n._id}
                  >
                    {/*{confirmingId === n._id ? 'Confirming...' : 'Confirm Match'}*/}
                    Confirm Match
                  </button>
                )}
                {n.type === 'RESCHEDULE_REQUEST' && !n.isRead && (
                  <button
                    className="confirm-btn"
                    onClick={() => handleConfirmReschedule(n)}
                    disabled={confirmingId === n._id}
                  >
                    {/*{confirmingId === n._id ? 'Approving...' : 'Approve Reschedule'}*/}
                    reschedule
                  </button>
                )}
                {!n.isRead && (
                  <button className="mark-btn" onClick={() => markRead(n._id)}>
                    Mark as Read
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
      <Sessionform
        isOpen={isFormOpen}
        onClose={() => { setIsFormOpen(false); setCurrentSession(null); }}
        onSave={handleSave}
        sessionData={currentSession}
      />
    </div>
  );
};
export default NotificationPage;