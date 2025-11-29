import express from "express";
import { authMiddleware, requireRole } from "../middleware/auth.js";
import {
    createAward,
    getAwardsByStudent,
    getAwardsByTutor,
    editAward,
    deleteAward
} from "../controllers/awardController.js";

const awardRouter = express.Router();

awardRouter.use(authMiddleware, requireRole("Tutor"));
awardRouter.post("/", createAward);
awardRouter.get("/student/:studentId", getAwardsByStudent);
awardRouter.get("/tutor/:tutorId", getAwardsByTutor);
awardRouter.put("/:id", editAward);
awardRouter.delete("/:id", deleteAward);
export default awardRouter;