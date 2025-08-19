import mongoose from "mongoose";
import connectMongo from "@/lib/mongoDb";
import { NextResponse } from "next/server";
import protectRoute from "@/lib/protectRoute";
import { InfoModel } from "@/lib/models/infoModel";

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

    const infosToSend = body.infosToSend;

    if (!Array.isArray(infosToSend)) {
      return NextResponse.json(
        { error: "Gönderilen veriler geçerli değil." },
        { status: 400 }
      );
    }

    const isAllInfosValid = infosToSend.every(
      (info) =>
        info.title?.toString().trim().length > 0 &&
        info.description?.toString().trim().length > 0 &&
        info.image?.toString().trim().length > 0
    );

    if (!isAllInfosValid) {
      return NextResponse.json(
        {
          error:
            "Tüm bilgilerde başlık, açıklama ve görsel alanları zorunludur.",
        },
        { status: 400 }
      );
    }

    const processedInfos = [];

    for (const info of infosToSend) {
      try {
        const infoData = {
          title: info.title.trim(),
          description: info.description.trim(),
          image: info.image.trim(),
          isActive: typeof info.isActive === "boolean" ? info.isActive : true,
        };

        if (
          info._id &&
          !info.tempId &&
          mongoose.Types.ObjectId.isValid(info._id)
        ) {
          const updated = await InfoModel.findByIdAndUpdate(
            info._id,
            infoData,
            { new: true, runValidators: true }
          );

          if (updated) processedInfos.push(updated);
        } else if (info.tempId) {
          const newInfo = new InfoModel(infoData);
          const savedInfo = await newInfo.save();
          if (savedInfo) processedInfos.push(savedInfo);
        }
      } catch (err) {
        console.error("Tekil info işlenemedi:", err);
        continue;
      }
    }

    return NextResponse.json(
      {
        message: "Info verileri başarıyla işlendi.",
        infos: processedInfos,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("POST /api/info error:", error);
    return NextResponse.json(
      { error: error.message || "Info gönderimi başarısız" },
      { status: 500 }
    );
  }
};
