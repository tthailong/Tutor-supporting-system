import mongoose from "mongoose";
export const connectDB = async () => {
    await mongoose.connect('mongodb+srv://tss:tss@cluster0.cs24pav.mongodb.net/Tutor-supporting-system'). then(()=> console.log("DB Connected"));

}