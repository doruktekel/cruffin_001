import connectMongo from "@/lib/mongoDb";
import { WorkingHoursModel } from "@/lib/models/workingHoursModel";
import { NextResponse } from "next/server";
import protectRoute from "@/lib/protectRoute";
import { revalidatePath } from "next/cache";

const validDays = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

// Saat formatı (HH:mm)
const isValidTime = (time) => /^([01]\d|2[0-3]):([0-5]\d)$/.test(time);

export const POST = async (req) => {
  await connectMongo();

  // Kullanıcı kontrolü
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
    const { data: hoursData } = await req.json();

    console.log("Backend'e gelen veri:", hoursData);

    if (!hoursData || !Array.isArray(hoursData)) {
      return NextResponse.json(
        { error: "Geçerli saat verisi gönderilmelidir." },
        { status: 400 }
      );
    }

    // Her bir günü doğrula
    for (const dayData of hoursData) {
      const { day, openTime, closeTime, isClosed } = dayData;

      if (!day) {
        return NextResponse.json(
          { error: "Gün bilgisi zorunludur." },
          { status: 400 }
        );
      }

      if (!validDays.includes(day)) {
        return NextResponse.json(
          { error: `Geçersiz gün: ${day}` },
          { status: 400 }
        );
      }

      // Eğer gün kapalı değilse, saat kontrolü yap
      if (!isClosed) {
        if (!openTime || !closeTime) {
          return NextResponse.json(
            {
              error: `${day} açık olarak işaretlendiği için açılış ve kapanış saatleri zorunludur.`,
            },
            { status: 400 }
          );
        }

        if (!isValidTime(openTime) || !isValidTime(closeTime)) {
          return NextResponse.json(
            { error: `${day} için geçerli saat formatı giriniz (HH:mm).` },
            { status: 400 }
          );
        }

        if (openTime >= closeTime) {
          return NextResponse.json(
            {
              error: `${day} için açılış saati kapanış saatinden önce olmalıdır.`,
            },
            { status: 400 }
          );
        }
      }
    }

    // Toplu güncelleme işlemi
    const updatePromises = hoursData.map(
      ({ day, openTime, closeTime, isClosed }) => {
        const updateData = {
          day: day, // gün bilgisini de ekleyelim
          isClosed: Boolean(isClosed), // Boolean'a çevir ve her zaman kaydet
        };

        // Eğer gün kapalı değilse saatleri kaydet
        if (!isClosed) {
          updateData.openTime = openTime;
          updateData.closeTime = closeTime;
        } else {
          // Kapalı günler için saatleri temizle
          updateData.openTime = "";
          updateData.closeTime = "";
        }

        console.log(`${day} için update data:`, updateData); // Debug için

        return WorkingHoursModel.findOneAndUpdate({ day }, updateData, {
          new: true,
          upsert: true,
          setDefaultsOnInsert: true, // Yeni kayıt oluşturulurken default değerleri uygula
        });
      }
    );

    const results = await Promise.all(updatePromises);

    console.log("Database'e kaydedilen sonuçlar:", results); // Debug için

    revalidatePath("/dashboard/hours");
    revalidatePath("/");

    return NextResponse.json(
      {
        message: "Çalışma saatleri başarıyla güncellendi.",
        data: results,
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("POST /api/hours error:", err);
    return NextResponse.json(
      { error: "Sunucu hatası oluştu." },
      { status: 500 }
    );
  }
};
