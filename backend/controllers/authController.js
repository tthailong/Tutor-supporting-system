import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// Login user
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Vui long nhap day du email va password'
      });
    }

    // Tim user trong database
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Email khong ton tai'
      });
    }

    // Kiem tra status
    if (!user.status) {
      return res.status(403).json({
        success: false,
        message: 'Tai khoan da bi khoa'
      });
    }

    // So sanh password
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Mat khau khong dung'
      });
    }

    // Tao JWT token
    const token = jwt.sign(
      {
        userId: user._id,
        email: user.email,
        role: user.role
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Tra ve thong tin user (khong tra password)
    res.status(200).json({
      success: true,
      message: 'Dang nhap thanh cong',
      token,
      user: {
        id: user._id,
        email: user.email,
        fullname: user.fullname,
        role: user.role,
        hcmutID: user.hcmutID,
        tutorProfile: user.tutorProfile
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Loi server'
    });
  }
};
