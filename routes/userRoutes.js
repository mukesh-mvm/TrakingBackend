import express from 'express';
import {
  registerUser,
  loginUser,
  getUserProfile,
  updateUser,
  deleteUser,
  getAllUsers
} from '../controllers/userController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/profile', protect, getUserProfile);
router.put('/:id', protect, updateUser);
router.get('/getAllUser',getAllUsers);
router.delete('/:id', protect, deleteUser);

export default router;
