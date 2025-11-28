import express from 'express';
import { loginUser } from '../controllers/authController.js';

const authRouter = express.Router();

// POST /api/auth/login
authRouter.post('/login', loginUser);

export default authRouter;
