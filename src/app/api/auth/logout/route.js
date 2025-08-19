import { NextResponse } from "next/server";

export const POST = async (req) => {
  try {
    // Response oluştur
    const response = NextResponse.json({ msg: "Çıkış başarılı" });

    // Cookie'yi sil - geçmişe tarih atayarak expire et
    response.cookies.set("token", "", {
      expires: new Date(0),
      path: "/",
      httpOnly: true,
      sameSite: "lax",
    });

    // Alternatif yöntem - cookie'yi delete et
    response.cookies.delete("token");

    console.log("Token cookie silindi");

    return response;
  } catch (error) {
    console.error("Logout error:", error);

    const response = NextResponse.json(
      { error: "Çıkış işlemi sırasında bir hata oluştu: " + error },
      { status: 500 }
    );

    // Hata durumunda bile cookie'yi sil
    response.cookies.set("token", "", {
      expires: new Date(0),
      path: "/",
      httpOnly: true,
      sameSite: "lax",
    });

    return response;
  }
};
