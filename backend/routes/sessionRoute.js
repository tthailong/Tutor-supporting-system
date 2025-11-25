import express from "express";
import  { createSession }  from "../controllers/sessionController.js";
import multer from "multer";

const sessionRouter = express.Router();

const upload = multer();

sessionRouter.post("/create",upload.none(), createSession);


export default sessionRouter;