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
*/}