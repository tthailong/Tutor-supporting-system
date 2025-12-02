import express from "express";
import { createSession, updateSession, deleteSession, getSessionsByTutor, getSessionById, addMaterial, deleteMaterial } from "../controllers/sessionController.js";
import multer from "multer";
import { authMiddleware } from '../middleware/auth.js'; // Adjust path as needed

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

export default sessionRouter;
