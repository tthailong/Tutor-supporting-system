import express from "express";
import {
    getAllUsers,
    getUsersByRole,
    getUserById
} from "../controllers/userController.js";

const userRouter = express.Router();

userRouter.get("/", getAllUsers);
userRouter.get("/role/:role", getUsersByRole);
userRouter.get("/:id", getUserById);

export default userRouter;