// import mongoose from "mongoose";

// const connectMongo = async () => {
//   if (mongoose.connection.readyState >= 1) {
//     console.log("MongoDb already connected or connecting...");
//     return;
//   }

//   try {
//     await mongoose.connect(process.env.MONGO_URI);
//     console.log("MongodB connected");
//   } catch (error) {
//     console.error("MongoDB error", error);
//   }
// };

// export default connectMongo;

import mongoose from "mongoose";

const connectMongo = async () => {
  // ✅ Bağlantı durumunu kontrol et
  if (mongoose.connections[0].readyState >= 1) {
    console.log("MongoDb already connected or connecting...");
    return mongoose.connections[0];
  }

  try {
    // ✅ Optimize edilmiş bağlantı seçenekleri
    const connection = await mongoose.connect(process.env.MONGO_URI, {
      bufferCommands: false, // Önemli: Buffer'ı kapat
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      heartbeatFrequencyMS: 10000,
    });

    console.log("MongodB connected");
    return connection;
  } catch (error) {
    console.error("MongoDB error", error);
    throw error; // ✅ Hata fırlat
  }
};

export default connectMongo;
