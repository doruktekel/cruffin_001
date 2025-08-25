import connectMongo from "@/lib/mongoDb";
import { UserModel } from "@/lib/models/userModel";
import { NextResponse } from "next/server";
import protectRoute from "@/lib/protectRoute";
import { revalidatePath } from "next/cache";

export const POST = async (req) => {
  await connectMongo();

  // Kullanıcı kontrolü - Admin yetkisi gerekli
  const { user, error, status } = await protectRoute(req);
  if (error) {
    return NextResponse.json({ error: error.message }, { status });
  }

  // Admin kontrolü
  if (user.role !== "admin" && user.role !== "superadmin") {
    return NextResponse.json(
      { error: "Bu işlem için admin yetkisi gereklidir." },
      { status: 403 }
    );
  }

  try {
    const { usersToUpdate, usersToDelete } = await req.json();

    console.log("Backend'e gelen veri:", { usersToUpdate, usersToDelete });

    let updatedCount = 0;
    let deletedCount = 0;

    // Kullanıcıları güncelle (eğer varsa)
    if (
      usersToUpdate &&
      Array.isArray(usersToUpdate) &&
      usersToUpdate.length > 0
    ) {
      // Her bir kullanıcıyı doğrula
      for (const userData of usersToUpdate) {
        const { _id, email, isApproved } = userData;

        if (!_id) {
          return NextResponse.json(
            { error: "Kullanıcı ID'si zorunludur." },
            { status: 400 }
          );
        }

        if (!email) {
          return NextResponse.json(
            { error: "E-posta adresi zorunludur." },
            { status: 400 }
          );
        }

        if (typeof isApproved !== "boolean") {
          return NextResponse.json(
            { error: "isApproved değeri boolean olmalıdır." },
            { status: 400 }
          );
        }
      }

      // Toplu güncelleme işlemi
      const updatePromises = usersToUpdate.map(({ _id, isApproved }) => {
        return UserModel.findByIdAndUpdate(
          _id,
          { isApproved: Boolean(isApproved) },
          { new: true, runValidators: true }
        );
      });

      const updateResults = await Promise.all(updatePromises);

      // Null sonuçları kontrol et (bulunamayan kullanıcılar)
      const notFoundUpdates = updateResults.filter((result) => result === null);
      if (notFoundUpdates.length > 0) {
        return NextResponse.json(
          {
            error: `${notFoundUpdates.length} kullanıcı güncellenirken bulunamadı.`,
          },
          { status: 404 }
        );
      }

      updatedCount = updateResults.length;
      console.log(`${updatedCount} kullanıcı güncellendi.`);
    }

    // Kullanıcıları sil (eğer varsa)
    if (
      usersToDelete &&
      Array.isArray(usersToDelete) &&
      usersToDelete.length > 0
    ) {
      // ID formatlarını kontrol et
      for (const userId of usersToDelete) {
        if (!userId || !userId.match(/^[0-9a-fA-F]{24}$/)) {
          return NextResponse.json(
            { error: "Geçersiz kullanıcı ID formatı." },
            { status: 400 }
          );
        }
      }

      // Silinecek kullanıcıları kontrol et (kendi kendini silme ve superadmin kontrolü)
      const usersToDeleteData = await UserModel.find({
        _id: { $in: usersToDelete },
      }).lean();

      for (const userToDelete of usersToDeleteData) {
        // Kendi kendini silme kontrolü
        if (user._id.toString() === userToDelete._id.toString()) {
          return NextResponse.json(
            { error: "Kendi hesabınızı silemezsiniz." },
            { status: 400 }
          );
        }

        // Superadmin kontrolü - Superadmin sadece superadmin tarafından silinebilir
        if (userToDelete.role === "superadmin" && user.role !== "superadmin") {
          return NextResponse.json(
            {
              error:
                "Superadmin kullanıcıları sadece superadmin tarafından silinebilir.",
            },
            { status: 403 }
          );
        }
      }

      // Toplu silme işlemi
      const deleteResult = await UserModel.deleteMany({
        _id: { $in: usersToDelete },
      });

      deletedCount = deleteResult.deletedCount;
      console.log(`${deletedCount} kullanıcı silindi.`);

      // Silinemeyen kullanıcı varsa uyar
      if (deletedCount !== usersToDelete.length) {
        const notDeletedCount = usersToDelete.length - deletedCount;
        console.warn(
          `${notDeletedCount} kullanıcı silinemedi (bulunamadı veya başka bir sorun).`
        );
      }
    }

    // Eğer hiçbir işlem yapılmadıysa
    if (updatedCount === 0 && deletedCount === 0) {
      return NextResponse.json(
        { error: "Herhangi bir işlem yapılmadı." },
        { status: 400 }
      );
    }

    revalidatePath("/dashboard/users");
    revalidatePath("/");

    return NextResponse.json(
      {
        message: "İşlemler başarıyla tamamlandı.",
        updatedCount,
        deletedCount,
        totalProcessed: updatedCount + deletedCount,
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("POST /api/users error:", err);

    // MongoDB duplicate key error
    if (err.code === 11000) {
      return NextResponse.json(
        { error: "Bu e-posta adresi zaten kullanılıyor." },
        { status: 409 }
      );
    }

    // Validation error
    if (err.name === "ValidationError") {
      const messages = Object.values(err.errors).map((e) => e.message);
      return NextResponse.json(
        { error: `Validation hatası: ${messages.join(", ")}` },
        { status: 400 }
      );
    }

    // CastError - Geçersiz ObjectId
    if (err.name === "CastError") {
      return NextResponse.json(
        { error: "Geçersiz kullanıcı ID formatı." },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Sunucu hatası oluştu." },
      { status: 500 }
    );
  }
};
