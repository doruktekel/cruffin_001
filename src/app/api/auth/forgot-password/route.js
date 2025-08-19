import { UserModel } from "@/lib/models/userModel";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { transporter } from "@/lib/mailer";
import connectMongo from "@/lib/mongoDb";

export const POST = async (req) => {
  await connectMongo();
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json(
        {
          error: "Böyle bir email sisteme kayıtlı değil !!!!!",
        },
        { status: 404 }
      );
    }

    const user = await UserModel.findOne({ email });

    if (!user) {
      return NextResponse.json(
        {
          error: "Böyle bir email sisteme kayıtlı değil !",
        },
        { status: 404 }
      );
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET_KEY, {
      expiresIn: "10m",
    });

    // const resetLink = `${process.env.NEXT_PUBLIC_BASE_URL}/reset-password?token=${token}`;
    const resetLink = `http://localhost:3000/reset-password?token=${token}`;

    return new Promise((resolve, reject) => {
      console.log("Email gönderiliyor:", email);
      transporter.sendMail(
        {
          from: `"... Destek" <${process.env.EMAIL_USER}>`,
          to: email,
          subject: "Şifre Sıfırlama Linki",
          html: `<p>Merhaba,</p>
          <p>Hesabınıza ait şifre sıfırlama talebi aldık. Aşağıdaki link üzerinden yeni şifre belirleyebilirsiniz:</p>
          <p><a href="${resetLink}">${resetLink}</a></p>
          <p>Bu işlemi siz yapmadıysanız, lütfen bu maili dikkate almayınız.</p>
          <p>Teşekkürler,<br/>... Destek Ekibi</p>
          `,
        },
        (err, info) => {
          if (err) {
            console.error("Mail gönderme hatası:", err);
            resolve(
              NextResponse.json(
                { error: "Mail gönderilemedi: " + err.message },
                { status: 500 }
              )
            );
          } else {
            console.log("Mail başarıyla gönderildi:", info.response);
            resolve(
              NextResponse.json(
                { message: "Şifre Sıfırlama Başarılı" },
                { status: 200 }
              )
            );
          }
        }
      );
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Sunucu hatası" + error.message },
      { status: 500 }
    );
  }
};
