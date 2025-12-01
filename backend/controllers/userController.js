import User from "../models/User.js";
import mongoose from "mongoose";

// Get all users
const getAllUsers = async (req, res) => {
    try {
        const users = await User.find({})
            .select('-passwordHash'); // Exclude password from response

        res.status(200).json({
            success: true,
            count: users.length,
            data: users
        });
    } catch (error) {
        console.error("Error fetching users:", error);
        res.status(500).json({
            success: false,
            message: "Error fetching users",
            error: error.message
        });
    }
};

// Get users by role
const getUsersByRole = async (req, res) => {
    try {
        const { role } = req.params;

        // Validate role
        const validRoles = ['Student', 'Tutor'];
        if (!validRoles.includes(role)) {
            return res.status(400).json({
                success: false,
                message: `Invalid role. Must be one of: ${validRoles.join(', ')}`
            });
        }

        const users = await User.find({ role })
            .select('-passwordHash');

        res.status(200).json({
            success: true,
            role: role,
            count: users.length,
            data: users
        });
    } catch (error) {
        console.error("Error fetching users by role:", error);
        res.status(500).json({
            success: false,
            message: "Error fetching users by role",
            error: error.message
        });
    }
};

// Get user by ID
const getUserById = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid user ID format"
            });
        }

        const user = await User.findById(id)
            .select('-passwordHash');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        res.status(200).json({
            success: true,
            data: user
        });
    } catch (error) {
        console.error("Error fetching user:", error);
        res.status(500).json({
            success: false,
            message: "Error fetching user",
            error: error.message
        });
    }
};

export {
    getAllUsers,
    getUsersByRole,
    getUserById
};