import mongoose from "mongoose";
const connectMongoDB = async () => {
    try {
        const conn = await mongoose.connect(`${process.env.MONGO_URI}/${process.env.DB_NAME}`);
        console.log(`MongoDB connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`Error connection to mongoDB: ${error.message}`);
        process.exit(1);
    }
};
export default connectMongoDB;