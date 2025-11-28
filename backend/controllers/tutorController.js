import tutorModel from "../models/tutorModel.js";

/**
 * Get tutor data by ID
 * @route GET /api/tutors/:tutorId
 */
export const getTutorData = async (req, res) => {
  try {
    const { tutorId } = req.params;
    
    const tutor = await tutorModel.findById(tutorId)
      .select('-bookedSlots')
      .lean();
    
    if (!tutor) {
      return res.status(404).json({
        success: false,
        message: "Tutor not found"
      });
    }
    
    res.status(200).json({
      success: true,
      tutor
    });
  } catch (error) {
    console.error("Error fetching tutor:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch tutor data"
    });
  }
};

/**
 * Set tutor availability
 * @route POST /api/tutors/availability
 */
export const setAvailability = async (req, res) => {
  try {
    const { tutorId, availability } = req.body;
    
    if (!tutorId || !availability) {
      return res.status(400).json({
        success: false,
        message: "tutorId and availability are required"
      });
    }
    
    const tutor = await tutorModel.findById(tutorId);
    
    if (!tutor) {
      return res.status(404).json({
        success: false,
        message: "Tutor not found"
      });
    }
    
    // Update availability
    tutor.availability = availability;
    await tutor.save();
    
    res.status(200).json({
      success: true,
      message: "Availability updated successfully",
      tutor: {
        _id: tutor._id,
        name: tutor.name,
        availability: tutor.availability
      }
    });
  } catch (error) {
    console.error("Error updating availability:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update availability"
    });
  }
};
