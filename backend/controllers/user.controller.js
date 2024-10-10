import Notification from "../models/notification.model.js";
import User from "../models/user.model.js";
import { v2 as cloudinary } from 'cloudinary';
import bcrypt from "bcryptjs";


export const getUserProfile = async (req, res) => {
    try {
        const { username } = req.params;

        const user = await User.findOne({ username }).select("-password");

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        res.status(200).json(user);
    } catch (error) {
        console.error("Error in getUserProfile: ", error.message);
        res.status(500).json({ error: "Server error" });
    }
};


export const followUser = async (req, res) => {
    try {
        const { id } = req.params;
        const userToFollow = await User.findById(id);
        const currentUser = await User.findById(req.user._id);
        if (id === req.user._id.toString()) {
            return res.status(400).json({ error: "You can't follow/unFollow yourself" });
        }
        if (!userToFollow || !currentUser) {
            return res.status(404).json({ error: 'User not found' });
        }

        const isFollowing = currentUser.following.includes(userToFollow._id)
        if (isFollowing) {
            // UnFollow 
            await User.findByIdAndUpdate(currentUser._id, {
                $pull: { following: userToFollow._id }
            });
            await User.findByIdAndUpdate(userToFollow._id, {
                $pull: { followers: currentUser._id }
            });
            res.status(200).json({ message: 'User unFollowed successfully' });
        } else {
            // Follow
            await User.findByIdAndUpdate(currentUser._id, {
                $push: { following: userToFollow._id }
            });
            await User.findByIdAndUpdate(userToFollow._id, {
                $push: { followers: currentUser._id }
            });


            // Send notification to user
            const newNotification = new Notification({
                from: currentUser._id,
                to: userToFollow._id,
                type: 'follow',
            });
            await newNotification.save()
            //Todo: return id of user as response
            res.status(200).json({ message: 'User followed successfully' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const getSuggestedUsers = async (req, res) => {
    try {
        const currentUserID = req.user._id;
        if (!currentUserID) {
            return res.status(404).json({ error: 'Current user not found' });
        }
        const usersFollowedByMe = await User.findById(currentUserID).select('following')

        const users = await User.aggregate([
            {
                $match: {
                    _id: { $ne: currentUserID },
                },
            },
            { $sample: { size: 10 } },
        ]);

        // 1,2,3,4,5,6,
        const filteredUsers = users.filter((user) => !usersFollowedByMe.following.includes(user._id));
        const suggestedUsers = filteredUsers.slice(0, 4);

        suggestedUsers.forEach((user) => (user.password = null));

        res.status(200).json(suggestedUsers);
    } catch (error) {
        console.error("Error in getSuggestedUsers: ", error.message);
        res.status(500).json({ error: "Server error" });
    }
};

export const updateUserProfile = async (req, res) => {
    // const currentUser=
    let { fullName, email, username, currentPassword, newPassword, bio, link } = req.body;
    let { coverImg, profileImg } = req.body;
    const currentUserID = req.user._id;

    try {
        let currentUser = await User.findById(currentUserID)
        if (!currentUser) return res.status(404).json({ message: "User not found" });

        if ((!newPassword && currentPassword) || (!currentPassword && newPassword)) {
            return res.status(400).json({ error: "Please provide both current password and new password" });
        }
        if (currentPassword && newPassword) {
            const isMatch = await bcrypt.compare(currentPassword, currentUser.password);
            if (!isMatch) return res.status(400).json({ error: "Current password is incorrect" });
            if (newPassword.length < 6) {
                return res.status(400).json({ error: "Password must be at least 6 characters long" });
            }

            const salt = await bcrypt.genSalt(10);
            currentUser.password = await bcrypt.hash(newPassword, salt);
        }
        if (profileImg) {
            if (currentUser.profileImg) {
                // https://res.cloudinary.com/dyfqon1v6/image/upload/v1712997552/zmxorcxexpdbh8r0bkjb.png
                await cloudinary.uploader.destroy(currentUser.profileImg.split("/").pop().split(".")[0]);
            }
            const uploadResp = await cloudinary.uploader.upload(profileImg)
            profileImg = uploadResp.secure.url
        }
        if (coverImg) {
            if (currentUser.coverImg) {
                // https://res.cloudinary.com/dyfqon1v6/image/upload/v1712997552/zmxorcxexpdbh8r0bkjb.png
                await cloudinary.uploader.destroy(currentUser.coverImg.split("/").pop().split(".")[0]);
            }
            const uploadResp = await cloudinary.uploader.upload(coverImg)
            coverImg = uploadResp.secure.url
        }

        currentUser.fullName = fullName || currentUser.fullName;
        currentUser.email = email || currentUser.email;
        currentUser.username = username || currentUser.username;
        currentUser.bio = bio || currentUser.bio;
        currentUser.link = link || currentUser.link;
        currentUser.profileImg = profileImg || currentUser.profileImg;
        currentUser.coverImg = coverImg || currentUser.coverImg;

        currentUser = await currentUser.save();

        // password should be null in response
        currentUser.password = null;

        return res.status(200).json(currentUser);


    } catch (error) {
        console.error("Error in update user Profile: ", error.message);
        res.status(500).json({ error: "Server error" });
    }


}