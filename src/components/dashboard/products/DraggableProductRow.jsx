"use client";

import {
  Grip,
  Trash2,
  ChevronDown,
  ChevronUp,
  CheckCircle,
  XCircle,
  Loader2,
  ImagePlus,
  AlertTriangle,
} from "lucide-react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useState } from "react";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";

const DraggableProductRow = ({ product, onChange, onDelete, inputRef }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: product._id || product.tempId });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    maxWidth: "100%",
    overflow: "visible",
    zIndex: isDragging ? 9999 : 1,
  };

  const [isExpanded, setIsExpanded] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  // Unique ID generator for this product
  const productId = product._id || product.tempId;

  // Ürünün silinmek üzere işaretlenip işaretlenmediğini kontrol et
  const isMarkedForDeletion = product.markedForDeletion;

  // Resim seçme fonksiyonu - sadece preview için
  const handleImageSelect = (file) => {
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result;

      // Pending image olarak kaydet
      onChange(productId, "pendingImage", {
        file: file,
        base64: base64,
      });
    };

    reader.readAsDataURL(file);
  };

  // Gösterilecek resmi belirle
  const getDisplayImage = () => {
    if (product.pendingImage?.base64) {
      return product.pendingImage.base64;
    }
    return product.image || product.originalImage;
  };

  // Resim değişip değişmediğini kontrol et
  const hasImageChanged = () => {
    return product.pendingImage && product.pendingImage.base64;
  };

  // Silme onayı fonksiyonu
  const handleDeleteConfirm = () => {
    // Eğer yeni bir ürünse (tempId varsa), hemen sil
    if (product.tempId) {
      onDelete(productId);
      toast.success("Yeni ürün silindi.");
    } else {
      // Mevcut ürünse, silinmek üzere işaretle
      onChange(productId, "markedForDeletion", true);
      toast.info(
        "Ürün silinmek üzere işaretlendi. Değişiklikleri kaydettiğinizde silinecek."
      );
    }
    setShowDeleteDialog(false);
  };

  // Geri yükleme fonksiyonu
  const handleRestore = () => {
    onChange(productId, "markedForDeletion", false);
    toast.success("Ürün geri yüklendi.");
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex flex-col gap-2 border rounded-lg p-3 mb-3 transition-all duration-200 ${
        isMarkedForDeletion
          ? "bg-red-50 dark:bg-red-950 border-red-300 dark:border-red-700 opacity-60"
          : "bg-gray-100 dark:bg-gray-900"
      }`}
    >
      {/* Silme Uyarı Banner'ı */}
      {isMarkedForDeletion && (
        <div className="bg-red-100 dark:bg-red-900 border border-red-300 dark:border-red-700 rounded-md p-2 mb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-red-700 dark:text-red-300">
              <AlertTriangle size={16} />
              <span className="text-sm font-medium">
                Bu ürün silinmek üzere işaretlendi
              </span>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleRestore}
              className="text-red-700 dark:text-red-500 border-red-300  hover:bg-red-200  border cursor-pointer dark:bg-white dark:hover:bg-red-100"
            >
              Geri Yükle
            </Button>
          </div>
        </div>
      )}

      {/* Top Row */}
      <div className="flex items-center gap-4">
        {/* Drag handle */}
        <div
          className={`cursor-grab active:cursor-grabbing ${
            isMarkedForDeletion ? "opacity-50 cursor-not-allowed" : ""
          }`}
          {...(!isMarkedForDeletion ? attributes : {})}
          {...(!isMarkedForDeletion ? listeners : {})}
        >
          <Grip size={20} />
        </div>

        {/* Image */}
        <div
          className={`w-24 h-24 relative rounded overflow-hidden border bg-white group ${
            isMarkedForDeletion ? "opacity-50" : ""
          }`}
        >
          {getDisplayImage() ? (
            <div className="relative w-full h-full">
              <Image
                src={getDisplayImage()}
                alt="product"
                fill
                className="object-cover cursor-pointer"
              />

              {hasImageChanged() && !isMarkedForDeletion && (
                <div className="absolute top-1 right-1 bg-orange-500 text-white text-xs px-1 py-0.5 rounded">
                  Yeni
                </div>
              )}
            </div>
          ) : (
            <span className="text-sm text-center text-gray-400 w-full h-full flex items-center justify-center group-hover:opacity-70 transition-opacity">
              Görsel
            </span>
          )}

          {!isMarkedForDeletion && (
            <>
              <div className="absolute inset-0 bg-black/40 text-white flex flex-col items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="flex flex-col items-center gap-1">
                  <ImagePlus className="w-5 h-5 mb-1" />
                  <span>{getDisplayImage() ? "Değiştir" : "Görsel Seç"}</span>
                </div>
              </div>

              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleImageSelect(e.target.files?.[0])}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
            </>
          )}
        </div>

        {/* Name Input */}
        <Input
          ref={inputRef}
          type="text"
          className={`flex-1 p-2 border rounded-md bg-white dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:placeholder:text-gray-400 ${
            isMarkedForDeletion ? "opacity-50" : ""
          }`}
          placeholder="Ürün adı"
          value={product.name}
          onChange={(e) => onChange(productId, "name", e.target.value)}
          onPointerDown={(e) => e.stopPropagation()}
          disabled={isMarkedForDeletion}
        />

        {/* Expand / Collapse */}
        <Button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="p-2 cursor-pointer"
          disabled={isMarkedForDeletion}
        >
          {isExpanded ? <ChevronUp size={25} /> : <ChevronDown size={25} />}
        </Button>

        {/* Delete / Restore Button */}
        {!isMarkedForDeletion && (
          <AlertDialog
            open={showDeleteDialog}
            onOpenChange={setShowDeleteDialog}
          >
            <AlertDialogTrigger asChild>
              <Button
                type="button"
                variant="outline"
                className="p-2 cursor-pointer hover:bg-red-50 hover:border-red-300 hover:text-red-600 dark:hover:bg-red-950 dark:hover:border-red-700 dark:hover:text-red-400 transition-colors"
              >
                <Trash2 size={20} />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle className="flex items-center justify-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-red-500" />
                  Ürünü Silmek İstediğinize Emin Misiniz?
                </AlertDialogTitle>
                <AlertDialogDescription>
                  <div className="space-y-2">
                    <div>
                      "
                      <strong className="text-red-500">
                        {product.name || "İsimsiz Ürün"}
                      </strong>
                      " adlı ürünü silmek üzeresiniz.
                    </div>

                    {product.tempId ? (
                      <p className="text-orange-600 dark:text-orange-400">
                        Bu yeni bir ürün olduğu için hemen silinecektir.
                      </p>
                    ) : (
                      <p>
                        Bu ürün silinmek üzere işaretlenecek ve "Değişiklikleri
                        Kaydet" butonuna bastığınızda kalıcı olarak
                        silinecektir.
                      </p>
                    )}
                  </div>
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="cursor-pointer">
                  İptal
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDeleteConfirm}
                  className="cursor-pointer"
                >
                  Evet, Sil
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>

      {/* Expandable Fields */}
      <AnimatePresence initial={false}>
        {isExpanded && !isMarkedForDeletion && (
          <motion.div
            key="expanded-fields"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-4">
              <div className="flex flex-col gap-4">
                <Label>Fiyat ( TL )</Label>
                <Input
                  className="p-2 border rounded-md bg-white dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:placeholder:text-gray-400"
                  type="number"
                  value={product.price || ""}
                  onChange={(e) => {
                    const value = e.target.value;
                    const numericValue =
                      value === "" ? null : parseFloat(value);
                    onChange(productId, "price", numericValue);
                  }}
                />
              </div>

              <div className="flex flex-col gap-4">
                <Label>Kalori</Label>
                <Input
                  className="p-2 border rounded-md bg-white dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:placeholder:text-gray-400"
                  type="number"
                  value={product.calories}
                  onChange={(e) =>
                    onChange(productId, "calories", e.target.value)
                  }
                />
              </div>

              <div className="md:col-span-2 flex flex-col gap-4">
                <Label>Açıklama (Maksimum 180 Karakter)</Label>
                <Textarea
                  className="p-2 border rounded-md bg-white dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:placeholder:text-gray-400"
                  maxLength={180}
                  value={product.description}
                  onChange={(e) =>
                    onChange(productId, "description", e.target.value)
                  }
                />
              </div>

              <div className="md:col-span-2 flex flex-col gap-4">
                <Label>İçindekiler (Virgülle Ayırınız)</Label>

                <Input
                  className="p-2 border rounded-md bg-white dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:placeholder:text-gray-400"
                  value={product.ingredients.join(", ")}
                  onChange={(e) => {
                    // Don't filter empty strings immediately - let users type commas
                    const items = e.target.value
                      .split(",")
                      .map((i) => i.trim());
                    onChange(productId, "ingredients", items);
                  }}
                  onBlur={(e) => {
                    // Clean up empty items only on blur
                    const cleanItems = e.target.value
                      .split(",")
                      .map((i) => i.trim())
                      .filter((i) => i !== "");
                    onChange(productId, "ingredients", cleanItems);
                  }}
                />
              </div>

              <div className="md:col-span-2 flex flex-col gap-4">
                <Label>Alerjenler (Virgülle Ayırınız)</Label>

                <Input
                  className="p-2 border rounded-md bg-white dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:placeholder:text-gray-400"
                  value={product.allergens.join(", ")}
                  onChange={(e) => {
                    // Don't filter empty strings immediately - let users type commas
                    const items = e.target.value
                      .split(",")
                      .map((i) => i.trim());
                    onChange(productId, "allergens", items);
                  }}
                  onBlur={(e) => {
                    // Clean up empty items only on blur
                    const cleanItems = e.target.value
                      .split(",")
                      .map((i) => i.trim())
                      .filter((i) => i !== "");
                    onChange(productId, "allergens", cleanItems);
                  }}
                />
              </div>

              {/* Boolean flags */}
              <div className="flex gap-4 flex-wrap col-span-full mt-2">
                {[
                  { key: "isVegan", label: "Vegan" },
                  { key: "isVegetarian", label: "Vejetaryen" },
                  { key: "isGlutenFree", label: "Glutensiz" },
                  { key: "isSpicy", label: "Acılı" },
                ].map((flag) => {
                  const uniqueId = `checkbox-${productId}-${flag.key}`;

                  return (
                    <div key={uniqueId} className="flex items-center gap-2">
                      <Checkbox
                        id={uniqueId}
                        checked={product[flag.key]}
                        onCheckedChange={(val) =>
                          onChange(productId, flag.key, val)
                        }
                      />
                      <Label
                        htmlFor={uniqueId}
                        className="select-none cursor-pointer"
                      >
                        {flag.label}
                      </Label>
                    </div>
                  );
                })}
              </div>

              {/* Toggle switch for availability */}
              <div className="flex items-center gap-4 mt-2 px-1">
                <Switch
                  id={`switch-${productId}-isAvailable`}
                  checked={product.isAvailable}
                  onCheckedChange={(val) =>
                    onChange(productId, "isAvailable", val)
                  }
                  className="scale-110 cursor-pointer"
                />
                <Label
                  htmlFor={`switch-${productId}-isAvailable`}
                  className="flex items-center gap-2 cursor-pointer select-none"
                >
                  {product.isAvailable ? (
                    <>
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      Stokta
                    </>
                  ) : (
                    <>
                      <XCircle className="w-5 h-5 text-red-500" />
                      Tükendi
                    </>
                  )}
                </Label>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DraggableProductRow;
