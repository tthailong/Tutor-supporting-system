import express from "express";
import { getTutorData, setAvailability, updateTutor } from "../controllers/tutorController.js";
import { getTutors } from "../controllers/matchingController.js";
import { validateTutorFilters } from "../validators/matchingValidator.js";

const tutorRouter = express.Router();

// Get specific tutor data
tutorRouter.get("/:tutorId", getTutorData);
// Update tutor profile
tutorRouter.put("/:tutorId", updateTutor);
// Get all tutors with filtering (Marketplace)
tutorRouter.get("/", validateTutorFilters, getTutors);
tutorRouter.post("/availability", setAvailability);

export default tutorRouter;
