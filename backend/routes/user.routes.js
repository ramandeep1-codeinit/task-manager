import express from 'express';
import { registerUser, loginUser, getAllUsers, updateUser, deleteUser } from '../controllers/user.controller.js';

const router = express.Router();

// Register new user
router.post('/register', registerUser);

// Login existing user
router.post('/login', loginUser);

// Get all users
router.get('/all', getAllUsers);

// Update user route (requires user id)
router.put('/:id', updateUser);

// Delete user route (requires user id)
router.delete('/:id', deleteUser);

export default router;
