import mongoose from "mongoose";

const sessionSchema = new mongoose.Schema({
    name: {type: String, required: true},
    tutor: {type: String, required: true},
    dayofweek: {
        type: String,
        required: true,
        enum: [
            'Mon', 
            'Tue', 
            'Wed', 
            'Thu',
            'Fri',
        ]
    },
    location: {type: String, required: true},
    timeSlots: [{
        type: String,
        required: true, // This applies to each item in the array
        // The enum still validates that *each chosen string* is on the list
        enum: [
            '7:00-8:00', '8:00-9:00', '9:00-10:00', '10:00-11:00',
            '11:00-12:00', '12:00-13:00',
            '13:00-14:00', '14:00-15:00', '15:00-16:00', '16:00-17:00',
            '17:00-18:00'
        ]
    }],
    duration: {type: Number, required: true}, // how many week it take?
    students: [{
        // Use ObjectId as the data type for linking
        type: mongoose.Schema.Types.ObjectId,
        // 'User' should match the name of your Student/User model
        ref: 'User' 
    }]
})