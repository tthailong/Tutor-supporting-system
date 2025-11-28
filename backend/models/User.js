import mongoose from 'mongoose';
//import tutorModel from './tutorModel';

// Định nghĩa Schema dựa trên Class "User Account" trong báo cáo
const UserSchema = new mongoose.Schema({
  // 1. Thông tin đăng nhập (Authentication)
  email: {
    type: String,
    required: [true, 'Vui lòng nhập email'],
    unique: true,
    trim: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Vui lòng nhập email hợp lệ'
    ]
  },
  passwordHash: {
    type: String,
    required: [true, 'Vui lòng nhập mật khẩu'],
    minlength: 6
  },

  // 2. Phân quyền (Authorization)
  // Dựa trên Enum Role: Student, Tutor, Admin, Manager
  role: {
    type: String,
    enum: ['Student', 'Tutor', 'Admin', 'Manager'],
    default: 'Student',
    required: true
  },

  // 3. Trạng thái tài khoản
  // status: bool (Active/Inactive)
  status: {
    type: Boolean,
    default: true 
  },

  // 4. Thông tin cá nhân cơ bản (Profile Info)
  fullname: {
    type: String,
    trim: true
  },
  phoneNumber: {
    type: String,
    trim: true
  },
  
  // ID định danh từ hệ thống trường (MSSV hoặc Mã cán bộ)
  hcmutID: {
    type: String,
    trim: true
  },

  // them ref cho tutor
  tutorProfile: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Tutor",
    default: null
  }

}, {
  timestamps: true // Tự động tạo trường createdAt và updatedAt
});

// Xuất Model để các Controller khác sử dụng
const User = mongoose.model('User', UserSchema);
export default User;
