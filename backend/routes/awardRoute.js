import express from "express";
import {
    createAward,
    getAwardsByStudent,
    getAwardsByTutor,
    editAward,
    deleteAward
} from "../controllers/awardController.js";

const awardRouter = express.Router();

awardRouter.post("/", createAward);
awardRouter.get("/student/:studentId", getAwardsByStudent);
awardRouter.get("/tutor/:tutorId", getAwardsByTutor);
awardRouter.put("/:id", editAward);
awardRouter.delete("/:id", deleteAward);
export default awardRouter;