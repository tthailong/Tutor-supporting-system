import mongoose from 'mongoose';
import studentModel from '../models/studentModel.js';
// Ensure related models are registered so populate() works
import subjectModel from '../models/subjectModel.js';
import tutorModel from '../models/tutorModel.js';

// Get student profile by ID
export const getStudentById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid student ID' });
    }

    const student = await studentModel.findById(id).populate('currentSubjects').populate('currentTutors');
    if (!student) return res.status(404).json({ success: false, message: 'Student not found' });

    return res.status(200).json({ success: true, data: student });
  } catch (err) {
    console.error('getStudentById error', err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// Update student profile (partial)
export const updateStudent = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid student ID' });
    }

    const allowed = ['description', 'gpa', 'currentSubjects', 'currentTutors'];
    const updates = {};
    Object.keys(req.body || {}).forEach(k => {
      if (allowed.includes(k)) updates[k] = req.body[k];
    });

    const updated = await studentModel.findByIdAndUpdate(id, updates, { new: true }).populate('currentSubjects').populate('currentTutors');
    if (!updated) return res.status(404).json({ success: false, message: 'Student not found' });

    return res.status(200).json({ success: true, message: 'Student profile updated', data: updated });
  } catch (err) {
    console.error('updateStudent error', err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

export default { getStudentById, updateStudent };
