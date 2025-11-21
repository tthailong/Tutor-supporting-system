{/*// Ví dụ logic trong Node/Express Controller
// (Giả sử: const frontendAvailability = req.body;)

const finalSchedule = Object.entries(frontendAvailability)
    .filter(([key, value]) => value === true) // 1. Lọc: Chỉ giữ lại các slot đã chọn (true)
    .map(([key, value]) => {
        // 2. Tách chuỗi: 'Mon-10:00-11:00' => ['Mon', '10:00-11:00']
        const [day, timeSlot] = key.split('-');
        
        // 3. Chuyển đổi: Trả về đối tượng nhúng
        return {
            dayOfWeek: day, // 'Mon' (Backend cần chuyển thành 'Monday' nếu Schema yêu cầu)
            timeSlot: timeSlot
        };
    });

// Kết quả finalSchedule: 
/*
[
    { dayOfWeek: 'Mon', timeSlot: '10:00-11:00' },
    { dayOfWeek: 'Mon', timeSlot: '13:00-14:00' },
    ...
]

function isSlotAvailable(tutorAvailability, sessionSlot) {
  const daySlots = tutorAvailability[sessionSlot.day]; // e.g., Mon: [{start, end}, ...]

  if (!daySlots || daySlots.length === 0) return false; // no availability on that day

  // Convert "HH:MM" → number for comparison
  const sessionStart = Number(sessionSlot.start.replace(":", ""));
  const sessionEnd = Number(sessionSlot.end.replace(":", ""));

  // Check if session fits inside any of the available slots
  return daySlots.some(slot => {
    const slotStart = Number(slot.start.replace(":", ""));
    const slotEnd = Number(slot.end.replace(":", ""));
    return sessionStart >= slotStart && sessionEnd <= slotEnd;
  });

*/}


import sessionModel from "../models/sessionModel.js";
import fs from "fs"; //for file handling

const createSession = async (req, res) => {
  console.log("req.body:", req.body); // check what's actually received

  //if (!req.body || !req.body.name) {
  //  return res.status(400).json({ success: false, message: "Missing fields" });
  //}

    const session = new sessionModel({
        name: req.body.name,
        location: req.body.location,
        //timeTable: req.body.timeTable,
        duration: req.body.duration,
        capacity: req.body.capacity,
        studentcount: req.body.studentcount
    });
    try {
        await session.save();
        res.json({success: true, message: "Session created successfully"});
    } catch (error) {
        console.log(error);
        res.json({success: false, message: "Error"});
    }
}

{/* this is for count student who register program
    async function getRegisteredCount(sessionId) {
  try {
    const session = await Session.findById(sessionId)
      .select('students') // Only fetch the students array
      .exec();

    if (!session) {
      return 0; // Or throw an error if the session is not found
    }

    // The count is the length of the array of student IDs
    const studentCount = session.students.length;
    return studentCount;
  } catch (error) {
    console.error("Error fetching student count:", error);
    throw error;
  }
} */}
export { createSession }; 