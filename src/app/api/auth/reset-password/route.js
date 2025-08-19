import { UserModel } from "@/lib/models/userModel";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { hashPassword } from "@/utils/hashPassword";
import connectMongo from "@/lib/mongoDb";

export const POST = async (req) => {
  await connectMongo();
  try {
    const { password, token } = await req.json();

    if (!token || !password) {
      return NextResponse.json(
        { error: "Şifre zorunludur !" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password en az 6 karakter olmalı !" },
        { status: 400 }
      );
    }

    // Token'ı doğrula
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    } catch (err) {
      return NextResponse.json(
        { error: "Geçersiz veya süresi dolmuş istek !" },
        { status: 401 }
      );
    }

    // Kullanıcıyı bul
    const user = await UserModel.findById(decoded.id);
    if (!user) {
      return NextResponse.json(
        { error: "Kullanıcı bulunamadı" },
        { status: 404 }
      );
    }

    const hashedPassword = await hashPassword(password);

    await UserModel.findByIdAndUpdate(user._id, {
      password: hashedPassword,
    });

    return NextResponse.json(
      { message: "Şifre başarıyla güncellendi" },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Sunucu hatası: " + error.message },
      { status: 500 }
    );
  }
};
