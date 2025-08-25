import connectMongo from "@/lib/mongoDb";
import { ContactModel } from "@/lib/models/contactModel";
import { NextResponse } from "next/server";
import protectRoute from "@/lib/protectRoute";
import { revalidatePath } from "next/cache";

// E-posta formatını kontrol eden regex
const isValidEmail = (email) => /\S+@\S+\.\S+/.test(email);
// Telefon numarası kontrolü (Sadece rakamlar)
const isValidPhone = (phone) => /^\d+$/.test(phone);
// Harita linki kontrolü (URL formatı)
const isValidMapLink = (link) =>
  /^(https?|ftp):\/\/[^\s/$.?#].[^\s]*$/.test(link);

export const POST = async (req) => {
  await connectMongo();

  const { user, error, status } = await protectRoute(req);
  if (error) {
    return NextResponse.json({ error: error.message }, { status });
  }

  const isAdmin = user.role === "admin" || user.role === "superadmin";
  const isApprovedUser = user.role === "user" && user.isApproved;

  if (!(isAdmin || isApprovedUser)) {
    return NextResponse.json(
      {
        error:
          "Bu işlem için gerekli yetkiniz yok veya hesabınız onaylanmamış.",
      },
      { status: 403 }
    );
  }

  try {
    const { contactData } = await req.json();

    // Verilerin doğruluğunu kontrol et
    if (
      !contactData.address ||
      !contactData.phone ||
      !contactData.email ||
      !contactData.mapLink
    ) {
      return NextResponse.json(
        { error: "Tüm alanlar zorunludur." },
        { status: 400 }
      );
    }

    // E-posta formatını kontrol et
    if (!isValidEmail(contactData.email)) {
      return NextResponse.json(
        { error: "Geçerli bir e-posta adresi giriniz." },
        { status: 400 }
      );
    }

    // Telefon numarasını kontrol et
    if (!isValidPhone(contactData.phone)) {
      return NextResponse.json(
        { error: "Telefon numarası sadece rakamlardan oluşmalıdır." },
        { status: 400 }
      );
    }

    // Harita linkini kontrol et
    if (!isValidMapLink(contactData.mapLink)) {
      return NextResponse.json(
        { error: "Geçerli bir harita linki giriniz." },
        { status: 400 }
      );
    }

    // İletişim bilgisini bul ve güncelle
    let updatedContact = await ContactModel.findOneAndUpdate({}, contactData, {
      new: true,
      upsert: true,
    });

    revalidatePath("/dashboard/contact");
    revalidatePath("/");

    return NextResponse.json(
      {
        message: "İletişim bilgileri başarıyla güncellendi.",
        contact: updatedContact,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("POST /api/contact error:", error);
    return NextResponse.json(
      { error: "İletişim bilgileri güncellenemedi." },
      { status: 500 }
    );
  }
};
