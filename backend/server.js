// Import required modules
import express from 'express';
import authRoutes from "./routes/auth.routes.js"
import { configDotenv } from 'dotenv';
import connectMongoDB from './DB/connectMongoDB.js';
configDotenv()

// Create an Express application
const app = express();

//process a simple route
app.use('/api/auth', authRoutes);

// Set up the server to listen on a port
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    connectMongoDB()
    console.log(`Server is running on port ${PORT}`);
});

