import mongoose from 'mongoose';
import dotenv from 'dotenv';
import tutorModel from '../models/tutorModel.js';

dotenv.config();

const checkTutorAvailability = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ DB Connected\n');

    const tutors = await tutorModel.find({ expertise: 'Calculus A1' });
    
    console.log('📚 Tutors teaching Calculus A1:\n');
    
    tutors.forEach(tutor => {
      console.log(`👨‍🏫 ${tutor.name}`);
      console.log(`   Rating: ${tutor.rating}`);
      console.log(`   Active Students: ${tutor.activeStudents}`);
      console.log(`   Availability:`);
      
      if (tutor.availability && tutor.availability instanceof Map) {
        if (tutor.availability.size > 0) {
          for (const [date, slots] of tutor.availability.entries()) {
            const dateObj = new Date(date);
            const dayOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][dateObj.getDay()];
            console.log(`     ${date} (${dayOfWeek}): ${JSON.stringify(slots)}`);
          }
        } else {
          console.log('     No availability set');
        }
      } else {
        console.log('     No availability set');
      }
      console.log('');
    });

  } catch (err) {
    console.error('❌ Error:', err.message);
  } finally {
    mongoose.connection.close();
  }
};

checkTutorAvailability();
