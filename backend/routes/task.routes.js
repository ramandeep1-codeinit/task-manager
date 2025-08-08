import express from 'express';
import { createTask } from '../controllers/task.controller.js';


const router = express.Router();

// @route   POST /api/users/createTask
router.post('/createTask', createTask);



export default router;
