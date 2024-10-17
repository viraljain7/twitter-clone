import Notification from "../models/notification.model.js";
import Post from "../models/post.model.js";
import User from "../models/user.model.js";


export const createPost = async (req, res) => {
    try {
        const { text, img } = req.body;
        const userId = req.user._id.toString();
        const user = await User.findById(userId)

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        if (!img & !text) {
            return res.status(400).json({ error: "Post must have image and text" });
        }
        if (img) {
            const uploadResp = await cloudinary.uploader.upload(img)
            img = uploadResp.secure.url
        }

        const newPost = new Post({
            user: userId,
            text,
            img
        });

        await newPost.save();

        res.status(201).json({
            message: "Post created successfully",
            post: newPost,
        });
    } catch (error) {
        console.error("Error in createPost controller:", error.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

export const deletePost = async (req, res) => {
    try {
        const postId = req.params.id;
        const userId = req.user._id;

        const post = await Post.findById(postId);

        if (!post) {
            return res.status(404).json({ error: "Post not found" });
        }

        if (post.user.toString() !== userId.toString()) {
            return res.status(403).json({ error: "Unauthorized to delete this post" });
        }

        if (post.img) {
            const imgId = post.img.split("/").pop().split(".")[0];
            await cloudinary.uploader.destroy(imgId);
        }

        await Post.findByIdAndDelete(postId);

        res.status(200).json({ message: "Post deleted successfully" });
    } catch (error) {
        console.error("Error in deletePost controller:", error.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

export const likeUnlikePost = async (req, res) => {
    try {
        const postId = req.params.id;
        const userId = req.user._id;

        const post = await Post.findById(postId);

        if (!post) {
            return res.status(404).json({ error: "Post not found" });
        }

        const userLikedPost = post.likes.includes(userId);

        if (userLikedPost) {
            // Unlike the post
            await Post.updateOne({ _id: postId }, { $pull: { likes: userId } });
            await User.updateOne({ _id: userId }, { $pull: { likedPosts: postId } });

            res.status(200).json({ message: "Post unliked successfully" });
        } else {
            // Like the post
            post.likes.push(userId);
            await User.updateOne({ _id: userId }, { $push: { likedPosts: postId } });

            await post.save();

            // Send notification to user
            const newNotification = new Notification({
                from: userId,
                to: post.user,
                type: 'like',
            });
            await newNotification.save()

            res.status(200).json({ message: "Post liked successfully" });
        }
    } catch (error) {
        console.error("Error in likeUnlikePost controller:", error.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

export const commentOnPost = async (req, res) => {
    try {
        const { text } = req.body;
        const postId = req.params.id;
        const userId = req.user._id;

        if (!text) {
            return res.status(400).json({ error: "Text field is required" });
        }

        const post = await Post.findById(postId);

        if (!post) {
            return res.status(404).json({ error: "Post not found" });
        }

        const newComment = {
            user: userId,
            text
        };

        post.comments.push(newComment);
        await post.save();

        res.status(200).json({
            message: "Comment added successfully",
            comment: newComment
        });
    } catch (error) {
        console.error("Error in commentOnPost controller:", error.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
}

export const getAllPost = async (req, res) => {
    try {
        const posts = await Post.find()
            .sort({ createdAt: -1 })
            .populate({
                path: "user",
                select: "-password",
            })
            .populate({
                path: "comments.user",
                select: "-password",
            });

        if (posts.length === 0) {
            return res.status(200).json([]);
        }

        res.status(200).json(posts);
    } catch (error) {
        console.log("Error in getAllPosts controller: ", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

export const getLikedPosts = async (req, res) => {
    try {
        const userId = req.user._id;

        const user = await User.findById(userId)

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        const likedPosts = await Post.find({
            _id: {
                $in: user.likedPosts
            }
        })
            .populate({
                path: "user",
                select: "-password",
            })
            .populate({
                path: "comments.user",
                select: "-password",
            });

        res.status(200).json(likedPosts);
    } catch (error) {
        console.error("Error in getLikedPosts controller:", error.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

export const getFollowingPosts = async (req, res) => {
    try {
        const userId = req.user._id;

        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        const followingPosts = await Post.find({
            user: { $in: user.following }
        })
            .sort({ createdAt: -1 })
            .populate({
                path: "user",
                select: "-password",
            })
            .populate({
                path: "comments.user",
                select: "-password",
            });

        res.status(200).json(followingPosts);
    } catch (error) {
        console.error("Error in getFollowingPosts controller:", error.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

export const getUserPosts = async (req, res) => {
    try {
        const { username } = req.params;

        const user = await User.findOne({ username });

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        const posts = await Post.find({ user: user._id })
            .sort({ createdAt: -1 })
            .populate({
                path: "user",
                select: "-password",
            })
            .populate({
                path: "comments.user",
                select: "-password",
            });

        res.status(200).json(posts);
    } catch (error) {
        console.error("Error in getUserPosts controller:", error.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
}