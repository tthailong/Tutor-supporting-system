import express from "express";
import { createSession, updateSession, deleteSession, getSessionsByTutor } from "../controllers/sessionController.js";
import multer from "multer";

const sessionRouter = express.Router();
const upload = multer();

// Create
sessionRouter.post("/create", upload.none(), createSession);

// Read (Get by Tutor)
sessionRouter.get("/tutor/:tutorId", getSessionsByTutor);

// Update
sessionRouter.put("/:sessionId", upload.none(), updateSession);

// Delete
sessionRouter.delete("/:sessionId", deleteSession);

export default sessionRouter;