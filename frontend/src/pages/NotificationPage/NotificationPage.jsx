import React, { useEffect, useState } from "react";
import "./NotificationPage.css";
import Sidebar from "../../components/Sidebar/Sidebar";

const NotificationPage = () => {
  const userId = "677e4a15c121f612cc2d9a3b"; // TODO: lấy từ auth
  const [notifications, setNotifications] = useState([]);

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

  useEffect(() => {
    loadNoti();
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
            className={`noti-card ${n.isRead ? "read" : "unread"}`}
          >
            <h3>{n.title}</h3>
            <p>{n.message}</p>

            <div className="noti-footer">
              <span className="date">{new Date(n.createdAt).toLocaleString()}</span>

              {!n.isRead && (
                <button className="mark-btn" onClick={() => markRead(n._id)}>
                  Mark as Read
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NotificationPage;