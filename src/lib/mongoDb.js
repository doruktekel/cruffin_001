import mongoose from "mongoose";

const connectMongo = async () => {
  if (mongoose.connection.readyState >= 1) {
    console.log("MongoDb already connected or connecting...");
    return;
  }

  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongodB connected");
  } catch (error) {
    console.error("MongoDB error", error);
  }
};

export default connectMongo;
