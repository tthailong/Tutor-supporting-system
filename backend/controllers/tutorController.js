import tutorModel from "../models/tutorModel.js";

/**
 * Insert/replace weekly availability for a tutor
 */
const createToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET)
}
// ... existing createToken ...

// 1. GET Tutor Data (To load Green/Gray slots)
export const getTutorData = async (req, res) => {
  try {
    const { tutorId } = req.params;
    const tutor = await tutorModel.findById(tutorId);

    if (!tutor) return res.status(404).json({ message: "Tutor not found" });

    res.status(200).json({
      success: true,
      availability: tutor.availability || {},
      bookedSlots: tutor.bookedSlots || [],
      expertise: tutor.expertise || []
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 2. SET Availability (Your existing logic, slightly refined for the Map)
export const setAvailability = async (req, res) => {
  try {
    const { tutorId, availability } = req.body;

    if (!tutorId || !availability) {
      return res.status(400).json({ message: "Missing fields" });
    }

    const tutor = await tutorModel.findById(tutorId);
    if (!tutor) return res.status(404).json({ message: "Tutor not found" });

    // Update the availability Map
    // We expect availability to be: { "2025-11-26": [{start: "07:00", end:"08:00"}], ... }
    tutor.availability = availability;

    await tutor.save();

    return res.status(200).json({
      message: "Availability updated successfully",
      tutor
    });

  } catch (err) {
    return res.status(500).json({
      message: "Server error",
      error: err.message
    });
  }
};