// import { ProductModel } from "@/lib/models/productModel";
// import connectMongo from "@/lib/mongoDb";
// import protectRoute from "@/lib/protectRoute";
// import { NextResponse } from "next/server";
// import mongoose from "mongoose";
// import { CategoryModel } from "@/lib/models/categoryModel";

// export const POST = async (req) => {
//   await connectMongo();

//   const { user, error, status } = await protectRoute(req);
//   if (error) {
//     return NextResponse.json({ error: error.message }, { status });
//   }

//   const isAdmin = user.role === "admin" || user.role === "superadmin";
//   const isApprovedUser = user.role === "user" && user.isApproved;

//   if (!(isAdmin || isApprovedUser)) {
//     return NextResponse.json(
//       {
//         error:
//           "Bu işlem için gerekli yetkiniz yok veya hesabınız onaylanmamış.",
//       },
//       { status: 403 }
//     );
//   }

//   try {
//     const { categoriesToSend } = await req.json();

//     if (!Array.isArray(categoriesToSend)) {
//       return NextResponse.json(
//         { error: "Kategori verileri bulunamadı !" },
//         { status: 400 }
//       );
//     }

//     const hasEmptyName = categoriesToSend.some(
//       (cat) => !cat.name || cat.name.trim() === ""
//     );

//     if (hasEmptyName) {
//       return NextResponse.json(
//         { error: "Kategori adı alanı boş bırakılamaz !" },
//         { status: 400 }
//       );
//     }

//     // 1. Geçerli (boş olmayan) kategorileri filtrele
//     const validCategories = categoriesToSend.filter(
//       (cat) => cat.name && cat.name.trim() !== ""
//     );

//     // 3. Duplicate name kontrolü
//     const seen = new Set();
//     const duplicates = validCategories.filter((cat) => {
//       const name = cat.name.trim().toLowerCase();
//       if (seen.has(name)) return true;
//       seen.add(name);
//       return false;
//     });

//     if (duplicates.length > 0) {
//       return NextResponse.json(
//         { error: "Aynı isimli birden fazla kategori eklenemez !" },
//         { status: 400 }
//       );
//     }

//     // 2. Mevcut geçerli ID'leri al
//     const categoryIds = validCategories
//       .map((category) =>
//         category._id && mongoose.Types.ObjectId.isValid(category._id)
//           ? category._id.toString()
//           : null
//       )
//       .filter(Boolean); // sadece geçerli ObjectId olanlar kalır

//     // 3. Güncelleme veya yeni kategori oluşturma
//     const updatedCategories = [];
//     for (const category of validCategories) {
//       if (category._id && mongoose.Types.ObjectId.isValid(category._id)) {
//         const updatedCategory = await CategoryModel.findByIdAndUpdate(
//           category._id,
//           {
//             name: category.name,
//             order: category.order,
//           },
//           { new: true }
//         );
//         if (updatedCategory) updatedCategories.push(updatedCategory);
//       } else {
//         // Yeni kategori ekleniyor
//         const newCategory = new CategoryModel({
//           name: category.name,
//           order: category.order,
//         });
//         await newCategory.save();
//         updatedCategories.push(newCategory);
//       }
//     }

//     // 4. Silinecek kategorileri bul
//     const categoriesInDb = await CategoryModel.find({});
//     const updatedIds = updatedCategories.map((cat) => cat._id.toString());
//     const toDelete = categoriesInDb.filter(
//       (cat) => !updatedIds.includes(cat._id.toString())
//     );

//     // 5. Silme işlemleri
//     for (const category of toDelete) {
//       await ProductModel.updateMany(
//         { category: category._id },
//         { $set: { category: null } }
//       );
//       await CategoryModel.findByIdAndDelete(category._id);
//     }

//     return NextResponse.json(
//       {
//         message: "Kategoriler başarıyla güncellendi.",
//         categories: updatedCategories, // ← yeni kategori listesini de döndür
//       },
//       { status: 200 }
//     );
//   } catch (error) {
//     console.error("POST /api/category error:", error); // log ekle
//     return NextResponse.json(
//       { error: error.message || "Kategoriler güncellenemedi !" },
//       { status: 500 }
//     );
//   }
// };

