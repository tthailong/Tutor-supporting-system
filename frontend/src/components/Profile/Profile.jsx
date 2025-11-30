import React, { useEffect, useState } from "react";
import "./Profile.css";
import api from "../../services/apiService";

export default function Profile() {
  const storedUser = JSON.parse(localStorage.getItem("user") || "null");

  // Read-only user fields from User schema
  const [user, setUser] = useState(storedUser || null);

  // Editable student/tutor profiles (may be null if not present)
  const [student, setStudent] = useState(null);
  const [tutor, setTutor] = useState(null);
  const [studentSubjects, setStudentSubjects] = useState([]);
  const [studentTutors, setStudentTutors] = useState([]);
  const [tutorSubjects, setTutorSubjects] = useState([]);
  const [tutorStats, setTutorStats] = useState({ rating: null, totalSessions: null, activeStudents: null });

  const [loading, setLoading] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");

  // Determine contact value from multiple possible fields
  const contact = user?.phoneNumber || user?.phone || student?.phone || tutor?.phone || "";

  useEffect(() => {
    // If user present in localStorage, try to fetch fresh copy from backend
    const fetchData = async () => {
      if (!user) return;
      setLoading(true);
      try {
        // Resolve possible id key (_id vs id)
        const userId = user.id || user._id;
        // Try to get user from backend to ensure fields are up-to-date
        const res = await api.get(`/api/users/${userId}`);
        if (res?.data?.data) {
          setUser(res.data.data);
          // Also update localStorage copy so other parts of app stay in sync
          localStorage.setItem("user", JSON.stringify(res.data.data));
        }

        // If user has studentProfile ID (or populated object), try to load it and student's sessions
        const rawStudentProfile = (res?.data?.data?.studentProfile) || user.studentProfile;
        const studentId = rawStudentProfile && (typeof rawStudentProfile === 'string' ? rawStudentProfile : (rawStudentProfile._id || rawStudentProfile.id));
        if (studentId) {
          try {
            // Try loading student profile if endpoint exists
            const sRes = await api.get(`/api/students/${studentId}`);
            if (sRes?.data?.data) setStudent(sRes.data.data);
          } catch (err) {
            setStudent(prev => prev || { hcmutID: "", description: "", gpa: "", currentSubjects: [], currentTutors: [] });
          }

          // Fetch sessions for this student to derive current subjects and tutors
          try {
            const coursesRes = await api.get(`/api/student/${studentId}/courses`);
            const sessions = coursesRes?.data?.sessions || coursesRes?.data?.data || [];
            // extract unique subjects and tutor names
            const subjects = Array.from(new Set(sessions.map(s => s.subject).filter(Boolean)));
            const tutors = Array.from(new Set(sessions.map(s => (s.tutor && (s.tutor.name || s.tutor)) || null).filter(Boolean)));
            setStudentSubjects(subjects);
            setStudentTutors(tutors);
          } catch (err) {
            // ignore if endpoint not available
          }
        }

        // If user has tutorProfile ID, try to load it and tutor sessions/stats
        const rawTutorProfile = (res?.data?.data?.tutorProfile) || user.tutorProfile;
        const tutorId = rawTutorProfile && (typeof rawTutorProfile === 'string' ? rawTutorProfile : (rawTutorProfile._id || rawTutorProfile.id));
        if (tutorId) {
          try {
            const tRes = await api.get(`/api/tutors/${tutorId}`);
            if (tRes?.data) {
              if (tRes.data?.tutor) setTutor(tRes.data.tutor);
              else if (tRes.data?.data) setTutor(tRes.data.data);
              else setTutor(prev => prev || { expertise: [], description: "" });
            }
          } catch (err) {
            setTutor(prev => prev || { expertise: [], description: "" });
          }

          // Fetch sessions taught by tutor to extract subjects
          try {
            const sessionsRes = await api.get(`/api/session/tutor/${tutorId}`);
            const sessions = sessionsRes?.data?.data || [];
            const subjects = Array.from(new Set(sessions.map(s => s.subject).filter(Boolean)));
            setTutorSubjects(subjects);
          } catch (err) {
            // ignore
          }

          // Try to fetch tutor stats (rating, totalSessions, activeStudents) via matching list
          try {
            const tutorsListRes = await api.get(`/api/matching/tutors?page=1&limit=50`);
            const tutorsList = tutorsListRes?.data?.tutors || [];
            const found = tutorsList.find(t => String(t._id) === String(tutorId));
            if (found) {
              setTutorStats({ rating: found.rating, totalSessions: found.totalSessions, activeStudents: found.activeStudents });
            }
          } catch (err) {
            // ignore
          }
        }

      } catch (err) {
        console.warn("Could not fetch user from backend, using local copy.", err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!user) {
    return <div className="profile-root">No user is logged in.</div>;
  }

  // Handlers for editable profile parts
  const handleStudentChange = (field, value) => {
    setStudent(prev => ({ ...(prev || {}), [field]: value }));
  };

  const handleTutorChange = (field, value) => {
    setTutor(prev => ({ ...(prev || {}), [field]: value }));
  };

  const saveStudent = async (e) => {
    e.preventDefault();
    if (!student) return;
    setSaveMessage("");
    try {
      // Try to PUT to backend if endpoint exists
      if (student._id) {
        const res = await api.put(`/api/students/${student._id}`, student);
        setSaveMessage(res?.data?.message || "Student profile updated");
      } else {
        // No backend endpoint: store locally as a fallback
        localStorage.setItem("student_profile_temp", JSON.stringify(student));
        setSaveMessage("Saved locally (no backend student endpoint)");
      }
    } catch (err) {
      console.error(err);
      setSaveMessage("Failed to save student profile: " + (err?.response?.data?.message || err.message));
    }
  };

  const saveTutor = async (e) => {
    e.preventDefault();
    if (!tutor) return;
    setSaveMessage("");
    try {
      if (tutor._id) {
        const res = await api.put(`/api/tutors/${tutor._id}`, tutor);
        setSaveMessage(res?.data?.message || "Tutor profile updated");
      } else {
        localStorage.setItem("tutor_profile_temp", JSON.stringify(tutor));
        setSaveMessage("Saved locally (no backend tutor update endpoint)");
      }
    } catch (err) {
      console.error(err);
      setSaveMessage("Failed to save tutor profile: " + (err?.response?.data?.message || err.message));
    }
  };

  return (
    <div className="profile-root">
      <div className="profile-card">
        <div className="profile-left">
          <div className="avatar" aria-hidden="true" />
        </div>

        <div className="profile-right">
          <h1 className="profile-name">{user.fullname || "Unnamed"}</h1>
          <div className="profile-quote">
            <div className="quote-label">Description:</div>
            <div className="quote-text">{(student && student.description) || (tutor && tutor.description) || ""}</div>
          </div>

          <div className="info-grid">
            <div className="info-item"><span className="info-key">Hcmut ID:</span> <strong>{user.hcmutID || ""}</strong></div>
            <div className="info-item"><span className="info-key">Email:</span> {user.email}</div>
            <div className="info-item"><span className="info-key">Role:</span> {user.role}</div>
            <div className="info-item"><span className="info-key">Contact:</span> {contact}</div>
          </div>
        </div>
      </div>

      <div className="profile-form">
        {/* Read-only summaries for Student or Tutor */}
        {user.role === "Student" && (
          <div className="panel">
            <div className="panel-title">Current Enrollments</div>
            <div className="options">
              <label className="option field">
                <span>Current Subjects</span>
                <input className="full-input" type="text" value={studentSubjects.join(', ') || "None"} readOnly />
              </label>
              <label className="option field">
                <span>Current Tutors</span>
                <input className="full-input" type="text" value={studentTutors.join(', ') || "None"} readOnly />
              </label>
            </div>
          </div>
        )}

        {user.role === "Tutor" && (
          <div className="panel">
            <div className="panel-title">Tutor Summary</div>
            <div className="options">
              <label className="option field">
                <span>Current Subjects</span>
                <input className="full-input" type="text" value={tutorSubjects.join(', ') || "None"} readOnly />
              </label>
              <label className="option field">
                <span>Rating</span>
                <input className="full-input" type="text" value={tutorStats.rating ?? "-"} readOnly />
              </label>
              <label className="option field">
                <span>Total Sessions</span>
                <input className="full-input" type="text" value={tutorStats.totalSessions ?? "-"} readOnly />
              </label>
              <label className="option field">
                <span>Active Students</span>
                <input className="full-input" type="text" value={tutorStats.activeStudents ?? "-"} readOnly />
              </label>
            </div>
          </div>
        )}

        {/* Student editable panel */}
        {user.role === "Student" && (
          <form onSubmit={saveStudent} className="panel">
            <div className="panel-title">Edit Student Profile</div>
            <div className="options">
              <label className="option full-option">
                <span>GPA</span>
                <input className="full-input" type="number" step="0.01" min="0" max="10" value={student?.gpa ?? ""} onChange={(e) => handleStudentChange('gpa', e.target.value)} />
              </label>
              <label className="option full-option">
                <span>Description</span>
                <textarea className="full-input" value={student?.description || ""} onChange={(e) => handleStudentChange('description', e.target.value)} />
              </label>
            </div>
            <div className="buttons-row">
              <button type="submit" className="btn save">Save Student</button>
            </div>
          </form>
        )}

        {/* Tutor editable panel */}
        {user.role === "Tutor" && (
          <form onSubmit={saveTutor} className="panel">
            <div className="panel-title">Edit Tutor Profile</div>
            <div className="options">
              <label className="option full-option">
                <span>Expertise (comma separated)</span>
                <input className="full-input" type="text" value={(tutor?.expertise || []).join(', ')} onChange={(e) => handleTutorChange('expertise', e.target.value.split(',').map(s=>s.trim()))} />
              </label>
              <label className="option full-option">
                <span>Description</span>
                <textarea className="full-input" value={tutor?.description || ""} onChange={(e) => handleTutorChange('description', e.target.value)} />
              </label>
            </div>
            <div className="buttons-row">
              <button type="submit" className="btn save">Save Tutor</button>
            </div>
          </form>
        )}

        {saveMessage && <div className="save-message">{saveMessage}</div>}
      </div>
    </div>
  );
}
