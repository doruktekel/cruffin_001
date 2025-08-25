import mongoose from "mongoose";
import connectMongo from "@/lib/mongoDb";
import { NextResponse } from "next/server";
import protectRoute from "@/lib/protectRoute";
import { GalleryModel } from "@/lib/models/galleryModel";
import extractPublicId from "@/utils/extractPublicId";

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

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
    const body = await req.json();

    // ✅ DEBUG: Gelen veriyi logla
    console.log("Backend'e gelen veri:", JSON.stringify(body, null, 2));

    if (!Array.isArray(body)) {
      return NextResponse.json(
        { error: "Geçersiz veri formatı." },
        { status: 400 }
      );
    }
    // `isActive` true olan öğeleri filtrele
    const activeImages = body.filter((item) => item.isActive === true);

    if (activeImages.length < 5) {
      return NextResponse.json(
        { error: "En az 5 aktif görsel eklenmesi gerekmektedir." },
        { status: 400 }
      );
    }

    if (body.length > 10) {
      return NextResponse.json(
        { error: "En fazla 10 görsel olabilir." },
        { status: 400 }
      );
    }

    const results = [];

    for (let i = 0; i < body.length; i++) {
      const item = body[i];
      if (!item) continue;

      let imageUrl = "";

      // Yeni görsel varsa (base64 format) image upload API'ye gönder
      if (item.pendingImage && item.pendingImage.startsWith("data:")) {
        try {
          const uploadResponse = await fetch(
            `${
              process.env.NEXTAUTH_URL || "http://localhost:3000"
            }/api/upload-image`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ image: item.pendingImage }),
            }
          );

          if (!uploadResponse.ok) {
            const uploadError = await uploadResponse.json();
            throw new Error(uploadError.error || "Upload failed");
          }

          const uploadResult = await uploadResponse.json();
          imageUrl = uploadResult.url;
        } catch (uploadError) {
          console.error(`Görsel ${i} yükleme hatası:`, uploadError);
          return NextResponse.json(
            {
              error: `Görsel ${i + 1} yüklenirken hata oluştu. ${
                uploadError.message
              }`,
            },
            { status: 500 }
          );
        }
      }
      // Mevcut görsel varsa onu kullan
      else if (item.originalImage || item.image || item.images) {
        // ✅ DÜZELT: Gelen veri hangi field'da olursa olsun al
        imageUrl = item.images || item.originalImage || item.image;

        // ✅ EKSTRA KONTROL: Eğer array geliyorsa ilk elemanı al
        if (Array.isArray(imageUrl)) {
          imageUrl = imageUrl[0] || "";
          console.warn(
            "Array olarak gelen görsel URL'si düzeltildi:",
            imageUrl
          );
        }
      }

      // Görsel yoksa bu item'ı atla
      if (!imageUrl || !imageUrl.trim()) continue;

      const order = typeof item.order === "number" ? item.order : i;
      const isActive = Boolean(item.isActive);

      // ✅ DEBUG: Kaydedilecek veriyi logla
      console.log(`Item ${i} kaydedilecek veri:`, {
        _id: item._id,
        images: imageUrl.trim(),
        order,
        isActive,
      });

      try {
        if (item._id && isValidObjectId(item._id)) {
          const existingDoc = await GalleryModel.findById(item._id);

          // Yeni görsel yüklendiyse ve eskisi varsa, sil
          if (
            existingDoc &&
            item.pendingImage &&
            existingDoc.images !== imageUrl &&
            existingDoc.images
          ) {
            try {
              const oldPublicId = extractPublicId(existingDoc.images);
              if (oldPublicId) {
                await fetch(
                  `${
                    process.env.NEXTAUTH_URL || "http://localhost:3000"
                  }/api/delete-image`,
                  {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ public_id: oldPublicId }),
                  }
                );
              }
            } catch (deleteError) {
              console.warn(
                `Eski görsel silinemedi (item ${i}):`,
                deleteError.message
              );
            }
          }

          // Veritabanında güncelle
          const updated = await GalleryModel.findByIdAndUpdate(
            item._id,
            {
              images: String(imageUrl.trim()), // ✅ ZORUNLU STRING DÖNÜŞÜMÜ
              order,
              isActive,
            },
            { new: true, upsert: false }
          );

          if (updated) {
            console.log("Güncellenen kayıt:", updated); // ✅ DEBUG
            results.push(updated);
          }
        } else {
          // ID yoksa veya geçersizse yeni oluştur
          const created = await new GalleryModel({
            images: String(imageUrl.trim()), // ✅ ZORUNLU STRING DÖNÜŞÜMÜ
            order,
            isActive,
          }).save();

          console.log("Oluşturulan kayıt:", created); // ✅ DEBUG
          results.push(created);
        }
      } catch (dbError) {
        console.error(`Database işlem hatası (item ${i}):`, dbError);

        // MongoDB ID hatası varsa yeni kayıt oluştur
        if (dbError.name === "CastError") {
          try {
            const created = await new GalleryModel({
              images: String(imageUrl.trim()), // ✅ ZORUNLU STRING DÖNÜŞÜMÜ
              order,
              isActive,
            }).save();

            results.push(created);
          } catch (createError) {
            console.error(`Yeni kayıt oluşturma hatası:`, createError);
            continue;
          }
        } else {
          continue;
        }
      }
    }

    results.sort((a, b) => a.order - b.order);

    revalidatePath("/dashboard/gallery");
    revalidatePath("/");

    return NextResponse.json(
      {
        message: "Görseller başarıyla kaydedildi/güncellendi.",
        items: results,
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("Gallery POST error:", err);
    return NextResponse.json(
      { error: "İşlem sırasında bir hata oluştu." },
      { status: 500 }
    );
  }
};
