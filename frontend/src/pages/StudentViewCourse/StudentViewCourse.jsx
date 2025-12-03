import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./StudentViewCourse.css";
import Sidebar from "../../components/Sidebar/Sidebar";
import FeedbackForm from '../../components/Sessioncard/FeedbackForm';
import { Link } from 'react-router-dom';

const CourseCard = ({ course, studentId, onCancelSuccess, onGiveFeedback }) => {
  const navigate = useNavigate();

  const dates = Object.keys(course.schedule || {});
  const firstDate = dates[0];
  const firstSlot = course.schedule?.[firstDate]?.[0] || { start: 'N/A', end: 'N/A' };

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
      {/* SỬA Ở ĐÂY: thay 'session' bằng 'course' */}
      <Link to={`/session/${course._id}`} className="title-link">
        <h3>{course.subject}</h3>
      </Link>
      <p>Tutor: {course.tutor?.name || 'Unknown'}</p>
      <p>
        Time: {firstDate} {firstSlot.start} - {firstSlot.end}
      </p>
      <p className="room">Room: {course.location || 'N/A'}</p>

      <div className="course-card-buttons">
        <button
          className="give-feedback-btn"
          onClick={() => onGiveFeedback(course)}
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
    </div>
  );
};

const StudentViewCourse = () => {
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);
  
  const user = JSON.parse(localStorage.getItem("user"));
  const studentId = user?.studentProfile;

  const fetchMyCourses = async () => {
    try {
      const res = await fetch(`/api/student/${studentId}/courses`);
      const data = await res.json();
      setCourses(data.sessions || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchMyCourses();
  }, []);

  const handleGiveFeedback = (course) => {
    console.log("Giving feedback for:", course);
    setSelectedCourse(course);
    setShowFeedbackForm(true);
  };

  const handleFeedbackSubmit = (feedbackData) => {
    console.log("Submitting feedback for:", selectedCourse?._id, feedbackData);
    
    if (selectedCourse) {
      // Cập nhật UI ngay lập tức
      setCourses(prevCourses => 
        prevCourses.map(course => 
          course._id === selectedCourse._id 
            ? { ...course, studentFeedback: feedbackData }
            : course
        )
      );
    }
    
    setShowFeedbackForm(false);
    setSelectedCourse(null);
    alert("Feedback submitted successfully!");
  };

  const handleFeedbackCancel = () => {
    setShowFeedbackForm(false);
    setSelectedCourse(null);
  };

  return (
    <div className={`mycourses-container ${showFeedbackForm ? 'modal-open' : ''}`}>
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
              onGiveFeedback={handleGiveFeedback}
            />
          ))
        )}
      </div>

      {/* Modal FeedbackForm */}
      {showFeedbackForm && selectedCourse && (
        <FeedbackForm
          session={selectedCourse}
          onSubmit={handleFeedbackSubmit}
          onCancel={handleFeedbackCancel}
        />
      )}
    </div>
  );
};

export default StudentViewCourse;