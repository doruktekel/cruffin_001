// api/auth/forgot-password/route.js - Düzeltilmiş versiyon
import { UserModel } from "@/lib/models/userModel";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { sendResetEmail, testConnection } from "@/lib/mailer";
import connectMongo from "@/lib/mongoDb";
import { withSecurity } from "@/lib/security/rateLimiting";

const forgotPasswordHandler = async (req) => {
  console.log("\n🔄 Forgot Password Request Started");
  console.log("⏰ Timestamp:", new Date().toISOString());

  try {
    // 1. MongoDB bağlantısı
    console.log("🔌 Connecting to MongoDB...");
    await connectMongo();
    console.log("✅ MongoDB connected");

    // 2. Request body parse
    console.log("📦 Parsing request body...");
    const { email } = await req.json();
    console.log("📧 Email received:", email);

    // 3. Email validasyonu
    if (!email) {
      console.log("❌ No email provided");
      return NextResponse.json(
        { error: "Email adresi gerekli!" },
        { status: 400 }
      );
    }

    // Email format kontrolü
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      console.log("❌ Invalid email format");
      return NextResponse.json(
        { error: "Geçersiz email formatı!" },
        { status: 400 }
      );
    }

    // 4. Kullanıcı kontrolü
    console.log("🔍 Searching for user...");
    const user = await UserModel.findOne({ email: email.toLowerCase().trim() });

    if (!user) {
      console.log("❌ User not found for email:", email);
      return NextResponse.json(
        { error: "Bu email sisteme kayıtlı değil!" },
        { status: 404 }
      );
    }

    console.log("✅ User found:", {
      id: user._id,
      role: user.role,
      isApproved: user.isApproved,
    });

    // 5. Approval kontrolü
    if (user.role === "user" && !user.isApproved) {
      console.log("❌ User not approved");
      return NextResponse.json(
        {
          error: "Hesabınız henüz onaylanmamış. Lütfen admin onayını bekleyin.",
        },
        { status: 403 }
      );
    }

    // 6. JWT token oluştur
    console.log("🔐 Creating JWT token...");
    const token = jwt.sign(
      {
        id: user._id,
        email: user.email,
        timestamp: Date.now(),
      },
      process.env.JWT_SECRET_KEY,
      { expiresIn: "10m" }
    );
    console.log("✅ JWT token created");

    // 7. Reset link oluştur
    const baseUrl =
      process.env.NEXT_PUBLIC_BASE_URL ||
      (process.env.NODE_ENV === "production"
        ? "https://cruffin-001.vercel.app"
        : "http://localhost:3000");

    const resetLink = `${baseUrl}/reset-password?token=${token}`;
    console.log("🔗 Reset link:", resetLink);

    // 8. Email connection test (sadece development'ta)
    if (process.env.NODE_ENV === "development") {
      console.log("🧪 Testing email connection...");
      const connectionOk = await testConnection();
      if (!connectionOk) {
        console.log("❌ Email connection test failed");
        return NextResponse.json(
          {
            error: "Email servisi bağlantı hatası. Lütfen tekrar deneyin.",
            debug: "Email connection failed",
          },
          { status: 500 }
        );
      }
      console.log("✅ Email connection test passed");
    }

    // 9. Email gönder
    console.log("📤 Sending reset email...");
    try {
      const emailResult = await sendResetEmail(email, resetLink);
      console.log("✅ Email sent successfully:", emailResult);

      return NextResponse.json(
        {
          message: "Şifre sıfırlama linki email adresinize gönderildi!",
          // Development'ta debug bilgisi ver
          ...(process.env.NODE_ENV === "development" && {
            debug: {
              emailSent: true,
              messageId: emailResult.messageId,
              resetLink: resetLink,
            },
          }),
        },
        { status: 200 }
      );
    } catch (emailError) {
      console.error("❌ Email sending failed:", emailError);

      // Email hatası türüne göre mesaj
      let errorMessage = "Email gönderilemedi. Lütfen tekrar deneyin.";

      if (emailError.code === "EAUTH") {
        errorMessage = "Email servisi kimlik doğrulama hatası.";
      } else if (emailError.code === "ENOTFOUND") {
        errorMessage = "Email servisi bağlantı hatası.";
      } else if (emailError.code === "ETIMEDOUT") {
        errorMessage = "Email gönderimi zaman aşımı. Tekrar deneyin.";
      }

      return NextResponse.json(
        {
          error: errorMessage,
          ...(process.env.NODE_ENV === "development" && {
            debug: {
              errorCode: emailError.code,
              errorMessage: emailError.message,
            },
          }),
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("❌ General error:", error);
    return NextResponse.json(
      {
        error: "Sunucu hatası oluştu. Lütfen tekrar deneyin.",
        ...(process.env.NODE_ENV === "development" && {
          debug: error.message,
        }),
      },
      { status: 500 }
    );
  } finally {
    console.log("🏁 Forgot Password Request Finished\n");
  }
};

// Security wrapper
const securityOptions = {
  endpoint: "forgot-password",
  adaptiveRateLimit: true,
  rateLimit:
    process.env.NODE_ENV === "development"
      ? { limit: 10, windowMs: 5 * 60 * 1000 } // Dev: 5 dakikada 10
      : { limit: 3, windowMs: 60 * 60 * 1000 }, // Prod: saatte 3
};

export const POST = withSecurity(securityOptions)(forgotPasswordHandler);
