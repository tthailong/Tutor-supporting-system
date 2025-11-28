import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();
const token = jwt.sign(
  {
    id: '69285ff4fcc2424d7f1b9234',
    role: 'Student',
    email: 'student1@hcmut.edu.vn'
  },
  process.env.JWT_SECRET || 'your-default-secret',
  { expiresIn: '24h' }
);
console.log('\n🔑 JWT Token Generated:\n');
console.log(token);
console.log('\n📋 Copy this token for Thunder Client testing!\n');