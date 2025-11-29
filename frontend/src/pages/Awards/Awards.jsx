import { useState, useEffect } from 'react';
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
                axios.get(`/api/users/role/Student`),
                axios.get(`/api/session/tutor/${TUTOR_ID}`),
                axios.get(`/api/awards/tutor/${TUTOR_ID}`)
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
                await axios.put(`/api/awards/${editingAward._id}`, {
                    credits: formData.credits,
                    scholarship: formData.scholarship
                });
                toast.success('Award updated successfully');
            } else {
                await axios.post(`/api/awards`, {
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
            await axios.delete(`/api/awards/${awardId}`);
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
                                                <a
                                                    href="#"
                                                    className="action-link edit-link"
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        handleEdit(award);
                                                    }}
                                                >
                                                    Edit
                                                </a>
                                                <span className="action-separator">|</span>
                                                <a
                                                    href="#"
                                                    className="action-link delete-link"
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        handleDelete(award._id);
                                                    }}
                                                >
                                                    Delete
                                                </a>
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
            </div>
        </div>
    );
};

export default Awards;