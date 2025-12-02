import express from "express";
import { 
  getStudentCourses,
  getAvailableRescheduleSlots,
  rescheduleSession,
  cancelStudentCourse
} from "../controllers/studentCourseController.js";
import { getStudentById, updateStudent } from "../controllers/studentController.js";

const studentRouter = express.Router();

// GET: Lấy danh sách session student đã đăng ký
studentRouter.get("/:studentId/courses", getStudentCourses);

// Student profile read/update
studentRouter.get("/profile/:id", getStudentById);
studentRouter.put("/profile/:id", updateStudent);

// GET: Lấy danh sách slot rảnh khác của tutor
studentRouter.get("/session/:sessionId/reschedule", getAvailableRescheduleSlots);

// PUT: Confirm đổi lịch
studentRouter.put("/session/:sessionId/reschedule", rescheduleSession);

// DELETE: Cancel course
studentRouter.delete("/session/:sessionId/cancel/:studentId", cancelStudentCourse);

export default studentRouter;