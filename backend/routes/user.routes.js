import express from 'express';
import { registerUser, loginUser, getAllUsers, updateUser, deleteUser } from '../controllers/user.controller.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);

// ✅ Add this route
router.get('/all', getAllUsers);

// ✅ Update user route (requires user id)
router.put('/:id', updateUser);

router.delete('/:id', deleteUser);

export default router;
