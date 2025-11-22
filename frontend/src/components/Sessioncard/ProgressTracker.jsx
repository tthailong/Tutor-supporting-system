import React, { useState } from 'react';
import './ProgressTracker.css';

const ProgressTracker = ({ session, onSave, onCancel }) => {
  const [progress, setProgress] = useState({
    studentName: session.tutorProgress?.studentName || '',
    studentId: session.tutorProgress?.studentId || '',
    strengths: session.tutorProgress?.strengths || '',
    weaknesses: session.tutorProgress?.weaknesses || '',
    suggestions: session.tutorProgress?.suggestions || '',
    overallStatus: session.tutorProgress?.overallStatus || ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!progress.overallStatus) {
      alert('Please select an overall status before saving.');
      return;
    }

    if (!progress.studentName.trim()) {
      alert('Please enter student name before saving.');
      return;
    }

    setIsSubmitting(true);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    onSave({
      ...progress,
      studentName: progress.studentName.trim(),
      studentId: progress.studentId.trim(),
      lastUpdated: new Date().toISOString()
    });
    
    setIsSubmitting(false);
  };

  const handleInputChange = (field, value) => {
    setProgress(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="progress-modal-overlay">
      <div className="progress-modal">
        <div className="progress-form">
          <div className="form-header">
            <h3>📊 Record Student Progress</h3>
            <p>Track and document student development for: <strong>{session.title}</strong></p>
          </div>
          
          <form onSubmit={handleSubmit}>
            {/* FIXED: Student Input Fields - ĐẢM BẢO PHẦN NÀY HIỂN THỊ */}
              <div className="form-group">
                <label className="form-label required">
                  Student Information
                </label>
                <div className="student-input-fields">
                  {/* XÓA div.input-row và để trực tiếp các input-group */}
                  <div className="input-group">
                    <label className="input-label">Full Name *</label>
                    <input
                      type="text"
                      value={progress.studentName}
                      onChange={(e) => handleInputChange('studentName', e.target.value)}
                      placeholder="Enter student's full name"
                      className="form-input"
                      required
                    />
                  </div>
                  
                  <div className="input-group">
                    <label className="input-label">Student ID</label>
                    <input
                      type="text"
                      value={progress.studentId}
                      onChange={(e) => handleInputChange('studentId', e.target.value)}
                      placeholder="Enter student ID (optional)"
                      className="form-input"
                    />
                  </div>
                  
                  <div className="input-hint">
                    💡 You can enter any student's information, not limited to session participants
                  </div>
                </div>
              </div>
            
            {/* FIXED: Đảm bảo các phần khác hiển thị đúng */}
            <div className="form-group">
              <label className="form-label">
                Strengths & Positive Points 
                <span className="optional-badge">Optional</span>
              </label>
              <textarea
                value={progress.strengths}
                onChange={(e) => handleInputChange('strengths', e.target.value)}
                placeholder="What are the student's strong points? What did they do well?"
                rows="3"
                className="form-textarea"
              />
            </div>
            
            <div className="form-group">
              <label className="form-label">
                Areas for Improvement
                <span className="optional-badge">Optional</span>
              </label>
              <textarea
                value={progress.weaknesses}
                onChange={(e) => handleInputChange('weaknesses', e.target.value)}
                placeholder="Which areas need more attention? What challenges are they facing?"
                rows="3"
                className="form-textarea"
              />
            </div>
            
            <div className="form-group">
              <label className="form-label">
                Recommendations & Suggestions
                <span className="optional-badge">Optional</span>
              </label>
              <textarea
                value={progress.suggestions}
                onChange={(e) => handleInputChange('suggestions', e.target.value)}
                placeholder="What should the student focus on next? Any specific recommendations?"
                rows="3"
                className="form-textarea"
              />
            </div>
            
            <div className="form-group">
              <label className="form-label required">
                Overall Progress Status
              </label>
              <div className="status-options">
                {[
                  { value: 'Excellent', label: 'Excellent', desc: 'Outstanding performance', color: '#38a169' },
                  { value: 'Good', label: 'Good', desc: 'Meeting expectations', color: '#4299e1' },
                  { value: 'Average', label: 'Average', desc: 'Satisfactory progress', color: '#d69e2e' },
                  { value: 'Needs Improvement', label: 'Needs Improvement', desc: 'Requires additional support', color: '#e53e3e' }
                ].map(status => (
                  <label 
                    key={status.value} 
                    className={`status-option ${progress.overallStatus === status.value ? 'selected' : ''}`}
                    style={{ '--status-color': status.color }}
                  >
                    <input
                      type="radio"
                      value={status.value}
                      checked={progress.overallStatus === status.value}
                      onChange={(e) => handleInputChange('overallStatus', e.target.value)}
                      className="status-radio"
                    />
                    <div className="status-content">
                      <span className="status-label">{status.label}</span>
                      <span className="status-desc">{status.desc}</span>
                    </div>
                    <div className="status-indicator"></div>
                  </label>
                ))}
              </div>
            </div>
            
            <div className="form-summary">
              <div className="summary-header">Progress Summary</div>
              <div className="summary-content">
                <div className="summary-item">
                  <span>Student:</span>
                  <strong>{progress.studentName || 'Not entered'}</strong>
                </div>
                {progress.studentId && (
                  <div className="summary-item">
                    <span>Student ID:</span>
                    <strong>{progress.studentId}</strong>
                  </div>
                )}
                <div className="summary-item">
                  <span>Status:</span>
                  <strong className={`status-preview ${progress.overallStatus ? progress.overallStatus.toLowerCase().replace(' ', '-') : 'none'}`}>
                    {progress.overallStatus || 'Not selected'}
                  </strong>
                </div>
                <div className="summary-item">
                  <span>Last Updated:</span>
                  <span>{new Date().toLocaleDateString('vi-VN')}</span>
                </div>
              </div>
            </div>
            
            <div className="form-actions">
              <button 
                type="button" 
                onClick={onCancel} 
                className="btn btn-cancel"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="btn btn-submit"
                disabled={isSubmitting || !progress.overallStatus || !progress.studentName.trim()}
              >
                {isSubmitting ? (
                  <>
                    <div className="loading-spinner"></div>
                    Saving...
                  </>
                ) : (
                  '💾 Save Progress'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProgressTracker;