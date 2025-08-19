import { NextResponse } from "next/server";
import { UserModel } from "@/lib/models/userModel";
import connectMongo from "@/lib/mongoDb";
import { comparePassword } from "@/utils/comparePassword";
import { generateToken } from "@/utils/generateToken";
import { cookies } from "next/headers";

export const POST = async (req) => {
  try {
    await connectMongo();

    const { email, password, isMobileClient, rememberMe } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Lütfen bütün zorunlu alanları doldurunuz !" },
        { status: 400 }
      );
    }

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    const isValidEmail = (email) => emailRegex.test(email);

    if (!isValidEmail(email)) {
      return NextResponse.json(
        { error: "Lütfen geçerli bir email adresi giriniz !" },
        { status: 400 }
      );
    }

    const user = await UserModel.findOne({ email });

    if (!user) {
      return NextResponse.json(
        { error: "Kullanıcı bulunamadı !" },
        { status: 404 }
      );
    }

    const isMatch = await comparePassword(password, user.password);

    if (!isMatch) {
      return NextResponse.json(
        { error: "Email veya şifre hatalı ! " },
        { status: 400 }
      );
    }

    // Admin yada SuperAdmin yetkisi onayı kontrolü

    if (user.role == "user" && !user.isApproved) {
      return NextResponse.json(
        {
          error: "Hesabınız henüz onaylanmamış. Lütfen admin onayını bekleyin.",
        },
        { status: 403 }
      );
    }

    const { password: _, ...rest } = user._doc;

    const token = generateToken(user._id, rememberMe);

    if (isMobileClient) {
      return NextResponse.json({
        msg: "Giriş başarılı",
        token,
        user: rest,
      });
    } else {
      const cookieStore = cookies();
      (await cookieStore).set("token", token, {
        httpOnly: true,
        maxAge: rememberMe ? 7 * 24 * 60 * 60 : 1 * 24 * 60 * 60,
        sameSite: "strict",
      });
      return NextResponse.json({
        msg: "Giriş başarılı",
        user: rest,
      });
    }
  } catch (error) {
    return NextResponse.json(
      { error: "Sunucu hatası" + error },
      { status: 500 }
    );
  }
};
