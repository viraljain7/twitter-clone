import Notification from "../models/notification.model.js"

export const getNotifications = async (req, res) => {
    try {
        // Get user ID from the authenticated request
        const userId = req.user._id;

        // Fetch notifications for the user, sorted by createdAt in descending order
        const notifications = await Notification.find({ to: userId }).populate({
            path: "from",
            select: "username profileImg",
        });

        await Notification.updateMany({ to: userId }, { read: true });
        // Send the notifications as a JSON response
        res.status(200).json(notifications);
    } catch (error) {
        // Handle any errors and send an appropriate response
        console.error('Error fetching notifications:', error.message);
        res.status(500).json({ message: 'Error fetching notifications' });
    }
}


export const deleteNotifications = async (req, res) => {
    try {
        // Get user ID from the authenticated request
        const userId = req.user._id;

        // Delete all notifications for the user
        const result = await Notification.deleteMany({ to: userId });

        // Send a success response with the number of deleted notifications
        res.status(200).json({ message: 'Notifications deleted successfully', deletedCount: result.deletedCount });
    } catch (error) {
        // Handle any errors and send an appropriate response
        console.error('Error deleting notifications:', error.message);
        res.status(500).json({ message: 'Error deleting notifications' });
    }
}
