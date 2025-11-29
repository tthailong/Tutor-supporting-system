import React, { useEffect, useState } from "react";
import "./NotificationPage.css";
import Sidebar from "../../components/Sidebar/Sidebar";
import { confirmMatchRequest } from "../../services/apiService";
const NotificationPage = () => {
  const user = JSON.parse(localStorage.getItem("user"));
  console.log("Loaded user from localStorage:", user);
  
  const userId = user?.id;
  console.log("Derived userId:", userId);
  
  const [notifications, setNotifications] = useState([]);
  const [confirmingId, setConfirmingId] = useState(null);
  const loadNoti = async () => {
    const res = await fetch(`/api/notifications/${userId}`);
    const data = await res.json();
    setNotifications(data.notifications);
  };
  const markRead = async (id) => {
    await fetch(`/api/notifications/${id}/read`, {
      method: "PUT"
    });
    loadNoti();
  };
  const handleConfirmMatch = async (notificationId) => {
    if (!window.confirm("Are you sure you want to confirm this match request?")) {
      return;
    }
    setConfirmingId(notificationId);
    
    try {
      await confirmMatchRequest(notificationId);
      alert("Match confirmed successfully! Session has been created.");
      loadNoti(); // Reload notifications
    } catch (err) {
      alert("Failed to confirm match: " + (err.response?.data?.message || err.message));
      console.error("Error confirming match:", err);
    } finally {
      setConfirmingId(null);
    }
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
                    onClick={() => handleConfirmMatch(n._id)}
                    disabled={confirmingId === n._id}
                  >
                    {confirmingId === n._id ? 'Confirming...' : 'Confirm Match'}
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
    </div>
  );
};
export default NotificationPage;