// export const GET = async () => {
//   await connectMongo();
//   try {
//     const categories = await CategoryModel.find({});
//     return NextResponse.json({ categories }, { status: 200 });
//   } catch (error) {
//     return NextResponse.json(
//       { error: error.message || "Kategoriler getirilemedi" },
//       { status: 500 }
//     );
//   }
// };

import { ProductModel } from "@/lib/models/productModel";
import connectMongo from "@/lib/mongoDb";
import protectRoute from "@/lib/protectRoute";
import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { CategoryModel } from "@/lib/models/categoryModel";
import { revalidatePath } from "next/cache"; // ✅ EKLE

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
    const { categoriesToSend } = await req.json();

    if (!Array.isArray(categoriesToSend)) {
      return NextResponse.json(
        { error: "Kategori verileri bulunamadı !" },
        { status: 400 }
      );
    }

    const hasEmptyName = categoriesToSend.some(
      (cat) => !cat.name || cat.name.trim() === ""
    );

    if (hasEmptyName) {
      return NextResponse.json(
        { error: "Kategori adı alanı boş bırakılamaz !" },
        { status: 400 }
      );
    }

    // 1. Geçerli (boş olmayan) kategorileri filtrele
    const validCategories = categoriesToSend.filter(
      (cat) => cat.name && cat.name.trim() !== ""
    );

    // 3. Duplicate name kontrolü
    const seen = new Set();
    const duplicates = validCategories.filter((cat) => {
      const name = cat.name.trim().toLowerCase();
      if (seen.has(name)) return true;
      seen.add(name);
      return false;
    });

    if (duplicates.length > 0) {
      return NextResponse.json(
        { error: "Aynı isimli birden fazla kategori eklenemez !" },
        { status: 400 }
      );
    }

    // 2. Mevcut geçerli ID'leri al
    const categoryIds = validCategories
      .map((category) =>
        category._id && mongoose.Types.ObjectId.isValid(category._id)
          ? category._id.toString()
          : null
      )
      .filter(Boolean); // sadece geçerli ObjectId olanlar kalır

    // 3. Güncelleme veya yeni kategori oluşturma
    const updatedCategories = [];
    for (const category of validCategories) {
      if (category._id && mongoose.Types.ObjectId.isValid(category._id)) {
        const updatedCategory = await CategoryModel.findByIdAndUpdate(
          category._id,
          {
            name: category.name,
            order: category.order,
          },
          { new: true }
        );
        if (updatedCategory) updatedCategories.push(updatedCategory);
      } else {
        // Yeni kategori ekleniyor
        const newCategory = new CategoryModel({
          name: category.name,
          order: category.order,
        });
        await newCategory.save();
        updatedCategories.push(newCategory);
      }
    }

    // 4. Silinecek kategorileri bul
    const categoriesInDb = await CategoryModel.find({});
    const updatedIds = updatedCategories.map((cat) => cat._id.toString());
    const toDelete = categoriesInDb.filter(
      (cat) => !updatedIds.includes(cat._id.toString())
    );

    // 5. Silme işlemleri
    for (const category of toDelete) {
      await ProductModel.updateMany(
        { category: category._id },
        { $set: { category: null } }
      );
      await CategoryModel.findByIdAndDelete(category._id);
    }

    // ✅ TÜM İLGİLİ SAYFALARI REVALİDATE ET
    revalidatePath("/dashboard/categories");
    revalidatePath("/");

    return NextResponse.json(
      {
        message: "Kategoriler başarıyla güncellendi.",
        categories: updatedCategories, // ← yeni kategori listesini de döndür
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("POST /api/category error:", error); // log ekle
    return NextResponse.json(
      { error: error.message || "Kategoriler güncellenemedi !" },
      { status: 500 }
    );
  }
};

export const GET = async () => {
  await connectMongo();
  try {
    const categories = await CategoryModel.find({});
    return NextResponse.json({ categories }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: error.message || "Kategoriler getirilemedi" },
      { status: 500 }
    );
  }
};
