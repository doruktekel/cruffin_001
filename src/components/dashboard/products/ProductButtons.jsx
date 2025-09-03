"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Save, Loader2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import DraggableProductRow from "./DraggableProductRow";
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
import useSubmitProducts from "@/hooks/useSubmitProducts";
import { toast } from "react-toastify";
import extractPublicId from "@/utils/extractPublicId";

const ProductButtons = ({ newProducts, categories }) => {
  const [selectedCategory, setSelectedCategory] = useState(
    categories?.[0]?._id || ""
  );
  const [lastSubmitTime, setLastSubmitTime] = useState(0);

  const [allProducts, setAllProducts] = useState(() =>
    newProducts.map((product) => ({
      ...product,
      originalImage: product.image || "",
      pendingImage: null,
      markedForDeletion: false,
    }))
  );

  const [products, setProducts] = useState(() =>
    allProducts.filter((product) => product.category === selectedCategory)
  );

  const [uploadingStates, setUploadingStates] = useState({});
  const newProductInputRef = useRef(null);
  const { loading, error, submitProducts } = useSubmitProducts();

  // Optimized sensors configuration
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Minimum distance before drag starts
      },
    })
  );

  useEffect(() => {
    const filtered = allProducts.filter(
      (product) => product.category === selectedCategory
    );
    setProducts(filtered);
  }, [selectedCategory, allProducts]);

  // Optimized drag end handler
  const handleDragEnd = useCallback((event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    setProducts((prevProducts) => {
      const oldIndex = prevProducts.findIndex((item) => item._id === active.id);
      const newIndex = prevProducts.findIndex((item) => item._id === over.id);

      if (oldIndex === -1 || newIndex === -1) return prevProducts;

      const newOrder = arrayMove(prevProducts, oldIndex, newIndex);
      return newOrder.map((p, i) => ({
        ...p,
        order: i,
      }));
    });
  }, []);

  const handleAddProduct = useCallback(() => {
    const tempId = `temp-${Date.now()}`;
    const newProduct = {
      tempId,
      name: "",
      category: selectedCategory,
      image: "",
      originalImage: "",
      pendingImage: null,
      price: null,
      description: "",
      ingredients: [],
      calories: 0,
      isVegan: false,
      isVegetarian: false,
      isGlutenFree: false,
      isSpicy: false,
      isAvailable: true,
      allergens: [],
      order: products.length,
      markedForDeletion: false,
    };

    setProducts((prev) => [...prev, newProduct]);
    setAllProducts((prev) => [...prev, newProduct]);

    setTimeout(() => {
      newProductInputRef.current?.focus();
    }, 0);
  }, [selectedCategory, products.length]);

  const handleProductChange = useCallback((id, field, value) => {
    setProducts((prev) =>
      prev.map((p) =>
        (p._id || p.tempId) === id ? { ...p, [field]: value } : p
      )
    );

    setAllProducts((prev) =>
      prev.map((p) =>
        (p._id || p.tempId) === id ? { ...p, [field]: value } : p
      )
    );
  }, []);

  const handleProductDelete = useCallback((id) => {
    setProducts((prev) => prev.filter((p) => (p._id || p.tempId) !== id));
    setAllProducts((prev) => prev.filter((p) => (p._id || p.tempId) !== id));
  }, []);

  // Optimized validation function
  const validateProducts = useCallback((activeProducts) => {
    const errors = [];
    const productsToValidate = activeProducts.filter(
      (p) => !p.markedForDeletion
    );

    productsToValidate.forEach((product) => {
      if (!product.name?.trim()) {
        errors.push(`Ürün adı girilmesi zorunludur !`);
      }

      if (
        product.price === null ||
        product.price === undefined ||
        product.price === "" ||
        product.price < 0
      ) {
        errors.push(`Fiyat girilmesi zorunludur ve pozitif olmalıdır !`);
      }

      const hasImage =
        product.image ||
        product.originalImage ||
        (product.pendingImage && product.pendingImage.base64);

      if (!hasImage) {
        errors.push(`Görsel seçilmesi zorunludur !`);
      }
    });

    return errors;
  }, []);

  // Upload pending images function
  const uploadPendingImages = useCallback(
    async (productsToProcess) => {
      const processedProducts = [];

      for (let i = 0; i < productsToProcess.length; i++) {
        const product = productsToProcess[i];
        let processedProduct = { ...product };

        if (product.pendingImage && product.pendingImage.base64) {
          const productIndex = products.findIndex(
            (p) => (p._id || p.tempId) === (product._id || product.tempId)
          );

          setUploadingStates((prev) => ({ ...prev, [productIndex]: true }));

          try {
            const currentImage = product.originalImage || product.image;
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

            const res = await fetch("/api/upload-image", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ image: product.pendingImage.base64 }),
            });

            const data = await res.json();
            if (!res.ok || data.error) {
              throw new Error(data.error || "Görsel yüklenemedi.");
            }

            if (data.url) {
              processedProduct.image = data.url;
              processedProduct.originalImage = data.url;
              processedProduct.pendingImage = null;
            }
          } catch (err) {
            toast.error(`Ürün görseli yüklenemedi: ${err.message}`);
            processedProduct.image = product.originalImage || "";
            processedProduct.pendingImage = null;
          } finally {
            setUploadingStates((prev) => ({ ...prev, [productIndex]: false }));
          }
        }

        processedProducts.push(processedProduct);
      }

      return processedProducts;
    },
    [products]
  );

  // Değişiklikleri kontrol etme fonksiyonu
  const hasChanges = useCallback(() => {
    // Silinmek üzere işaretlenen ürün var mı?
    const hasMarkedForDeletion = products.some((p) => p.markedForDeletion);
    if (hasMarkedForDeletion) return true;

    // Pending image'ı olan ürün var mı?
    const hasPendingImages = products.some(
      (p) => p.pendingImage && p.pendingImage.base64
    );
    if (hasPendingImages) return true;

    // Yeni eklenen ürün var mı? (tempId'li)
    const hasNewProducts = products.some((p) => p.tempId);
    if (hasNewProducts) return true;

    // Mevcut ürünlerde değişiklik var mı kontrol et
    const originalProducts = newProducts.filter(
      (p) => p.category === selectedCategory
    );

    if (products.length !== originalProducts.length) return true;

    for (let i = 0; i < products.length; i++) {
      const current = products[i];
      const original = originalProducts.find((p) => p._id === current._id);

      if (!original) continue;

      // Temel alanları karşılaştır
      const fieldsToCheck = [
        "name",
        "price",
        "description",
        "calories",
        "isVegan",
        "isVegetarian",
        "isGlutenFree",
        "isSpicy",
        "isAvailable",
        "order",
      ];

      for (const field of fieldsToCheck) {
        if (current[field] !== original[field]) {
          return true;
        }
      }

      // Array alanları karşılaştır
      const arrayFieldsToCheck = ["ingredients", "allergens"];
      for (const field of arrayFieldsToCheck) {
        const currentArray = current[field] || [];
        const originalArray = original[field] || [];

        if (currentArray.length !== originalArray.length) {
          return true;
        }

        for (let j = 0; j < currentArray.length; j++) {
          if (currentArray[j] !== originalArray[j]) {
            return true;
          }
        }
      }

      // Resim değişikliği kontrol et
      if (current.image !== original.image) {
        return true;
      }
    }

    return false;
  }, [products, newProducts, selectedCategory]);

  const handleSubmit = useCallback(async () => {
    const now = Date.now();
    if (now - lastSubmitTime < 2000) {
      return;
    }
    setLastSubmitTime(now);

    try {
      // Değişiklik kontrolü
      if (!hasChanges()) {
        toast.info("Herhangi bir değişiklik yapılmadı.");
        return;
      }

      const activeProducts = products.filter((p) => !p.markedForDeletion);
      const productsWithOrder = activeProducts.map((p, index) => ({
        ...p,
        order: index,
      }));

      const validationErrors = validateProducts(productsWithOrder);

      if (validationErrors.length > 0) {
        toast.error(validationErrors[0]);
        return;
      }

      const processedProducts = await uploadPendingImages(productsWithOrder);
      const updated = await submitProducts(processedProducts);

      if (updated) {
        const updatedProductsWithMeta = updated.map((p) => ({
          ...p,
          _id: p._id.toString(),
          originalImage: p.image || "",
          pendingImage: null,
          markedForDeletion: false,
        }));

        setProducts(updatedProductsWithMeta);

        setAllProducts((prev) => {
          const otherCategoryProducts = prev.filter(
            (p) => p.category !== selectedCategory
          );
          return [...otherCategoryProducts, ...updatedProductsWithMeta];
        });
      }
    } catch (error) {
      console.error("Submit error:", error);
      toast.error("Kayıt sırasında bir hata oluştu.");
    }
  }, [
    products,
    lastSubmitTime,
    validateProducts,
    uploadPendingImages,
    submitProducts,
    selectedCategory,
    hasChanges,
  ]);

  // Memoized computed values
  const hasPendingImages = useMemo(
    () =>
      products.some(
        (p) => p.pendingImage && p.pendingImage.base64 && !p.markedForDeletion
      ),
    [products]
  );

  const hasMarkedForDeletion = useMemo(
    () => products.some((p) => p.markedForDeletion),
    [products]
  );

  const markedForDeletionCount = useMemo(
    () => products.filter((p) => p.markedForDeletion).length,
    [products]
  );

  const isUploading = useMemo(
    () => Object.values(uploadingStates).some(Boolean),
    [uploadingStates]
  );

  // Memoized sortable items
  const sortableItems = useMemo(
    () => products.map((p) => p._id || p.tempId),
    [products]
  );

  return (
    <div className="overflow-hidden mb-4">
      <div className="flex justify-center items-center">
        <p className="text-lg font-semibold">Ürünler</p>
      </div>
      <div className="flex justify-between my-4">
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-[200px] cursor-pointer">
            <SelectValue placeholder="Kategori seç" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((cat) => (
              <SelectItem
                key={cat._id}
                value={cat._id}
                className="cursor-pointer"
              >
                {cat.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button
          onClick={handleAddProduct}
          variant="outline"
          className="cursor-pointer"
        >
          <Plus size={16} className="mr-2" /> Ürün Ekle
        </Button>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
        // Performans optimizasyonu
        measuring={{
          droppable: {
            strategy: "when-dragging",
          },
        }}
      >
        <SortableContext
          items={sortableItems}
          strategy={verticalListSortingStrategy}
        >
          {products.map((product, index) => (
            <DraggableProductRow
              key={product._id || product.tempId}
              product={product}
              onChange={handleProductChange}
              onDelete={handleProductDelete}
              inputRef={
                index === products.length - 1 ? newProductInputRef : null
              }
            />
          ))}
        </SortableContext>
      </DndContext>

      {products.length > 0 && (
        <div className="mt-8 flex justify-center">
          <Button
            type="submit"
            onClick={handleSubmit}
            size="lg"
            className="cursor-pointer"
            disabled={loading || isUploading}
          >
            {isUploading ? (
              <>
                <Loader2 className="animate-spin w-5 h-5 mr-2" />
                Resimler Yükleniyor...
              </>
            ) : (
              <>
                <Save size={20} className="mr-2" />
                {loading ? "Kaydediliyor..." : "Değişiklikleri Kaydet"}
              </>
            )}
          </Button>
        </div>
      )}

      {/* Bilgilendirme mesajları */}
      <div className="mt-2 space-y-1">
        {hasPendingImages && !isUploading && (
          <p className="text-center text-sm text-orange-600">
            Değişiklik yapılan resimler kaydet butonuna bastığınızda yüklenecek.
          </p>
        )}

        {hasMarkedForDeletion && (
          <p className="text-center text-sm text-red-600">
            {markedForDeletionCount} ürün silinmek üzere işaretlendi. Kaydet
            butonuna bastığınızda kalıcı olarak silinecek.
          </p>
        )}
      </div>
    </div>
  );
};

export default ProductButtons;
