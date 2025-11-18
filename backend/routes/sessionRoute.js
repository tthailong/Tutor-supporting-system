import express from "express";
import  { createSession }  from "../controllers/sessionController.js";
import multer from "multer";

const sessionRouter = express.Router();

const upload = multer();

sessionRouter.post("/create",upload.none(), createSession);

sessionRouter.get("/test", (req, res) => {
    res.send("Session route works!");
});
export default sessionRouter;