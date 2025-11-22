import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';

dotenv.config();

const run = async () => {
  try {
    // 1. Kết nối DB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('DB Connected');

    // 2. Tạo thử 1 user giả
    const testUser = new User({
      email: 'test_schema@hcmut.edu.vn',
      passwordHash: 'hashed_password_123',
      role: 'Student',
      fullname: 'Nguyen Van Test'
    });

    // 3. Lưu vào MongoDB Atlas
    await testUser.save();
    console.log('User saved successfully! Schema is working perfectly.');

    // 4. Xóa user đó đi (dọn dẹp)
    await User.deleteOne({ email: 'test_schema@hcmut.edu.vn' });
    console.log('Cleaned up test user.');

  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    mongoose.connection.close();
  }
};

run();
