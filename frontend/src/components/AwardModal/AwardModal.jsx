import { useState, useEffect } from 'react';
import './AwardModal.css';

const AwardModal = ({ 
    isOpen, 
    onClose, 
    onSubmit, 
    students, 
    sessions, 
    editingAward 
}) => {
    const [formData, setFormData] = useState({
        studentId: '',
        sessionId: '',
        credits: '',
        scholarship: ''
    });

    // Update form data when editing award changes
    useEffect(() => {        
        if (editingAward) {
            // Extract _id from populated objects or use the value directly
            const studentIdValue = typeof editingAward.studentId === 'object' 
                ? editingAward.studentId._id 
                : editingAward.studentId;
                
            const sessionIdValue = typeof editingAward.sessionId === 'object'
                ? editingAward.sessionId._id
                : editingAward.sessionId;
            
            setFormData({
                studentId: studentIdValue || '',
                sessionId: sessionIdValue || '',
                credits: editingAward.credits || '',
                scholarship: editingAward.scholarship || ''
            });
        } else {
            resetForm();
        }
    }, [editingAward]);

    const resetForm = () => {
        setFormData({
            studentId: '',
            sessionId: '',
            credits: '',
            scholarship: ''
        });
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        
        if (['credits', 'scholarship'].includes(name)) {
            // Allow empty string or valid number
            if (value === '' || !isNaN(value)) {
                setFormData(prev => ({
                    ...prev,
                    [name]: value
                }));
            }
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: value
            }));
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        
        if (!formData.studentId || !formData.sessionId) {
            return;
        }

        // Convert to numbers before submitting
        const submitData = {
            ...formData,
            credits: Number(formData.credits) || 0,
            scholarship: Number(formData.scholarship) || 0
        };

        onSubmit(submitData);
        resetForm();
    };

    const handleClose = () => {
        resetForm();
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={handleClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>{editingAward ? 'Edit Award' : 'Create New Award'}</h2>
                    <button className="modal-close" onClick={handleClose}>
                        &times;
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="award-form">
                    <div className="form-group">
                        <label htmlFor="studentId">
                            Student <span className="required">*</span>
                        </label>
                        <select
                            id="studentId"
                            name="studentId"
                            value={formData.studentId}
                            onChange={handleInputChange}
                            required
                            disabled={editingAward !== null}
                        >
                            <option value="">-- Select a student --</option>
                            {students.map((student) => (
                                <option key={student._id} value={student._id}>
                                    {student.fullname} ({student.email})
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group">
                        <label htmlFor="sessionId">
                            Session <span className="required">*</span>
                        </label>
                        <select
                            id="sessionId"
                            name="sessionId"
                            value={formData.sessionId}
                            onChange={handleInputChange}
                            required
                            disabled={editingAward !== null}
                        >
                            <option value="">-- Select a session --</option>
                            {sessions.map((session) => (
                                <option key={session._id} value={session._id}>
                                    {session.subject || session.title || `Session ${session._id.slice(-6)}`}
                                    {session.startDate && ` - ${new Date(session.startDate).toLocaleDateString('vi-VN')}`}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group">
                        <label htmlFor="credits">
                            Credits <span className="required">*</span>
                        </label>
                        <input
                            type="number"
                            id="credits"
                            name="credits"
                            value={formData.credits}
                            onChange={handleInputChange}
                            min="0"
                            step="1"
                            required
                            placeholder="Enter credits amount"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="scholarship">
                            Scholarship (VND) <span className="required">*</span>
                        </label>
                        <input
                            type="number"
                            id="scholarship"
                            name="scholarship"
                            value={formData.scholarship}
                            onChange={handleInputChange}
                            min="0"
                            step="1000"
                            required
                            placeholder="Enter scholarship amount"
                        />
                    </div>

                    <div className="form-actions">
                        <button type="button" className="btn-cancel" onClick={handleClose}>
                            Cancel
                        </button>
                        <button type="submit" className="btn-submit">
                            {editingAward ? 'Update Award' : 'Create Award'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AwardModal;