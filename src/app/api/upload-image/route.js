import { NextResponse } from "next/server";
import cloudinary from "@/lib/cloudinary";

export async function POST(req) {
  try {
    const { image } = await req.json();
    if (!image) {
      return NextResponse.json({ error: "Görsel gerekli." }, { status: 400 });
    }

    const timestamp = Date.now();
    const publicId = `${timestamp}`;

    const result = await cloudinary.uploader.upload(image, {
      folder: "cruffin",
      public_id: publicId,
      format: "webp",
      transformation: [{ quality: "auto" }],
    });

    return NextResponse.json({ url: result.secure_url }, { status: 200 });
  } catch (error) {
    console.error("Cloudinary upload hatası:", error);
    return NextResponse.json(
      { error: "Görsel 10mb'dan büyük olamaz" },
      { status: 500 }
    );
  }
}
