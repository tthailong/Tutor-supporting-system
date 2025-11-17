import React from 'react'
import './Sessioncard.css'

const MOCK_SESSION_DATA = {
    id: 1, 
    // This title mimics the structure in your image: Subject (Code)_TutorName (ClassCode)
    title: 'General Chemistry (CH1003)_Đặng Bảo Trọng (CLC_HK251)', 
    time: 'Monday 13:00-14:50', 
    location: 'B1-303', 
    capacity: 6, 
    signedUp: 5, 
    status: 'scheduled',
};

const handleReschedule = (s) => console.log(`Reschedule session ${s.id}`);
const handleEdit = (s) => console.log(`Edit session ${s.id}`);
const handleDelete = (s) => console.log(`Delete session ${s.id}`);

const Sessioncard = ({ role = 'student' }) => { // Default role to 'tutor' for testing icons
    const session = MOCK_SESSION_DATA;
    const { title, time, location, capacity, signedUp } = session;

    return (
        <div className="session-card">
            
            <div className="session-details-container">
                
                <div className="session-details-left">
                    <div className="title">{title}</div>
                    <div className="subtitle-line">
                        <div className="time-and-location">
                            <span>{time}</span>
                            <span>{location}</span>
                        </div>
                        <div className="capacity">
                            {signedUp}/{capacity}
                        </div>
                    </div>
                </div>

                <div className="action-icons">
                    <span onClick={() => handleReschedule(session)}>
                        🗓️
                    </span>
                    {role === 'tutor' && (
                        <>
                            <span onClick={() => handleEdit(session)}>
                                ✏️
                            </span>
                            <span onClick={() => handleDelete(session)}>
                                🗑️
                            </span>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

export default Sessioncard