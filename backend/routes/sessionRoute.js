import express from "express";
import {
    createSession, updateSession, deleteSession, getSessionsByTutor,
    getSessionById, addMaterial, deleteMaterial, getTutorAvailableSessions, joinSession
} from "../controllers/sessionController.js";
import { authMiddleware } from '../middleware/auth.js'; // Adjust path as needed
import multer from "multer";

const sessionRouter = express.Router();
const upload = multer();

// Create
sessionRouter.post("/create", authMiddleware, upload.none(), createSession);

// Read (Get by Tutor)
sessionRouter.get("/tutors/:tutorId", authMiddleware, getSessionsByTutor);

// Update
sessionRouter.put("/:sessionId", authMiddleware, upload.none(), updateSession);

// Delete
sessionRouter.delete("/:sessionId", authMiddleware, deleteSession);

sessionRouter.get('/:id', authMiddleware, getSessionById);
sessionRouter.post('/:id/materials', authMiddleware, addMaterial);
sessionRouter.delete('/:id/materials/:materialId', authMiddleware, deleteMaterial);

// Student self-enrollment routes
sessionRouter.get("/tutor/:tutorId/available", getTutorAvailableSessions);
sessionRouter.post("/:sessionId/join", joinSession);
export default sessionRouter;
