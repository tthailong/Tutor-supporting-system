import React, { useState } from "react";
import "./Profile.css";

export default function Profile() {
  const [category, setCategory] = useState("student");
  const [subjects, setSubjects] = useState({
    calculus1: false,
    calculus2: false,
    physics1: false,
    physics2: false,
  });
  const [selectedTutor, setSelectedTutor] = useState("");

  function toggleSubject(key) {
    setSubjects((s) => ({ ...s, [key]: !s[key] }));
  }

  function handleReset() {
    setCategory("student");
    setSubjects({ calculus1: false, calculus2: false, physics1: false, physics2: false });
    setSelectedTutor("");
  }

  function handleSave(e) {
    e.preventDefault();
    const data = { category, subjects, selectedTutor };
    console.log("Profile saved:", data);
    alert("Saved (see console)");
  }

  return (
    <div className="profile-root">
      <div className="profile-card">
        <div className="profile-left">
          <div className="avatar" aria-hidden="true" />
        </div>

        <div className="profile-right">
          <h1 className="profile-name">Nguyen Van C</h1>
          <div className="profile-quote">
            <div className="quote-label">Quote:</div>
            <div className="quote-text">“Underidoderidoderidooderidoo.”</div>
            <div className="quote-author">— Sir Winston Churchill.</div>
          </div>

          <div className="info-grid">
            <div className="info-item"><span className="info-key">ID:</span> <strong>2345678</strong></div>
            <div className="info-item"><span className="info-key">Email:</span> c.nguyenc@hcmut.edu.vn</div>
            <div className="info-item"><span className="info-key">GPA:</span> 9001</div>
            <div className="info-item"><span className="info-key">Contact:</span> 0123456789</div>
          </div>
        </div>
      </div>

      <form className="profile-form" onSubmit={handleSave}>
        <div className="category-bar">Category</div>

        <div className="category-row">
          <label className={`radio-pill ${category === "student" ? "checked" : ""}`}>
            <input type="radio" name="category" value="student" checked={category === "student"} onChange={() => setCategory("student")} />
            <span>Student</span>
          </label>

          <label className={`radio-pill ${category === "tutor" ? "checked" : ""}`}>
            <input type="radio" name="category" value="tutor" checked={category === "tutor"} onChange={() => setCategory("tutor")} />
            <span>Tutor</span>
          </label>

          <label className={`radio-pill ${category === "other" ? "checked" : ""}`}>
            <input type="radio" name="category" value="other" checked={category === "other"} onChange={() => setCategory("other")} />
            <span>Other</span>
          </label>
        </div>

        <div className="two-columns">
          <div className="panel">
            <div className="panel-title">Current Subjects</div>
            <div className="options">
              <label className="option">
                <input type="checkbox" checked={subjects.calculus1} onChange={() => toggleSubject("calculus1")} />
                <span>Calculus 1</span>
              </label>
              <label className="option">
                <input type="checkbox" checked={subjects.calculus2} onChange={() => toggleSubject("calculus2")} />
                <span>Calculus 2</span>
              </label>
              <label className="option">
                <input type="checkbox" checked={subjects.physics1} onChange={() => toggleSubject("physics1")} />
                <span>Physics 1</span>
              </label>
              <label className="option">
                <input type="checkbox" checked={subjects.physics2} onChange={() => toggleSubject("physics2")} />
                <span>Physics 2</span>
              </label>
            </div>
          </div>

          <div className="panel">
            <div className="panel-title">Current Tutors</div>
            <div className="options">
              {[
                "Nguyen Van A",
                "Tran Thi B",
                "Le Van C",
                "Nguyen Van C",
              ].map((t) => (
                <label className="option" key={t}>
                  <input type="radio" name="tutor" value={t} checked={selectedTutor === t} onChange={() => setSelectedTutor(t)} />
                  <span>{t}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        <div className="buttons-row">
          <button type="submit" className="btn save">Save</button>
          <button type="button" className="btn reset" onClick={handleReset}>Reset</button>
        </div>
      </form>
    </div>
  );
}
