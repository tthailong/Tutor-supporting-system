import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';

dotenv.config();

const checkDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('DB Connected\n');

    // Kiểm tra số lượng users trong database
    const userCount = await User.countDocuments();
    console.log(`Tong so Users trong database: ${userCount}`);

    // Lấy tất cả users
    const users = await User.find().select('-passwordHash');
    
    if (users.length > 0) {
      console.log('\nDanh sach Users:\n');
      users.forEach((user, index) => {
        console.log(`${index + 1}. Email: ${user.email}`);
        console.log(`   Role: ${user.role}`);
        console.log(`   Fullname: ${user.fullname || 'N/A'}`);
        console.log(`   Status: ${user.status ? 'Active' : 'Inactive'}`);
        console.log(`   Created: ${user.createdAt}\n`);
      });
    } else {
      console.log('\nDatabase chua co user nao!');
      console.log('Ban co the tao user mau bang cach chay: node create-sample-users.js\n');
    }

  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    mongoose.connection.close();
  }
};

checkDatabase();
