import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./StudentViewCourse.css";
import Sidebar from "../../components/Sidebar/Sidebar";
import FeedbackForm from '../../components/Sessioncard/FeedbackForm';
import { Link } from 'react-router-dom';

const CourseCard = ({ course, studentId, onCancelSuccess }) => {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const dates = Object.keys(course.schedule);
  const firstDate = dates[0];
  const firstSlot = course.schedule[firstDate][0];
  const [showFeedbackForm, setShowFeedbackForm] = React.useState(false);

  const handleReschedule = () => {
    navigate(`/selecttimeslot/${course._id}`);
  };

  const handleCancel = async () => {
    if (!window.confirm(`Cancel course "${course.subject}" ?`)) return;

    try {
      const res = await fetch(
        `/api/student/session/${course._id}/cancel/${studentId}`,
        {
          method: "DELETE",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
          },
        }
      );

      const data = await res.json();
      if (data.success) {
        alert("Course has been canceled.");
        onCancelSuccess();
      } else {
        alert(data.message || "Error canceling course.");
      }
    } catch (err) {
      console.error(err);
      alert("Server error.");
    }
  };

  return (
    <div className="course-card">
      <Link to={`/session/${course._id}`} className="title-link">
        <h3>{course.subject}</h3>
      </Link>
      <p>Tutor: {course.tutor?.name}</p>
      <p>
        Time: {firstDate} {firstSlot.start} - {firstSlot.end}
      </p>
      <p className="room">Room: {course.location}</p>

      <div className="course-card-buttons">
        <button
          className="give-feedback-btn"
          onClick={() => setShowFeedbackForm(true)}
        >
          📝 Give Feedback
        </button>
        <button className="reschedule-btn" onClick={handleReschedule}>
          Reschedule
        </button>
        <button className="cancel-btn" onClick={handleCancel}>
          Cancel
        </button>
      </div>

      {showFeedbackForm && (
        <FeedbackForm
          session={course}
          onCancel={() => setShowFeedbackForm(false)}
        />
      )}
    </div>
  );
};

const StudentViewCourse = () => {
  const [courses, setCourses] = useState([]);
  const user = JSON.parse(localStorage.getItem("user"));
  const studentId = user?.studentProfile;
  const token = localStorage.getItem("token");

  const fetchMyCourses = async () => {
    try {
      const res = await fetch(`/api/student/${studentId}/courses`, {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
      });

      const data = await res.json();
      setCourses(data.sessions || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchMyCourses();
  }, []);

  return (
    <div className="mycourses-container">
      <Sidebar />

      <div className="courses-list">
        {courses.length === 0 ? (
          <p style={{ textAlign: "center", color: "#666" }}>
            You have no registered courses.
          </p>
        ) : (
          courses.map((course) => (
            <CourseCard
              key={course._id}
              course={course}
              studentId={studentId}
              onCancelSuccess={fetchMyCourses}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default StudentViewCourse;