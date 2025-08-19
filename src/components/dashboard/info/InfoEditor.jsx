"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { ImagePlus, Loader2, Save, CheckCircle, XCircle } from "lucide-react";
import Image from "next/image";
import { toast } from "react-toastify";
import { useSubmitInfos } from "@/hooks/useSubmitInfos";
import extractPublicId from "@/utils/extractPublicId";

const InfoEditor = ({ infos }) => {
  const [items, setItems] = useState(
    infos && infos.length > 0
      ? infos.map((info) => ({
          ...info,
          // Eğer önceki resim varsa, onu koruyoruz
          originalImage: info.image || "",
          pendingImage: null, // Yeni seçilen ama henüz upload edilmemiş resim
        }))
      : new Array(4).fill(null).map(() => ({
          tempId:
            Date.now().toString() + Math.random().toString(36).substring(2),
          image: "",
          originalImage: "",
          pendingImage: null,
          title: "",
          description: "",
          isActive: false,
        }))
  );
  const [lastSubmitTime, setLastSubmitTime] = useState(0);

  const [uploadingStates, setUploadingStates] = useState({});
  const { submitInfos, loading } = useSubmitInfos();

  const handleChange = (index, field, value) => {
    setItems((prev) => {
      const copy = [...prev];
      copy[index][field] = value;
      return copy;
    });
  };

  // Resim seçildiğinde sadece preview için base64 oluştur, upload etme
  const handleImageSelect = (index, file) => {
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result;

      setItems((prev) => {
        const copy = [...prev];
        copy[index].pendingImage = {
          file: file,
          base64: base64,
        };
        return copy;
      });
    };

    reader.readAsDataURL(file);
  };

  // Kaydet butonuna bastığında tüm pending resimleri upload et
  const uploadPendingImages = async (itemsToProcess) => {
    const processedItems = [];

    for (let i = 0; i < itemsToProcess.length; i++) {
      const item = itemsToProcess[i];
      let processedItem = { ...item };

      // Eğer pending image varsa upload et
      if (item.pendingImage && item.pendingImage.base64) {
        setUploadingStates((prev) => ({ ...prev, [i]: true }));

        try {
          // Eski resmi sil (eğer varsa ve değişmişse)
          const currentImage = item.originalImage || item.image;
          if (currentImage) {
            const publicId = extractPublicId(currentImage);
            if (publicId) {
              await fetch("/api/delete-image", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ public_id: publicId }),
              });
            }
          }

          // Yeni resmi upload et
          const res = await fetch("/api/upload-image", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ image: item.pendingImage.base64 }),
          });

          const data = await res.json();
          if (!res.ok || data.error) {
            throw new Error(data.error || "Görsel yüklenemedi.");
          }

          if (data.url) {
            processedItem.image = data.url;
            processedItem.originalImage = data.url;
            processedItem.pendingImage = null;
          }
        } catch (err) {
          toast.error(`${i + 1}. görseli yüklenemedi: ${err.message}`);
          // Upload başarısız olursa eski resmi koru
          processedItem.image = item.originalImage || "";
          processedItem.pendingImage = null;
        } finally {
          setUploadingStates((prev) => ({ ...prev, [i]: false }));
        }
      }

      processedItems.push(processedItem);
    }

    return processedItems;
  };

  const handleSubmit = async () => {
    // 2 saniye içinde tekrar submit'i engelle
    const now = Date.now();
    if (now - lastSubmitTime < 2000) {
      return;
    }
    setLastSubmitTime(now);
    // isActive true olanları filtrele
    const activeItems = items.filter((item) => item.isActive);

    // Boş alanları kontrol et (pending image'ları da dikkate al)
    const invalids = activeItems.filter((item) => {
      const hasImage = item.image?.trim() || item.pendingImage?.base64;
      return !item.title?.trim() || !item.description?.trim() || !hasImage;
    });

    if (invalids.length > 0) {
      toast.error("Aktif seçimlerin tüm alanlarını doldurunuz.");
      return;
    }

    try {
      // Önce pending resimleri upload et
      const processedItems = await uploadPendingImages(items);

      // Sonra veritabanına kaydet
      await submitInfos(processedItems);

      // State'i güncelle
      setItems(processedItems);
    } catch (error) {
      console.error("Submit error:", error);

      const message = error?.message || "Kayıt sırasında bir hata oluştu.";
      toast.error(message);
    }
  };

  // Gösterilecek resmi belirle (pending varsa onu, yoksa mevcut resmi)
  const getDisplayImage = (item) => {
    if (item.pendingImage?.base64) {
      return item.pendingImage.base64;
    }
    return item.image || item.originalImage;
  };

  // Resim değişip değişmediğini kontrol et
  const hasImageChanged = (item) => {
    return item.pendingImage && item.pendingImage.base64;
  };

  return (
    <div className=" flex flex-col gap-4 overflow-hidden mb-4">
      <div className="flex justify-center items-center">
        <p className="text-lg font-semibold">Hakkımızda</p>
      </div>
      {items.map((item, index) => (
        <div
          key={item.tempId || item._id || index}
          className="border p-4 rounded-lg bg-gray-50 dark:bg-gray-900"
        >
          <div className="flex flex-col md:flex-row gap-6">
            {/* Görsel Alanı */}
            <div className="w-32 h-32 relative rounded border bg-white dark:bg-gray-800 group overflow-hidden shrink-0">
              {getDisplayImage(item) ? (
                <div className="relative w-full h-full">
                  <Image
                    src={getDisplayImage(item)}
                    alt="preview"
                    width={200}
                    height={200}
                    className={`object-cover transition-opacity ${
                      uploadingStates[index] ? "opacity-50 grayscale" : ""
                    }`}
                  />
                  {/* Değişiklik göstergesi */}
                  {hasImageChanged(item) && !uploadingStates[index] && (
                    <div className="absolute top-1 right-1 bg-orange-500 text-white text-xs px-1 py-0.5 rounded">
                      Yeni
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center justify-center h-full text-gray-400 group-hover:opacity-70">
                  <p className="text-sm">Görsel Yükle</p>
                </div>
              )}

              {/* Hover / Loading Overlay */}
              <div
                className={`absolute inset-0 bg-black/40 text-white flex flex-col items-center justify-center text-xs transition-opacity ${
                  uploadingStates[index]
                    ? "opacity-100"
                    : "opacity-0 group-hover:opacity-100"
                }`}
              >
                {uploadingStates[index] ? (
                  <div className="flex flex-col items-center">
                    <Loader2 className="animate-spin w-6 h-6 mb-1" />
                    <span>Yükleniyor...</span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-1">
                    <ImagePlus className="w-5 h-5 mb-1" />
                    <span>
                      {getDisplayImage(item)
                        ? "Görseli Değiştir"
                        : "Görsel Seç"}
                    </span>
                  </div>
                )}
              </div>

              {/* File Input */}
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleImageSelect(index, e.target.files?.[0])}
                className="absolute inset-0 opacity-0 cursor-pointer"
                disabled={uploadingStates[index]}
              />
            </div>

            {/* Bilgi Alanları */}
            <div className="flex flex-col flex-1 gap-4">
              <div className="flex flex-col gap-4">
                <Label>Başlık</Label>
                <Input
                  value={item.title}
                  onChange={(e) => handleChange(index, "title", e.target.value)}
                  placeholder="Başlık giriniz"
                  className="flex-1 p-2 border rounded-md bg-white dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:placeholder:text-gray-400"
                />
              </div>

              <div className="flex flex-col gap-4">
                <Label>Açıklama</Label>
                <Textarea
                  value={item.description}
                  onChange={(e) =>
                    handleChange(index, "description", e.target.value)
                  }
                  placeholder="Açıklama giriniz"
                  className="flex-1 p-2 border rounded-md bg-white dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:placeholder:text-gray-400"
                />
              </div>

              {/* Aktif/Pasif */}
              <div className="flex items-center gap-4 mt-2 px-1 self-end">
                <Switch
                  id={`isActive-${item.tempId || item._id || index}`}
                  checked={item.isActive ?? false}
                  onCheckedChange={(val) =>
                    handleChange(index, "isActive", val)
                  }
                  className="scale-110 cursor-pointer"
                />
                <Label
                  htmlFor={`isActive-${item.tempId || item._id || index}`}
                  className="flex items-center gap-2"
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
          </div>
        </div>
      ))}

      {/* Kaydet Butonu */}
      <div className="text-center mt-4">
        <Button
          onClick={handleSubmit}
          size="lg"
          className="cursor-pointer"
          disabled={loading || Object.values(uploadingStates).some(Boolean)}
        >
          <Save size={20} className="mr-2" />
          {loading || Object.values(uploadingStates).some(Boolean)
            ? "Kaydediliyor..."
            : "Değişiklikleri Kaydet"}
        </Button>
      </div>
    </div>
  );
};

export default InfoEditor;
