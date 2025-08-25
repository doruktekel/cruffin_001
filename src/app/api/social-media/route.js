import { SocialModel } from "@/lib/models/socialModel";
import connectMongo from "@/lib/mongoDb";
import protectRoute from "@/lib/protectRoute";
import { NextResponse } from "next/server";

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
    const { linksToSend } = await req.json();

    if (!Array.isArray(linksToSend)) {
      return NextResponse.json(
        { error: "Sosyal medya linkleri bulunamadı" },
        { status: 400 }
      );
    }

    // 🔴 BOŞ URL VAR MI KONTROL
    const emptyLinks = linksToSend.filter(
      (item) => !item.url || item.url.trim() === ""
    );
    if (emptyLinks.length > 0) {
      return NextResponse.json(
        {
          error:
            "Tüm sosyal medya platformları için geçerli link girilmelidir.",
        },
        { status: 400 }
      );
    }

    await SocialModel.deleteMany({});
    const newSocialMedia = await SocialModel.insertMany(linksToSend);

    revalidatePath("/dashboard/social");
    revalidatePath("/");

    return NextResponse.json({ newSocialMedia }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error.message || "Sosyal medya eklenemedi" },
      { status: 500 }
    );
  }
};

export const GET = async () => {
  await connectMongo();
  try {
    const socialMedia = await SocialModel.find({}).sort({ order: 1 }).lean();

    return NextResponse.json({ socialMedia }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: error.message || "Sosyal medyalar getirilemedi" },
      { status: 500 }
    );
  }
};
