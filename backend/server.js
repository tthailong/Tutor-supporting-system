import express from "express"
import cors from "cors"


// app config
const app = express()
const port = 4000

// middlewares
app.use(express.json())
app.use(cors())

app.get("/", (req, res) => {
    res.send("API working")
})

app.listen(port,() => {
    console.log('Server started on http://localhost:${port}');
})

//mongodb+srv://tss:tss@cluster0.ygriotm.mongodb.net/?appName=Cluster0