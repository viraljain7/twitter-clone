import express from 'express';
import { createPost, deletePost, likeUnlikePost, commentOnPost, getAllPost, getLikedPosts, getFollowingPosts, getUserPosts } from '../controllers/post.controller.js';
import { protectRoute } from '../middlewares/protectRoute.js';

const router = express.Router();

// Create a new post
router.post('/create', protectRoute, createPost);

// Delete a post
router.delete('/:id', protectRoute, deletePost);

// Like or unlike a post
router.post('/like/:id', protectRoute, likeUnlikePost);

// Get comment posts
router.post('/comment/:id', protectRoute, commentOnPost);

// getAll Posts
router.get('/all', protectRoute, getAllPost);

// getAll Liked Posts
router.get('/likes/:id', protectRoute, getLikedPosts);

// getAll Following Posts
router.get('/following', protectRoute, getFollowingPosts);

// get user Posts
router.get('/user/:username', protectRoute, getUserPosts);






export default router;
