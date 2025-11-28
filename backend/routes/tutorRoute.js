import express from "express";
import { getTutorData, setAvailability } from "../controllers/tutorController.js";
import { getTutors } from "../controllers/matchingController.js";
import { validateTutorFilters } from "../validators/matchingValidator.js";

const tutorRouter = express.Router();

// Get all tutors with filtering (Marketplace)
tutorRouter.get("/", validateTutorFilters, getTutors);

// Get specific tutor data
tutorRouter.get("/:tutorId", getTutorData);

// Set tutor availability
tutorRouter.post("/availability", setAvailability);

export default tutorRouter;
