// Import required modules
import express from 'express';
import authRoutes from "./routes/auth.routes.js"
import userRoutes from "./routes/user.route.js"
import { configDotenv } from 'dotenv';
import connectMongoDB from './DB/connectMongoDB.js';
import cookieParser from 'cookie-parser';
import { v2 as cloudinary } from 'cloudinary';
configDotenv()
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
})
// Create an Express application
const app = express();

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())
//process a simple route
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);

// Set up the server to listen on a port
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    connectMongoDB()
    console.log(`Server is running on port ${PORT}`);
});

