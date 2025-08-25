import { ProductModel } from "@/lib/models/productModel";
import connectMongo from "@/lib/mongoDb";
import protectRoute from "@/lib/protectRoute";
import { NextResponse } from "next/server";
import mongoose from "mongoose";
import extractPublicId from "@/utils/extractPublicId";
import cloudinary from "@/lib/cloudinary";
import { revalidatePath } from "next/cache";

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
    const { productsToSend } = await req.json();

    if (!Array.isArray(productsToSend)) {
      return NextResponse.json(
        { error: "Ürün verileri bulunamadı" },
        { status: 400 }
      );
    }

    // Silinmek üzere işaretlenmemiş ürünleri filtrele
    const activeProducts = productsToSend.filter((p) => !p.markedForDeletion);

    const hasInvalidProduct = activeProducts.some((p) => {
      const nameMissing = !p.name || p.name.trim() === "";
      const priceMissing =
        p.price === undefined || p.price === null || p.price < 0;
      const imageMissing =
        !p.image &&
        !p.originalImage &&
        !(p.pendingImage && p.pendingImage.base64);

      return nameMissing || priceMissing || imageMissing;
    });

    if (hasInvalidProduct) {
      return NextResponse.json(
        {
          error: `Ürünlerde eksik alanlar var. İsim, fiyat ve görsel zorunludur !`,
        },
        { status: 400 }
      );
    }

    // 2. Güncelleme veya yeni ürün oluşturma (sadece aktif ürünler için)
    const updatedProducts = [];

    for (const product of activeProducts) {
      try {
        // Veri tiplerini düzelt
        const productData = {
          name: product.name.trim(),
          category: product.category,
          order: Number(product.order) || 0,
          price: Number(product.price) || 0,
          description: product.description || "",
          ingredients: Array.isArray(product.ingredients)
            ? product.ingredients
            : [],
          calories: Number(product.calories) || 0,
          isVegan: Boolean(product.isVegan),
          isVegetarian: Boolean(product.isVegetarian),
          isGlutenFree: Boolean(product.isGlutenFree),
          isSpicy: Boolean(product.isSpicy),
          allergens: Array.isArray(product.allergens) ? product.allergens : [],
          isAvailable:
            product.isAvailable !== undefined
              ? Boolean(product.isAvailable)
              : true,
          image: product.image || "",
        };

        console.log("Processing product data:", productData);

        // Check if this is an existing product (has _id and no tempId)
        if (
          product._id &&
          !product.tempId &&
          mongoose.Types.ObjectId.isValid(product._id)
        ) {
          // UPDATE existing product
          const existingProduct = await ProductModel.findById(product._id);

          if (!existingProduct) continue;

          // Eğer görsel değiştiyse eski görseli sil
          if (existingProduct.image !== product.image) {
            const oldPublicId = extractPublicId(existingProduct.image);
            if (oldPublicId) {
              try {
                const result = await cloudinary.uploader.destroy(oldPublicId);
                console.log("Eski görsel Cloudinary'den silindi:", result);
              } catch (err) {
                console.error("Eski görsel silme hatası:", err);
              }
            }
          }

          const updatedProduct = await ProductModel.findByIdAndUpdate(
            product._id,
            productData,
            { new: true, runValidators: true }
          );

          if (updatedProduct) {
            updatedProducts.push(updatedProduct);
            console.log("Successfully updated product:", updatedProduct._id);
          }
        } else if (product.tempId) {
          // CREATE new product (has tempId)
          console.log("Creating new product with tempId:", product.tempId);

          const newProduct = new ProductModel(productData);
          const savedProduct = await newProduct.save();

          if (savedProduct) {
            updatedProducts.push(savedProduct);
            console.log("Successfully created product:", savedProduct._id);
          }
        }
      } catch (productError) {
        console.error(
          "Error processing individual product:",
          product,
          productError
        );
        // Tek bir ürün hatası tüm işlemi durdurmayalım, devam edelim
        continue;
      }
    }

    console.log("Total processed products:", updatedProducts.length);

    // 3. Aynı kategoride olup, güncellenmemiş ürünleri sil
    // Bu kısımda silinmek üzere işaretlenen ürünler de dahil edilecek
    if (productsToSend.length > 0) {
      try {
        const categoryId = productsToSend[0].category;
        console.log("Cleaning up category:", categoryId);

        const productsInDb = await ProductModel.find({ category: categoryId });
        const updatedIds = updatedProducts.map((p) => p._id.toString());

        // Silinecek ürünleri belirle:
        // 1. Veritabanında olup güncellenmeyen ürünler
        // 2. Silinmek üzere işaretlenen mevcut ürünler
        const markedForDeletionIds = productsToSend
          .filter((p) => p.markedForDeletion && p._id)
          .map((p) => p._id.toString());

        const toDelete = productsInDb.filter(
          (p) =>
            !updatedIds.includes(p._id.toString()) ||
            markedForDeletionIds.includes(p._id.toString())
        );

        console.log("Products to delete:", toDelete.length);
        console.log("Marked for deletion IDs:", markedForDeletionIds);

        for (const product of toDelete) {
          // Cloudinary'den görseli sil
          const publicId = extractPublicId(product.image);
          if (publicId) {
            try {
              const result = await cloudinary.uploader.destroy(publicId);
              console.log("Cloudinary'den silindi:", result);
            } catch (err) {
              console.error("Cloudinary silme hatası:", err);
            }
          }

          // Veritabanından sil
          await ProductModel.findByIdAndDelete(product._id);
          console.log("Deleted product:", product._id);
        }
      } catch (cleanupError) {
        console.error("Error during cleanup:", cleanupError);
        // Cleanup hatası tüm işlemi durdurmayalım
      }
    }

    const responseProducts = updatedProducts.map((product) => ({
      _id: product._id,
      category: product.category,
      name: product.name,
      price: product.price,
      description: product.description,
      ingredients: product.ingredients,
      calories: product.calories,
      isVegan: product.isVegan,
      isVegetarian: product.isVegetarian,
      isGlutenFree: product.isGlutenFree,
      isSpicy: product.isSpicy,
      allergens: product.allergens,
      isAvailable: product.isAvailable,
      order: product.order,
      image: product.image,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
      __v: product.__v,
    }));

    revalidatePath("/dashboard/products");
    revalidatePath("/");

    return NextResponse.json(
      {
        message: "Ürünler başarıyla güncellendi.",
        products: responseProducts,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("POST /api/products error:", error);
    return NextResponse.json(
      { error: error.message || "Ürün güncellenemedi" },
      { status: 500 }
    );
  }
};
