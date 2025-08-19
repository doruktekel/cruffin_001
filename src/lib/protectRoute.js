import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import connectMongo from "./mongoDb";
import { UserModel } from "./models/userModel";

const protectRoute = async (req) => {
  try {
    await connectMongo();

    // Token'ı iki farklı kaynaktan almaya çalış
    let token;

    // 1. Cookie'den dene
    const cookieToken = (await cookies()).get("token")?.value;

    // 2. Authorization header'dan dene (mobil için)
    const authHeader =
      req?.headers.get("authorization") || req?.headers.get("Authorization");
    const headerToken =
      authHeader && authHeader.startsWith("Bearer ")
        ? authHeader.split(" ")[1]
        : null;

    console.log("Cookie Token:", cookieToken);
    console.log("Header Token:", headerToken);

    // İkisinden birini kullan
    token = cookieToken || headerToken;

    if (!token) {
      return { error: "No Token", status: 401 };
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    const user = await UserModel.findById(decoded.id).select("-password");

    if (!user) {
      return { error: "User not found", status: 404 };
    }

    return { user };
  } catch (error) {
    console.error("Auth Error:", error.message);
    return { error: "Unauthorized: " + error.message, status: 401 };
  }
};

export default protectRoute;
