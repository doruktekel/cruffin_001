"use client";

import { useState, useEffect, useRef } from "react";
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
      markedForDeletion: false, // Yeni alan eklendi
    }))
  );

  const [products, setProducts] = useState(() =>
    allProducts.filter((product) => product.category === selectedCategory)
  );

  const [uploadingStates, setUploadingStates] = useState({});
  const newProductInputRef = useRef(null);
  const { loading, error, submitProducts } = useSubmitProducts();

  const sensors = useSensors(useSensor(PointerSensor));

  useEffect(() => {
    const filtered = allProducts.filter(
      (product) => product.category === selectedCategory
    );
    setProducts(filtered);
  }, [selectedCategory, allProducts]);

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = products.findIndex((item) => item._id === active.id);
    const newIndex = products.findIndex((item) => item._id === over.id);

    const newOrder = arrayMove(products, oldIndex, newIndex);
    setProducts(
      newOrder.map((p, i) => ({
        ...p,
        order: i,
      }))
    );
  };

  const handleAddProduct = () => {
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
      markedForDeletion: false, // Yeni alan
    };

    setProducts([...products, newProduct]);
    setAllProducts([...allProducts, newProduct]);

    setTimeout(() => {
      newProductInputRef.current?.focus();
    }, 0);
  };

  const handleProductChange = (id, field, value) => {
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
  };

  const handleProductDelete = (id) => {
    setProducts((prev) => prev.filter((p) => (p._id || p.tempId) !== id));
    setAllProducts((prev) => prev.filter((p) => (p._id || p.tempId) !== id));
  };

  // Güncellenen validasyon fonksiyonu - silinmek üzere işaretlenen ürünleri hariç tut
  const validateProducts = (activeProducts) => {
    const errors = [];

    // Silinmek üzere işaretlenmemiş ürünleri filtrele
    const productsToValidate = activeProducts.filter(
      (p) => !p.markedForDeletion
    );

    productsToValidate.forEach((product, index) => {
      // İsim kontrolü
      if (!product.name?.trim()) {
        errors.push(`Ürün adı girilmesi zorunludur !`);
      }

      // Fiyat kontrolü
      if (
        product.price === null ||
        product.price === undefined ||
        product.price === "" ||
        product.price < 0
      ) {
        errors.push(`Fiyat girilmesi zorunludur ve pozitif olmalıdır !`);
      }

      // Görsel kontrolü
      const hasImage =
        product.image ||
        product.originalImage ||
        (product.pendingImage && product.pendingImage.base64);

      if (!hasImage) {
        errors.push(`Görsel seçilmesi zorunludur !`);
      }
    });

    return errors;
  };

  // Pending resimleri upload et
  const uploadPendingImages = async (productsToProcess) => {
    const processedProducts = [];

    for (let i = 0; i < productsToProcess.length; i++) {
      const product = productsToProcess[i];
      let processedProduct = { ...product };

      // Eğer pending image varsa upload et
      if (product.pendingImage && product.pendingImage.base64) {
        const productIndex = products.findIndex(
          (p) => (p._id || p.tempId) === (product._id || product.tempId)
        );

        setUploadingStates((prev) => ({ ...prev, [productIndex]: true }));

        try {
          // Eski resmi sil (eğer varsa ve değişmişse)
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

          // Yeni resmi upload et
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
          // Upload başarısız olursa eski resmi koru
          processedProduct.image = product.originalImage || "";
          processedProduct.pendingImage = null;
        } finally {
          setUploadingStates((prev) => ({ ...prev, [productIndex]: false }));
        }
      }

      processedProducts.push(processedProduct);
    }

    return processedProducts;
  };

  const handleSubmit = async () => {
    // 2 saniye içinde tekrar submit'i engelle
    const now = Date.now();
    if (now - lastSubmitTime < 2000) {
      return;
    }
    setLastSubmitTime(now);
    try {
      // Silinmek üzere işaretlenmemiş ürünleri al
      const activeProducts = products.filter((p) => !p.markedForDeletion);

      // Order'ları güncelle
      const productsWithOrder = activeProducts.map((p, index) => ({
        ...p,
        order: index,
      }));

      const validationErrors = validateProducts(productsWithOrder);

      if (validationErrors.length > 0) {
        // İlk hatayı toast olarak göster
        toast.error(validationErrors[0]);
        return;
      }

      // Validasyon geçtiyse, resimleri upload et
      const processedProducts = await uploadPendingImages(productsWithOrder);

      // Sonra veritabanına kaydet
      const updated = await submitProducts(processedProducts);

      if (updated) {
        // State'leri güncelle
        const updatedProductsWithMeta = updated.map((p) => ({
          ...p,
          _id: p._id.toString(),
          originalImage: p.image || "",
          pendingImage: null,
          markedForDeletion: false,
        }));

        setProducts(updatedProductsWithMeta);

        // AllProducts'ı da güncelle - silinmek üzere işaretlenen ürünleri kaldır
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
  };

  // Herhangi bir pending image var mı kontrol et
  const hasPendingImages = products.some(
    (p) => p.pendingImage && p.pendingImage.base64 && !p.markedForDeletion
  );

  // Silinmek üzere işaretlenen ürün var mı kontrol et
  const hasMarkedForDeletion = products.some((p) => p.markedForDeletion);

  const isUploading = Object.values(uploadingStates).some(Boolean);

  return (
    <div className="overflow-hidden mb-4">
      <div className="flex justify-center items-center">
        <p className="text-lg font-semibold">Ürünler</p>
      </div>
      <div className="flex justify-between my-4">
        <Select
          value={selectedCategory}
          onValueChange={(val) => setSelectedCategory(val)}
        >
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
      >
        <SortableContext
          items={products.map((p) => p._id || p.tempId)}
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
            {products.filter((p) => p.markedForDeletion).length} ürün silinmek
            üzere işaretlendi. Kaydet butonuna bastığınızda kalıcı olarak
            silinecek.
          </p>
        )}
      </div>
    </div>
  );
};

export default ProductButtons;
