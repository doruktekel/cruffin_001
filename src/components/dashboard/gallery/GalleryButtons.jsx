"use client";

import { useState, useEffect } from "react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import DraggableGalleryRow from "./DraggableGalleryRow";
import { Button } from "@/components/ui/button";
import { Save } from "lucide-react";
import useSubmitGallery from "@/hooks/useSubmitGallery";
import { toast } from "react-toastify";

const GalleryButtons = ({ newGalleries }) => {
  const [galleries, setGalleries] = useState(newGalleries || []);
  const [uploadingStates, setUploadingStates] = useState([]);
  const [lastSubmitTime, setLastSubmitTime] = useState(0);

  const { submitGallery, loading } = useSubmitGallery();
  const sensors = useSensors(useSensor(PointerSensor));

  // ✅ DÜZELT: Images alanını doğru şekilde kontrol eden helper function
  const getImageFromGallery = (existing) => {
    if (!existing?.images) return null;

    // Array ise ilk elemanını al
    if (Array.isArray(existing.images) && existing.images.length > 0) {
      const firstImage = existing.images[0];
      return typeof firstImage === "string" && firstImage.trim() !== ""
        ? firstImage
        : null;
    }

    // String ise direkt kontrol et
    if (typeof existing.images === "string" && existing.images.trim() !== "") {
      return existing.images;
    }

    return null;
  };

  useEffect(() => {
    const filled = new Array(10).fill(null).map((_, index) => {
      const existing = newGalleries?.[index];
      const imageUrl = getImageFromGallery(existing);

      return {
        _id: existing?._id || `temp-${index}`,
        originalImage: imageUrl,
        pendingImage: null,
        image: imageUrl,
        title: existing?.title || "",
        description: existing?.description || "",
        isActive: existing?.isActive ?? false,
      };
    });
    setGalleries(filled);
    setUploadingStates(new Array(10).fill(false));
  }, [newGalleries]);

  const handleImageSelect = (index, file) => {
    if (!file) return;

    // Dosya türü kontrolü
    if (!file.type.startsWith("image/")) {
      toast.error("Sadece resim dosyaları yüklenebilir.");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setGalleries((prev) =>
        prev.map((item, i) =>
          i === index
            ? {
                ...item,
                pendingImage: {
                  file: file,
                  base64: reader.result,
                },
                image: reader.result,
              }
            : item
        )
      );
    };
    reader.readAsDataURL(file);
  };

  // ✅ DÜZELT: Güvenli string kontrolü ekle
  const getDisplayImage = (item) => {
    // Önce pending image'ı kontrol et
    if (
      item.pendingImage?.base64 &&
      typeof item.pendingImage.base64 === "string" &&
      item.pendingImage.base64.trim() !== ""
    ) {
      return item.pendingImage.base64;
    }
    // Sonra original image'ı kontrol et
    if (
      item.originalImage &&
      typeof item.originalImage === "string" &&
      item.originalImage.trim() !== ""
    ) {
      return item.originalImage;
    }
    // Son olarak image field'ını kontrol et
    if (
      item.image &&
      typeof item.image === "string" &&
      item.image.trim() !== ""
    ) {
      return item.image;
    }
    return null; // ✅ Next.js Image için null döndür
  };

  const hasImageChanged = (item) =>
    item.pendingImage?.base64 &&
    item.pendingImage.base64 !== item.originalImage;

  const handleChange = (index, field, value) => {
    setGalleries((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item))
    );
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = galleries.findIndex((item) => item._id === active.id);
    const newIndex = galleries.findIndex((item) => item._id === over.id);
    const newOrder = arrayMove(galleries, oldIndex, newIndex);

    setGalleries(newOrder);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // 2 saniye içinde tekrar submit'i engelle
    const now = Date.now();
    if (now - lastSubmitTime < 2000) {
      return;
    }
    setLastSubmitTime(now);

    // ✅ Client-side: Aktif görsellerin sayısını kontrol et
    const activeImages = galleries.filter((item) => item.isActive === true);
    if (activeImages.length < 5) {
      toast.error("En az 5 aktif görsel seçmelisiniz.");
      return;
    }

    // ✅ DÜZELT: getDisplayImage kullan
    const hasActiveImages = galleries.some(
      (item) => getDisplayImage(item) !== null
    );

    if (!hasActiveImages) {
      toast.error("En az bir aktif görsel seçmelisiniz.");
      return;
    }

    const formatted = galleries.map((gallery, index) => ({
      ...gallery,
      order: index,
    }));

    const result = await submitGallery(formatted);
    if (result) {
      toast.success("Görseller başarıyla kaydedildi.");

      setGalleries((prevGalleries) => {
        const newGalleries = [...prevGalleries];

        result.forEach((savedItem) => {
          const targetIndex = savedItem.order;

          if (newGalleries[targetIndex]) {
            // console.log(`Index ${targetIndex} güncelleniyor:`, {
            //   eskiImage: newGalleries[targetIndex].image,
            //   yeniImage: savedItem.images,
            // });

            // ✅ DÜZELT: Dönen veriyi de doğru şekilde işle
            const savedImageUrl = getImageFromGallery(savedItem);

            newGalleries[targetIndex] = {
              ...newGalleries[targetIndex],
              _id: savedItem._id?.toString() || `temp-${targetIndex}`,
              originalImage: savedImageUrl,
              pendingImage: null,
              image: savedImageUrl,
              isActive:
                savedItem.isActive ?? newGalleries[targetIndex].isActive,
              title: savedItem.title || newGalleries[targetIndex].title,
              description:
                savedItem.description || newGalleries[targetIndex].description,
            };
          }
        });

        return newGalleries;
      });
    }
  };

  return (
    <div className="flex flex-col gap-4 overflow-hidden mb-4">
      <div className="flex justify-center items-center">
        <p className="text-lg font-semibold">Galeri</p>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={galleries
            .filter((g) => g && g._id && !g._id.startsWith("temp-"))
            .map((g) => g._id)}
          strategy={verticalListSortingStrategy}
        >
          {galleries.map((item, index) => (
            <DraggableGalleryRow
              key={item._id}
              id={item._id}
              index={index}
              item={item}
              uploading={uploadingStates[index]}
              handleImageSelect={handleImageSelect}
              getDisplayImage={getDisplayImage}
              handleChange={handleChange}
              hasImageChanged={hasImageChanged}
            />
          ))}
        </SortableContext>
      </DndContext>

      <div className="mt-4 flex justify-center">
        <Button
          onClick={handleSubmit}
          size="lg"
          className="cursor-pointer"
          disabled={loading}
        >
          <Save size={20} className="mr-2" />
          {loading ? "Kaydediliyor..." : "Değişiklikleri Kaydet"}
        </Button>
      </div>
    </div>
  );
};

export default GalleryButtons;
