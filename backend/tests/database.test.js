// tests/database.test.js
import mongoose from 'mongoose';
import SessionEvaluation from '../models/sessionEvaluationModel.js';
import StudentProgress from '../models/studentProgressModel.js';
import Session from '../models/sessionModel.js';

// Kết nối MongoDB
const connectDB = async () => {
    try {
        await mongoose.connect('mongodb://localhost:27017/tutor_system_test');
        console.log('✅ Connected to MongoDB');
    } catch (error) {
        console.error('❌ MongoDB connection error:', error);
        process.exit(1);
    }
};

const testDatabase = async () => {
    console.log('🧪 STARTING DATABASE TESTS...\n');

    await connectDB();

    // Clean up trước khi test
    await SessionEvaluation.deleteMany({});
    await StudentProgress.deleteMany({});
    await Session.deleteMany({});

    // Tạo test ObjectIds
    const studentId = new mongoose.Types.ObjectId();
    const tutorId = new mongoose.Types.ObjectId();
    
    // Test 1: Tạo Session trước
    console.log('1. Testing Session Creation...');
    const session = new Session({
        name: "General Chemistry Tutorial",
        tutor: tutorId,
        location: "Room A101",
        duration: 10,
        capacity: 20,
        studentCount: 5,
        students: [studentId],
        status: "completed"
    });
    const savedSession = await session.save();
    console.log('✅ Session created:', savedSession._id);

    // Test 2: Session Evaluation
    console.log('\n2. Testing Session Evaluation...');
    const evaluation = new SessionEvaluation({
        student: studentId,
        session: savedSession._id,
        tutor: tutorId,
        rating: 5,
        comments: "Excellent teaching methods! Very clear explanations.",
        status: "submitted"
    });
    const savedEvaluation = await evaluation.save();
    console.log('✅ Evaluation created:', savedEvaluation._id);

    // Test 3: Student Progress
    console.log('\n3. Testing Student Progress...');
    const progress = new StudentProgress({
        tutor: tutorId,
        student: studentId,
        session: savedSession._id,
        strengths: "Strong analytical skills and good participation",
        areasForImprovement: "Need to work on time management",
        recommendations: "Practice more exercises from chapter 4",
        overallProgress: "good",
        status: "submitted"
    });
    const savedProgress = await progress.save();
    console.log('✅ Progress record created:', savedProgress._id);

    // Test 4: Query Tests
    console.log('\n4. Testing Queries...');
    const evaluations = await SessionEvaluation.find().populate('session');
    const progresses = await StudentProgress.find().populate('student session');
    
    console.log(`📊 Evaluations found: ${evaluations.length}`);
    console.log(`📊 Progress records found: ${progresses.length}`);
    
    // Test 5: Validation Tests
    console.log('\n5. Testing Validations...');
    try {
        const invalidEvaluation = new SessionEvaluation({
            student: studentId,
            session: savedSession._id,
            tutor: tutorId,
            rating: 6, // Invalid - should be 1-5
            status: "submitted"
        });
        await invalidEvaluation.save();
        console.log('❌ Validation test FAILED');
    } catch (error) {
        console.log('✅ Rating validation works:', error.message);
    }

    // Test 6: Draft vs Submitted
    console.log('\n6. Testing Draft Functionality...');
    const draftEvaluation = new SessionEvaluation({
        student: studentId,
        session: savedSession._id,
        tutor: tutorId,
        rating: 4,
        comments: "Still thinking...",
        status: "draft" // Draft status
    });
    await draftEvaluation.save();
    console.log('✅ Draft evaluation created');

    const draftCount = await SessionEvaluation.countDocuments({ status: "draft" });
    const submittedCount = await SessionEvaluation.countDocuments({ status: "submitted" });
    console.log(`📝 Drafts: ${draftCount}, Submitted: ${submittedCount}`);

    console.log('\n🎉 ALL DATABASE TESTS COMPLETED SUCCESSFULLY!');
    console.log('\n📋 SUMMARY:');
    console.log(`   - Sessions: 1`);
    console.log(`   - Evaluations: ${await SessionEvaluation.countDocuments()}`);
    console.log(`   - Progress Records: ${await StudentProgress.countDocuments()}`);

    mongoose.connection.close();
};

// Chạy tests
testDatabase().catch(error => {
    console.error('💥 TEST FAILED:', error);
    process.exit(1);
});