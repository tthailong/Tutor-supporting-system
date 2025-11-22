import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import User from './models/User.js';

dotenv.config();

const createSampleUsers = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('DB Connected\n');

    // Xóa users cũ nếu có (để tránh trùng lặp)
    await User.deleteMany({});
    console.log('Da xoa users cu\n');

    // Tạo password hash
    const hashedPassword = await bcrypt.hash('123456', 10);

    // Tạo danh sách users mẫu
    const sampleUsers = [
      {
        email: 'user001@hcmut.edu.vn',
        passwordHash: hashedPassword,
        role: 'Student',
        fullname: 'User 001',
        hcmutID: 'user001',
        phoneNumber: '0901234567',
        status: true
      },
      {
        email: 'user002@hcmut.edu.vn',
        passwordHash: hashedPassword,
        role: 'Student',
        fullname: 'User 002',
        hcmutID: 'user002',
        phoneNumber: '0902234567',
        status: true
      },
      {
        email: 'user003@hcmut.edu.vn',
        passwordHash: hashedPassword,
        role: 'Student',
        fullname: 'User 003',
        hcmutID: 'user003',
        phoneNumber: '0903234567',
        status: true
      },
      {
        email: 'user004@hcmut.edu.vn',
        passwordHash: hashedPassword,
        role: 'Student',
        fullname: 'User 004',
        hcmutID: 'user004',
        phoneNumber: '0904234567',
        status: true
      },
      {
        email: 'user005@hcmut.edu.vn',
        passwordHash: hashedPassword,
        role: 'Student',
        fullname: 'User 005',
        hcmutID: 'user005',
        phoneNumber: '0905234567',
        status: true
      }
    ];

    // Lưu vào database
    await User.insertMany(sampleUsers);
    
    console.log('Da tao thanh cong cac users mau:\n');
    sampleUsers.forEach((user, index) => {
      console.log(`${index + 1}. ${user.fullname}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Password: 123456`);
      console.log(`   Role: ${user.role}\n`);
    });

    console.log('Ban co the dung cac tai khoan tren de test dang nhap!');
    console.log('Tat ca password deu la: 123456\n');

  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    mongoose.connection.close();
  }
};

createSampleUsers();
