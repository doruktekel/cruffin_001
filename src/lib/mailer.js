// import nodemailer from "nodemailer";

// export const transporter = nodemailer.createTransport({
//   // service: "gmail",
//   host: "smtp.gmail.com",
//   port: 587,
//   secure: false, // TLS
//   auth: {
//     user: process.env.EMAIL_USER,
//     pass: process.env.EMAIL_PASS,
//   },
// });

// lib/mailer.js - Geliştirilmiş email yapılandırması
import nodemailer from "nodemailer";

// Email yapılandırmasını test et
async function testEmailConnection() {
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    // Gmail için ek ayarlar
    tls: {
      rejectUnauthorized: false,
    },
    debug: process.env.NODE_ENV === "development", // Debug modu
    logger: process.env.NODE_ENV === "development",
  });

  try {
    await transporter.verify();
    console.log("✅ Email server connection successful");
    return transporter;
  } catch (error) {
    console.error("❌ Email server connection failed:", error);
    throw error;
  }
}

// Transporter'ı oluştur
export const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: {
    rejectUnauthorized: false,
  },
  debug: process.env.NODE_ENV === "development",
  logger: process.env.NODE_ENV === "development",
});

// Email gönderme fonksiyonu - Promise wrapper ile
export async function sendResetEmail(email, resetLink) {
  try {
    console.log("📧 Preparing to send email to:", email);
    console.log("🔗 Reset link:", resetLink);

    const mailOptions = {
      from: `"Cruffin Destek" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Şifre Sıfırlama Linki - Cruffin",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #B45309; font-size: 36px; margin: 0;">Cruffin</h1>
          </div>
          
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px;">
            <h2 style="color: #333; margin-top: 0;">Şifre Sıfırlama Talebi</h2>
            
            <p style="color: #555; font-size: 16px;">Merhaba,</p>
            
            <p style="color: #555; font-size: 16px;">
              Hesabınız için şifre sıfırlama talebi aldık. Yeni şifre belirlemek için 
              aşağıdaki butona tıklayın:
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetLink}" 
                 style="background-color: #B45309; color: white; padding: 15px 30px; 
                        text-decoration: none; border-radius: 5px; display: inline-block;
                        font-weight: bold; font-size: 16px;">
                🔒 Şifremi Sıfırla
              </a>
            </div>
            
            <div style="background-color: #fff; padding: 15px; border-radius: 4px; margin: 20px 0;">
              <p style="margin: 0; color: #666; font-size: 14px;">
                <strong>Link çalışmıyor mu?</strong> Bu URL'yi kopyalayıp tarayıcınıza yapıştırın:
              </p>
              <p style="margin: 5px 0 0 0; font-size: 12px; color: #888; word-break: break-all;">
                ${resetLink}
              </p>
            </div>
            
            <div style="border-left: 4px solid #f39c12; padding-left: 15px; margin: 20px 0;">
              <p style="color: #d35400; margin: 0; font-weight: bold;">⏰ Önemli:</p>
              <p style="color: #d35400; margin: 5px 0 0 0; font-size: 14px;">
                Bu link sadece 10 dakika geçerlidir!
              </p>
            </div>
            
            <p style="color: #777; font-size: 14px; margin-top: 30px;">
              Bu işlemi siz yapmadıysanız, bu e-postayı güvenle silebilirsiniz.
              Hesabınızda herhangi bir değişiklik yapılmayacaktır.
            </p>
          </div>
          
          <div style="text-align: center; margin-top: 20px; padding-top: 20px; border-top: 1px solid #eee;">
            <p style="color: #999; font-size: 12px; margin: 0;">
              Bu e-posta Cruffin güvenlik sistemi tarafından otomatik olarak gönderilmiştir.
            </p>
          </div>
        </div>
      `,
      // Alternatif metin versiyonu
      text: `
Merhaba,

Hesabınız için şifre sıfırlama talebi aldık.

Şifrenizi sıfırlamak için bu linke tıklayın: ${resetLink}

Bu link 10 dakika geçerlidir.

Bu işlemi siz yapmadıysanız, bu e-postayı dikkate almayın.

Cruffin Destek Ekibi
      `,
    };

    console.log("📤 Sending email...");
    const result = await transporter.sendMail(mailOptions);

    console.log("✅ Email sent successfully!");
    console.log("📋 Message ID:", result.messageId);
    console.log("📋 Response:", result.response);

    return {
      success: true,
      messageId: result.messageId,
      response: result.response,
    };
  } catch (error) {
    console.error("❌ Email sending failed:");
    console.error("Error code:", error.code);
    console.error("Error message:", error.message);

    // Gmail özel hata mesajları
    if (error.code === "EAUTH") {
      console.error("🔐 Gmail authentication failed! Check your App Password.");
    } else if (error.code === "ENOTFOUND") {
      console.error("🌐 DNS lookup failed. Check your internet connection.");
    } else if (error.code === "ECONNECTION") {
      console.error("🔌 Connection failed. Gmail SMTP might be blocked.");
    }

    throw error;
  }
}

// Connection test fonksiyonu
export async function testConnection() {
  try {
    console.log("🔍 Testing email connection...");
    await transporter.verify();
    console.log("✅ Email server is ready to take our messages");
    return true;
  } catch (error) {
    console.error("❌ Email server connection failed:", error);
    return false;
  }
}
