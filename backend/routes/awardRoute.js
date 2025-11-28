import express from "express";
import {
    createAward,
    getAllAwards,
    getAwardById,
    getAwardsByStudent,
    getAwardsByTutor,
    editAward,
    deleteAward
} from "../controllers/awardController.js";

const awardRouter = express.Router();

awardRouter.post("/", createAward);
awardRouter.get("/", getAllAwards);
awardRouter.get("/:id", getAwardById);
awardRouter.get("/student/:studentId", getAwardsByStudent);
awardRouter.get("/tutor/:tutorId", getAwardsByTutor);
awardRouter.put("/:id", editAward);
awardRouter.delete("/:id", deleteAward);

export default awardRouter;