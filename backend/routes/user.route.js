import express from "express";

import { getUserProfile, followUser, getSuggestedUsers, updateUserProfile } from "../controllers/user.controller.js";
import { protectRoute } from "../middlewares/protectRoute.js";


const router = express.Router()

// Get user profile by username
router.get('/profile/:username', protectRoute, getUserProfile);

// Get suggested users
router.get('/suggested', protectRoute, getSuggestedUsers);

// Follow/unFollow a user
router.post('/follow/:id', protectRoute, followUser);

// Update user profile
router.post('/update', protectRoute, updateUserProfile);

export default router;