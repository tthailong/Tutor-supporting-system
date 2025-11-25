import express from "express";
import { getTutorData, setAvailability } from "../controllers/tutorController.js";

const tutorRouter = express.Router();

// Add the GET route
tutorRouter.get("/:tutorId", getTutorData);
tutorRouter.post("/availability", setAvailability);

export default tutorRouter;
