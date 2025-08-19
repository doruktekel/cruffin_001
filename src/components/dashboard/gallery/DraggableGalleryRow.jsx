"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import Image from "next/image";
import { Grip, ImagePlus, Loader2, CheckCircle, XCircle } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

const DraggableGalleryRow = ({
  id,
  index,
  item,
  uploading,
  handleImageSelect,
  getDisplayImage,
  handleChange,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    maxWidth: "100%",
    overflow: "visible",
    zIndex: isDragging ? 999 : 1,
    // opacity: isDragging ? 0.5 : 1,
  };

  const displayImage = getDisplayImage(item);

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex flex-col gap-1 p-3 bg-gray-100 dark:bg-gray-900 rounded-lg"
    >
      <div className="flex items-center gap-4">
        <div
          className="cursor-grab active:cursor-grabbing"
          {...attributes}
          {...listeners}
        >
          <Grip size={20} />
        </div>

        <div className="w-32 h-32 relative rounded border bg-white dark:bg-gray-800 group overflow-hidden shrink-0">
          {/* ✅ DÜZELT: displayImage null kontrolü */}
          {displayImage ? (
            <div className="relative w-full h-full">
              <Image
                src={displayImage}
                alt="preview"
                width={128}
                height={128}
                className={`object-cover transition-opacity ${
                  uploading ? "opacity-50 grayscale" : ""
                }`}
                // ✅ EKLE: Error handling
                onError={(e) => {
                  console.error("Image load error:", displayImage);
                  e.target.style.display = "none";
                }}
              />
              {/* Hover / Loading Overlay */}
              <div
                className={`absolute inset-0 bg-black/40 text-white flex flex-col items-center justify-center text-xs transition-opacity ${
                  uploading
                    ? "opacity-100"
                    : "opacity-0 group-hover:opacity-100"
                }`}
              >
                {uploading ? (
                  <div className="flex flex-col items-center">
                    <Loader2 className="animate-spin w-6 h-6 mb-1" />
                    <span>Yükleniyor...</span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-1">
                    <ImagePlus className="w-5 h-5 mb-1" />
                    <span>Görseli Değiştir</span>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-400 group-hover:opacity-70">
              <p className="text-sm">Görsel Yükle</p>
            </div>
          )}

          {/* File Input */}
          <input
            type="file"
            accept="image/*"
            onChange={(e) => handleImageSelect(index, e.target.files?.[0])}
            className="absolute inset-0 opacity-0 cursor-pointer"
            disabled={uploading}
          />
        </div>
      </div>

      {/* Aktif / Pasif toggle */}
      <div className="flex items-center gap-4 mt-2 px-1 self-end">
        <Switch
          id={`isActive-${item.tempId || item._id || index}`}
          checked={item.isActive ?? false}
          onCheckedChange={(val) => handleChange(index, "isActive", val)}
          className="scale-110 cursor-pointer"
        />
        <Label
          htmlFor={`isActive-${item.tempId || item._id || index}`}
          className="flex items-center gap-2 select-none"
        >
          {item.isActive ? (
            <>
              <CheckCircle className="w-5 h-5 text-green-500" />
              Aktif
            </>
          ) : (
            <>
              <XCircle className="w-5 h-5 text-red-500" />
              Pasif
            </>
          )}
        </Label>
      </div>
    </div>
  );
};

export default DraggableGalleryRow;
