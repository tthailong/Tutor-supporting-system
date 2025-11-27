import awardModel from "../models/awardModel.js";

// Create new award
const createAward = async (req, res) => {
    try {
        const { studentId, tutorId, sessionId, credits, scholarship } = req.body;

        // Validate required fields
        if (!studentId || !tutorId || !sessionId) {
            return res.status(400).json({
                success: false,
                message: "Student ID, Tutor ID, and Session ID are required"
            });
        }

        // Create new award
        const newAward = new awardModel({
            studentId,
            tutorId,
            sessionId,
            credits: credits || 0,
            scholarship: scholarship || 0
        });

        await newAward.save();

        res.status(201).json({
            success: true,
            message: "Award created successfully",
            data: newAward
        });
    } catch (error) {
        console.error("Error creating award:", error);
        res.status(500).json({
            success: false,
            message: "Error creating award",
            error: error.message
        });
    }
};

// Get all awards
const getAllAwards = async (req, res) => {
    try {
        const awards = await awardModel.find({});
        
        res.status(200).json({
            success: true,
            count: awards.length,
            data: awards
        });
    } catch (error) {
        console.error("Error fetching awards:", error);
        res.status(500).json({
            success: false,
            message: "Error fetching awards",
            error: error.message
        });
    }
};

// Get award by ID
const getAwardById = async (req, res) => {
    try {
        const { id } = req.params;
        const award = await awardModel.findById(id);

        if (!award) {
            return res.status(404).json({
                success: false,
                message: "Award not found"
            });
        }

        res.status(200).json({
            success: true,
            data: award
        });
    } catch (error) {
        console.error("Error fetching award:", error);
        res.status(500).json({
            success: false,
            message: "Error fetching award",
            error: error.message
        });
    }
};

// Get awards by student ID
const getAwardsByStudent = async (req, res) => {
    try {
        const { studentId } = req.params;
        const awards = await awardModel.find({ studentId: Number(studentId) });

        res.status(200).json({
            success: true,
            count: awards.length,
            data: awards
        });
    } catch (error) {
        console.error("Error fetching student awards:", error);
        res.status(500).json({
            success: false,
            message: "Error fetching student awards",
            error: error.message
        });
    }
};

// Get awards by tutor ID
const getAwardsByTutor = async (req, res) => {
    try {
        const { tutorId } = req.params;
        const awards = await awardModel.find({ tutorId: Number(tutorId) });

        res.status(200).json({
            success: true,
            count: awards.length,
            data: awards
        });
    } catch (error) {
        console.error("Error fetching tutor awards:", error);
        res.status(500).json({
            success: false,
            message: "Error fetching tutor awards",
            error: error.message
        });
    }
};

// Edit award (credits and/or scholarship)
const editAward = async (req, res) => {
    try {
        const { id } = req.params;
        const { credits, scholarship } = req.body;

        // Build update object with only provided fields
        const updateData = {};
        if (credits !== undefined) updateData.credits = credits;
        if (scholarship !== undefined) updateData.scholarship = scholarship;

        if (Object.keys(updateData).length === 0) {
            return res.status(400).json({
                success: false,
                message: "No valid fields to update. Provide credits or scholarship."
            });
        }

        const updatedAward = await awardModel.findByIdAndUpdate(
            id,
            updateData,
            { new: true, runValidators: true }
        );

        if (!updatedAward) {
            return res.status(404).json({
                success: false,
                message: "Award not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Award updated successfully",
            data: updatedAward
        });
    } catch (error) {
        console.error("Error updating award:", error);
        res.status(500).json({
            success: false,
            message: "Error updating award",
            error: error.message
        });
    }
};

// Delete award
const deleteAward = async (req, res) => {
    try {
        const { id } = req.params;

        const deletedAward = await awardModel.findByIdAndDelete(id);

        if (!deletedAward) {
            return res.status(404).json({
                success: false,
                message: "Award not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Award deleted successfully",
            data: deletedAward
        });
    } catch (error) {
        console.error("Error deleting award:", error);
        res.status(500).json({
            success: false,
            message: "Error deleting award",
            error: error.message
        });
    }
};

export {
    createAward,
    getAllAwards,
    getAwardById,
    getAwardsByStudent,
    getAwardsByTutor,
    editAward,
    deleteAward
};