import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './SessionDetail.css';
import SessionForm from '../Sessionform/Sessionform';

const SessionDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [session, setSession] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showEditForm, setShowEditForm] = useState(false);
    const [showAddMaterial, setShowAddMaterial] = useState(false);
    const [newMaterial, setNewMaterial] = useState({
        title: '',
        type: 'link',
        content: '',
        description: ''
    });

    const user = JSON.parse(localStorage.getItem('user'));
    const token = localStorage.getItem("token");
    const isTutor = user?.role === 'Tutor';

    useEffect(() => {
        // Run only if the ID and a valid token exist
        if (id && token) {
            fetchSessionDetails();
        } else if (!token) {
            // If the token is definitively missing, stop loading and potentially redirect.
            setLoading(false);
            console.error("Authentication required: Token is missing.");
            // navigate('/login'); // Optional: Redirect if session page requires login
        }
    }, [id, token]); // <-- ADD 'token' dependency here

    const fetchSessionDetails = async () => {
        const currentToken = localStorage.getItem("token");

        if (!currentToken || currentToken.length < 10) { // Check for null, empty, or obviously invalid token
            console.error("Token is missing or invalid length. Cannot proceed with API call.");
            setLoading(false);
            setSession(null);
            return;
        }

        try {
            const res = await fetch(`http://localhost:4000/api/session/${id}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await res.json();
            if (data.success) {
                setSession(data.session);
            }
        } catch (error) {
            console.error('Error fetching session:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddMaterial = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch(`http://localhost:4000/api/session/${id}/materials`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(newMaterial)
            });
            const data = await res.json();
            if (data.success) {
                setSession(data.session);
                setShowAddMaterial(false);
                setNewMaterial({ title: '', type: 'link', content: '', description: '' });
            }
        } catch (error) {
            console.error('Error adding material:', error);
        }
    };

    const handleDeleteMaterial = async (materialId) => {
        if (!window.confirm('Are you sure you want to delete this material?')) return;

        try {
            const res = await fetch(`http://localhost:4000/api/session/${id}/materials/${materialId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await res.json();
            if (data.success) {
                setSession(data.session);
            }
        } catch (error) {
            console.error('Error deleting material:', error);
        }
    };

    const handleEditSession = (updatedData) => {
        // This will be called by SessionForm
        setSession({ ...session, ...updatedData });
        setShowEditForm(false);
    };

    const formatSchedule = (schedule) => {
        if (!schedule || schedule.size === 0) return 'No schedule available';
        let scheduleMap;

        // Check if it's already a Map (unlikely for JSON data) or a plain object
        if (schedule instanceof Map) {
            scheduleMap = schedule;
        } else {
            // Assume it's a plain object (which is what MongoDB/Express returns)
            scheduleMap = new Map(Object.entries(schedule)); // <--- THE KEY FIX
        }
        const scheduleArray = Array.from(scheduleMap.entries());
        return scheduleArray.map(([date, slots]) => (
            <div key={date} className="schedule-item">
                <strong>{new Date(date).toLocaleDateString('en-GB')}</strong>: {slots.map(s => `${s.start}-${s.end}`).join(', ')}
            </div>
        ));
    };

    const getMaterialIcon = (type) => {
        switch (type) {
            case 'link': return '🔗';
            case 'text': return '📝';
            case 'file': return '📄';
            default: return '📎';
        }
    };

    if (loading) {
        return <div className="loading-container"><div className="spinner"></div></div>;
    }

    if (!session) {
        return <div className="error-container">Session not found</div>;
    }

    return (
        <div className="session-detail-container">
            <div className="session-detail-card">
                {/* Header */}
                <div className="detail-header">
                    <button className="back-btn" onClick={() => navigate(-1)}>
                        ← Back
                    </button>
                    <h1>{session.subject}</h1>
                    {isTutor && ( // cho nay phai la isTutor
                        <button className="edit-session-btn" onClick={() => setShowEditForm(true)}>
                            ✏️ Edit Session
                        </button>
                    )}
                </div>

                {/* Session Info */}
                <div className="session-info-grid">
                    <div className="info-card">
                        <div className="info-label">Tutor</div>
                        <div className="info-value">{session.tutor?.name || 'N/A'}</div>
                    </div>

                    <div className="info-card">
                        <div className="info-label">Location</div>
                        <div className="info-value">{session.location}</div>
                    </div>

                    <div className="info-card">
                        <div className="info-label">Capacity</div>
                        <div className="info-value">{session.students?.length || 0} / {session.capacity}</div>
                    </div>

                    <div className="info-card">
                        <div className="info-label">Duration</div>
                        <div className="info-value">{session.duration} week(s)</div>
                    </div>

                    <div className="info-card full-width">
                        <div className="info-label">Description</div>
                        <div className="info-value">{session.description || 'No description provided'}</div>
                    </div>

                    <div className="info-card full-width">
                        <div className="info-label">Schedule</div>
                        <div className="info-value schedule-display">
                            {formatSchedule(session.schedule)}
                        </div>
                    </div>
                </div>

                {/* Study Materials Section */}
                <div className="materials-section">
                    <div className="materials-header">
                        <h2>📚 Study Materials</h2>
                        {isTutor && ( //cho nay phai la tutor
                            <button className="add-material-btn" onClick={() => setShowAddMaterial(true)}>
                                + Add Material
                            </button>
                        )}
                    </div>

                    <div className="materials-list">
                        {session.materials && session.materials.length > 0 ? (
                            session.materials.map((material) => (
                                <div key={material._id} className="material-item">
                                    <div className="material-icon">{getMaterialIcon(material.type)}</div>
                                    <div className="material-content">
                                        <h3>{material.title}</h3>
                                        {material.description && <p className="material-desc">{material.description}</p>}
                                        {material.type === 'link' && material.content && (
                                            <a href={material.content} target="_blank" rel="noopener noreferrer" className="material-link">
                                                Open Link →
                                            </a>
                                        )}
                                        {material.type === 'text' && material.content && (
                                            <div className="material-text">{material.content}</div>
                                        )}
                                        {material.type === 'file' && material.content && (
                                            <div className="material-file">File: {material.content}</div>
                                        )}
                                        <div className="material-meta">
                                            Added {new Date(material.createdAt).toLocaleDateString('en-GB')}
                                        </div>
                                    </div>
                                    {isTutor && ( //cho nay phai la tutor
                                        <button
                                            className="delete-material-btn"
                                            onClick={() => handleDeleteMaterial(material._id)}
                                            title="Delete material"
                                        >
                                            🗑️
                                        </button>
                                    )}
                                </div>
                            ))
                        ) : (
                            <div className="no-materials">No study materials yet</div>
                        )}
                    </div>
                </div>
            </div>

            {/* Add Material Modal */}
            {showAddMaterial && (
                <div className="modal-overlay" onClick={() => setShowAddMaterial(false)}>
                    <div className="add-material-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Add Study Material</h2>
                            <button className="close-btn" onClick={() => setShowAddMaterial(false)}>&times;</button>
                        </div>
                        <form onSubmit={handleAddMaterial} className="material-form">
                            <div className="form-group">
                                <label>Title *</label>
                                <input
                                    type="text"
                                    value={newMaterial.title}
                                    onChange={(e) => setNewMaterial({ ...newMaterial, title: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label>Type *</label>
                                <select
                                    value={newMaterial.type}
                                    onChange={(e) => setNewMaterial({ ...newMaterial, type: e.target.value })}
                                >
                                    <option value="link">Link (URL)</option>
                                    <option value="text">Text Note</option>
                                    <option value="file">File Reference</option>
                                </select>
                            </div>

                            <div className="form-group">
                                <label>
                                    {newMaterial.type === 'link' ? 'URL *' :
                                        newMaterial.type === 'text' ? 'Content *' : 'File Name *'}
                                </label>
                                {newMaterial.type === 'text' ? (
                                    <textarea
                                        value={newMaterial.content}
                                        onChange={(e) => setNewMaterial({ ...newMaterial, content: e.target.value })}
                                        rows="4"
                                        required
                                    />
                                ) : (
                                    <input
                                        type="text"
                                        value={newMaterial.content}
                                        onChange={(e) => setNewMaterial({ ...newMaterial, content: e.target.value })}
                                        placeholder={newMaterial.type === 'link' ? 'https://...' : 'filename.pdf'}
                                        required
                                    />
                                )}
                            </div>

                            <div className="form-group">
                                <label>Description</label>
                                <textarea
                                    value={newMaterial.description}
                                    onChange={(e) => setNewMaterial({ ...newMaterial, description: e.target.value })}
                                    rows="2"
                                />
                            </div>

                            <div className="modal-actions">
                                <button type="button" className="btn-cancel" onClick={() => setShowAddMaterial(false)}>
                                    Cancel
                                </button>
                                <button type="submit" className="btn-save">Add Material</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Edit Session Form */}
            {showEditForm && (
                <SessionForm
                    isOpen={showEditForm}
                    onClose={() => setShowEditForm(false)}
                    onSave={handleEditSession}
                    sessionData={session}
                />
            )}
        </div>
    );
};

export default SessionDetail;
