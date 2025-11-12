import express from "express"
import cors from "cors"
import { connectDB } from "./config/db.js"


// app config
const app = express()
const port = 4000

// middlewares
app.use(express.json())
app.use(cors())

// db connection
connectDB();

app.get("/", (req, res) => {
    res.send("API working")
})

app.listen(port,() => {
    console.log(`Server started on http://localhost:${port}`);
})

//mongodb+srv://tss:tss@cluster0.cs24pav.mongodb.net/Tutor-supporting-system
//user name is tss, password is tss