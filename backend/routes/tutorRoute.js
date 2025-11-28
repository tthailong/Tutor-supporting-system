import express from "express";
import { getTutorData, setAvailability } from "../controllers/tutorController.js";
import { getTutors } from "../controllers/matchingController.js";
import { validateTutorFilters } from "../validators/matchingValidator.js";

const tutorRouter = express.Router();

// Add the GET route
tutorRouter.get("/:tutorId", getTutorData);
// Get all tutors with filtering (Marketplace)
tutorRouter.get("/", validateTutorFilters, getTutors);
tutorRouter.post("/availability", setAvailability);

export default tutorRouter;
