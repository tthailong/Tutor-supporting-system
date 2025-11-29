import express from "express"
import cors from "cors"
import { connectDB } from "./config/db.js"
import authRouter from "./routes/authRoute.js"
import sessionRouter from "./routes/sessionRoute.js"
import tutorRouter from "./routes/tutorRoute.js"
import studentRouter from "./routes/studentRoute.js"
import notificationRouter from "./routes/notificationRoute.js";
import matchingRouter from "./routes/matchingRoutes.js"
import awardRouter from "./routes/awardRoute.js"
import userRouter from "./routes/userRoute.js"
import { errorHandler, notFoundHandler } from "./middleware/errorHandler.js"
import evaluationRouter from "./routes/evaluationRoutes.js";
import progressRouter from "./routes/progressRoutes.js";
import "dotenv/config.js"

// app config
const app = express()
const port = 4000

// middlewares
app.use(express.json())
app.use(cors())

// db connection
connectDB();

//api routes
app.use("/api/auth", authRouter)
app.use("/api/tutors", tutorRouter);
app.use("/api/session",sessionRouter)
app.use("/api/student", studentRouter);
app.use("/api/notifications", notificationRouter);
app.use("/api/matching", matchingRouter);
app.use("/api/awards", awardRouter);
app.use("/api/users", userRouter);
app.use("/api/evaluations", evaluationRouter);
app.use("/api/progress", progressRouter);

app.get("/", (req, res) => {
    res.send("API working")
})

app.listen(port,() => {
    console.log(`Server started on http://localhost:${port}`);
})

//mongodb+srv://tss:tss@cluster0.cs24pav.mongodb.net/Tutor-supporting-system
//user name is tss, password is tss