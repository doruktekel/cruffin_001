"use client";

import { useState } from "react";
import { toast } from "react-toastify";

const useSubmitGallery = () => {
  const [loading, setLoading] = useState(false);

  // ✅ DÜZELT: Images alanını doğru şekilde kontrol eden helper function
  const getImageFromItem = (item) => {
    // Önce pendingImage kontrol et
    if (
      item.pendingImage?.base64 &&
      typeof item.pendingImage.base64 === "string" &&
      item.pendingImage.base64.trim() !== ""
    ) {
      return item.pendingImage.base64;
    }

    // Sonra originalImage kontrol et
    if (
      item.originalImage &&
      typeof item.originalImage === "string" &&
      item.originalImage.trim() !== ""
    ) {
      return item.originalImage;
    }

    // Son olarak image field'ını kontrol et
    if (item.image) {
      // Array ise ilk elemanını al
      if (Array.isArray(item.image) && item.image.length > 0) {
        const firstImage = item.image[0];
        return typeof firstImage === "string" && firstImage.trim() !== ""
          ? firstImage
          : null;
      }

      // String ise direkt kontrol et
      if (typeof item.image === "string" && item.image.trim() !== "") {
        return item.image;
      }
    }

    return null;
  };

  const submitGallery = async (galleryItems) => {
    try {
      setLoading(true);

      // ✅ DÜZELT: Yeni helper function kullan
      const cleanedItems = galleryItems
        .filter((item) => {
          const hasValidImage = getImageFromItem(item) !== null;
          return hasValidImage;
        })
        .map((item) => ({
          _id: item._id && !item._id.startsWith("temp-") ? item._id : undefined,
          images: getImageFromItem(item),
          originalImage: item.originalImage,
          pendingImage: item.pendingImage?.base64,
          order: item.order,
          isActive: item.isActive ?? false,
        }));

      const res = await fetch("/api/gallery", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(cleanedItems),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Kayıt başarısız oldu.");
      }

      return data.items;
    } catch (err) {
      console.error("submitGallery error:", err.message);
      toast.error(err.message || "Bir hata oluştu.");
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { loading, submitGallery };
};

export default useSubmitGallery;
