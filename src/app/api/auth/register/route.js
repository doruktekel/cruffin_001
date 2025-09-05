import { NextResponse } from "next/server";
import { UserModel } from "@/lib/models/userModel";
import connectMongo from "@/lib/mongoDb";
import { hashPassword } from "@/utils/hashPassword";
import { registerSchema } from "@/lib/validations/authSchemas";
import { withSecurity } from "@/lib/security/rateLimiting";

async function handleRegister(req) {
  try {
    await connectMongo();

    const body = await req.json();

    // ✅ Body size kontrolü (güvenlik için)
    const bodySize = JSON.stringify(body).length;
    if (bodySize > 1024) {
      // 1KB limit
      return NextResponse.json(
        {
          error: "Request çok büyük",
          message: "Gönderilen veri boyutu limiti aştı",
        },
        { status: 413 }
      );
    }

    // ✅ Zod validation
    const validation = registerSchema.safeParse(body);

    if (!validation.success) {
      const fieldErrors = {};
      validation.error.errors.forEach((err) => {
        const field = err.path[0];
        if (!fieldErrors[field]) {
          fieldErrors[field] = [];
        }
        fieldErrors[field].push(err.message);
      });

      return NextResponse.json(
        {
          error: "Validation failed",
          fieldErrors,
          message: "Lütfen form bilgilerini kontrol ediniz",
        },
        { status: 400 }
      );
    }

    const { email, password, middleName, profileUrl } = validation.data;

    // ✅ Email normalize et (güvenlik için)
    const normalizedEmail = email.toLowerCase().trim();

    // ✅ Honey pot kontrolü (bot koruması için)
    if (middleName || profileUrl) {
      console.log("🤖 Bot tespit edildi - Silent fail");
      return NextResponse.json(
        {
          success: true,
          message: "Kayıt başarılı! Email onayı gönderildi.",
        },
        {
          status: 201,
          headers: {
            "X-Bot-Detected": "true", // Sadece debug için
          },
        }
      );
    }

    // ✅ Mevcut kullanıcı kontrolü
    const existingUser = await UserModel.findOne({
      email: normalizedEmail,
    });

    if (existingUser) {
      return NextResponse.json(
        {
          error: "Bu email adresi ile zaten bir kullanıcı kayıtlı!",
          fieldErrors: {
            email: ["Bu email adresi ile zaten bir kullanıcı kayıtlı!"],
          },
        },
        { status: 400 }
      );
    }

    // ✅ Password strength double check (extra güvenlik)
    if (password.length < 8) {
      return NextResponse.json(
        {
          error: "Şifre çok zayıf",
          fieldErrors: {
            password: ["Şifre en az 8 karakter olmalı"],
          },
        },
        { status: 400 }
      );
    }

    // ✅ Şifreyi hash'le
    const hashedPassword = await hashPassword(password);

    // ✅ User oluştur
    const newUser = await UserModel.create({
      email: normalizedEmail,
      password: hashedPassword,
      createdAt: new Date(),
      //isActive: false, // Admin onayı bekliyor
      role: "user",
      // ✅ Güvenlik için ek alanlar
      //emailVerified: false,
      // registrationIP:
      //   req.headers.get("x-forwarded-for")?.split(",")[0] || "unknown",
      //lastLoginAt: null,
      //failedLoginAttempts: 0,
    });

    // ✅ Password'ü response'dan çıkar
    const { password: _, ...userWithoutPassword } = newUser.toObject();

    // ✅ Log kayıt işlemi (production'da proper logging)
    console.log(`New user registered: ${normalizedEmail}`);

    // ✅ Success response
    return NextResponse.json(
      {
        success: true,
        message: "Kayıt başarılı! Admin onayı bekleniyor.",
        user: {
          id: userWithoutPassword._id,
          email: userWithoutPassword.email,
          role: userWithoutPassword.role,
          isApproved: userWithoutPassword.isApproved,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Register API Error:", error);

    // ✅ MongoDB duplicate key error
    if (error.code === 11000) {
      return NextResponse.json(
        {
          error: "Bu email adresi zaten kullanımda",
          fieldErrors: {
            email: ["Bu email adresi zaten kayıtlı"],
          },
        },
        { status: 400 }
      );
    }

    // ✅ Validation error
    if (error.name === "ValidationError") {
      const fieldErrors = {};
      Object.keys(error.errors).forEach((field) => {
        fieldErrors[field] = [error.errors[field].message];
      });

      return NextResponse.json(
        {
          error: "Validasyon hatası",
          fieldErrors,
        },
        { status: 400 }
      );
    }

    // ✅ Generic server error - güvenlik için detay verme
    return NextResponse.json(
      {
        error: "Sunucu hatası oluştu. Lütfen tekrar deneyiniz.",
        message: "Internal server error",
      },
      { status: 500 }
    );
  }
}

// Rate limit ve güvenlik wrapper'ı ile export
export const POST = withSecurity({
  endpoint: "register",
  allowedMethods: ["POST"],
  adaptiveRateLimit: true, // Otomatik 3 req/saat
  skipRateLimit: false,
  requireAuth: false,
})(handleRegister);
