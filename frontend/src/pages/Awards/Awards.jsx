import { useState, useEffect } from 'react';
<<<<<<< HEAD
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
=======
import './Awards.css';
import axios from 'axios';
import { toast } from 'react-toastify';
import AwardModal from '../../components/AwardModal/AwardModal';
import Sidebar from '../../components/Sidebar/Sidebar';

const Awards = () => {
    const [students, setStudents] = useState([]);
    const [sessions, setSessions] = useState([]);
    const [awards, setAwards] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingAward, setEditingAward] = useState(null);
    
    const API_URL = 'http://localhost:4000/api';
    const user = JSON.parse(localStorage.getItem("user"));
    const TUTOR_ID = user?.tutorProfile;

    useEffect(() => {
        if (TUTOR_ID) {
            fetchAllData();
        }
    }, [TUTOR_ID]);

    const fetchAllData = async () => {
        if (!TUTOR_ID) {
            toast.error('Tutor ID not found. Please log in.');
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            const [studentsRes, sessionsRes, awardsRes] = await Promise.all([
                axios.get(`${API_URL}/users/role/Student`),
                axios.get(`${API_URL}/session/tutor/${TUTOR_ID}`),
                axios.get(`${API_URL}/awards/tutor/${TUTOR_ID}`)
            ]);
            
            setStudents(studentsRes.data?.data || []);
            setSessions(sessionsRes.data?.data || []);
            setAwards(awardsRes.data?.data || []); 
        } catch (error) {
            console.error('Error fetching data:', error);
            toast.error(error.response?.data?.message || 'Failed to load data');
        } finally {
            setLoading(false);
        }
    };

    const handleModalSubmit = async (formData) => {
        try {
            if (editingAward) {
                await axios.put(`${API_URL}/awards/${editingAward._id}`, {
                    credits: formData.credits,
                    scholarship: formData.scholarship
                });
                toast.success('Award updated successfully');
            } else {
                await axios.post(`${API_URL}/awards`, {
                    ...formData,
                    tutorId: TUTOR_ID
                });
                toast.success('Award created successfully');
            }

            setShowModal(false);
            setEditingAward(null);
            fetchAllData();
        } catch (error) {
            console.error('Error saving award:', error);
            toast.error(error.response?.data?.message || 'Failed to save award');
        }
    };

    const handleEdit = (award) => {
        setEditingAward(award);
        setShowModal(true);
    };

    const handleDelete = async (awardId) => {
        if (!window.confirm('Are you sure you want to delete this award?')) {
            return;
        }

        try {
            await axios.delete(`${API_URL}/awards/${awardId}`);
            toast.success('Award deleted successfully');
            fetchAllData();
        } catch (error) {
            console.error('Error deleting award:', error);
            toast.error(error.response?.data?.message || 'Failed to delete award');
        }
    };

    const openNewAwardModal = () => {
        setEditingAward(null);
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setEditingAward(null);
    };

    if (loading) {
        return (
            <div className="app-layout">
                <Sidebar />
                <div className="awards-container">
                    <div className="awards-loading">Loading awards data...</div>
                </div>
            </div>
        );
    }

    if (!TUTOR_ID) {
        return (
            <div className="app-layout">
                <Sidebar />
                <div className="awards-container">
                    <div className="awards-loading">
                        <p>Please log in as a tutor to manage awards.</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="app-layout">
            <Sidebar />
            <div className="awards-container">
                <div className="awards-header">
                    <h1>Awards Management</h1>
                    <button className="btn-new-award" onClick={openNewAwardModal}>
                        + Create New Award
                    </button>
                </div>

                {/* Awards List */}
                <div className="awards-list">
                    <h2>My Awards</h2>
                    {awards.length === 0 ? (
                        <div className="no-awards">
                            <p>No awards created yet.</p>
                            <p>Click "Create New Award" to get started!</p>
                        </div>
                    ) : (
                        <div className="awards-table-container">
                            <table className="awards-table">
                                <thead>
                                    <tr>
                                        <th>Student</th>
                                        <th>Session</th>
                                        <th>Credits</th>
                                        <th>Scholarship</th>
                                        <th>Date Created</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {awards.map((award) => (
                                        <tr key={award._id}>
                                            <td>
                                                <div className="student-info">
                                                    <strong>{award.studentId?.fullname || 'Unknown Student'}</strong>
                                                    {award.studentId?.email && (
                                                        <>
                                                            <br />
                                                            <small>{award.studentId.email}</small>
                                                        </>
                                                    )}
                                                </div>
                                            </td>
                                            <td>
                                                {award.sessionId?.title || 
                                                 award.sessionId?.subject || 
                                                 'Unknown Session'}
                                            </td>
                                            <td>
                                                <span className="badge credits">{award.credits}</span>
                                            </td>
                                            <td>
                                                <span className="amount">
                                                    {award.scholarship.toLocaleString('vi-VN')} VND
                                                </span>
                                            </td>
                                            <td>
                                                {new Date(award.createdAt).toLocaleDateString('vi-VN')}
                                            </td>
                                            <td className="actions">
                                                <button
                                                    className="btn-edit"
                                                    onClick={() => handleEdit(award)}
                                                    title="Edit award"
                                                >
                                                    ✏️
                                                </button>
                                                <button
                                                    className="btn-delete"
                                                    onClick={() => handleDelete(award._id)}
                                                    title="Delete award"
                                                >
                                                    🗑️
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Award Modal */}
                <AwardModal
                    isOpen={showModal}
                    onClose={closeModal}
                    onSubmit={handleModalSubmit}
                    students={students}
                    sessions={sessions}
                    editingAward={editingAward}
                />
>>>>>>> origin/main
            </div>
        </div>
    );
};

<<<<<<< HEAD
export default AwardModal;
=======
export default Awards;
>>>>>>> origin/main
