"use client";

import { Button } from "@/components/ui/button";
import { AlertTriangle, Plus, Save } from "lucide-react";
import { useState, useEffect, useRef } from "react";
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
import DraggableCategoryButton from "./DraggableCategoryButton";
import useSubmitCategories from "@/hooks/useSubmitCategories";
import { toast } from "react-toastify";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const CategoryButtons = ({ newCategories }) => {
  const [activeCategories, setActiveCategories] = useState(newCategories);
  const [originalCategories, setOriginalCategories] = useState([]); // Orijinal kategorileri takip etmek için
  const [deleteDialog, setDeleteDialog] = useState({
    isOpen: false,
    categoryId: null,
    categoryName: "",
  });
  const [lastSubmitTime, setLastSubmitTime] = useState(0);
  const newInputRef = useRef(null);

  const { loading, error, submitCategories } = useSubmitCategories();

  // Drag & Drop için sensorları ayarlıyoruz
  const sensors = useSensors(useSensor(PointerSensor));

  // Kategorilerde değişiklik olup olmadığını kontrol eden fonksiyon
  const hasChanges = () => {
    // Aktif (silinmemiş) kategorileri al
    const activeNonDeletedCategories = activeCategories.filter(
      (cat) => !cat.isDeleted
    );

    // Eğer kategori sayısı farklıysa değişiklik var
    if (activeNonDeletedCategories.length !== originalCategories.length) {
      return true;
    }

    // Her kategoriyi kontrol et
    for (let i = 0; i < activeNonDeletedCategories.length; i++) {
      const current = activeNonDeletedCategories[i];
      const original = originalCategories[i];

      // Yeni kategori eklendiyse (tempId var)
      if (current.tempId) {
        return true;
      }

      // İsim değişmişse
      if (current.name !== original.name) {
        return true;
      }

      // Sıra değişmişse (order farklı)
      if (current._id !== original._id) {
        return true;
      }
    }

    return false;
  };

  // Drag işlemi bittiğinde sırayı güncelleme
  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = activeCategories.findIndex(
      (category) => category._id === active.id
    );
    const newIndex = activeCategories.findIndex(
      (category) => category._id === over.id
    );

    const newOrder = arrayMove(activeCategories, oldIndex, newIndex);
    setActiveCategories(newOrder);
  };

  // Kategori eklemek için kategori ekleme fonksiyonu
  const handleAddCategory = () => {
    const newCategoryTempId = `temp-${Date.now()}`;
    setActiveCategories([
      ...activeCategories,
      { tempId: newCategoryTempId, name: "", isDeleted: false },
    ]);

    setTimeout(() => {
      newInputRef.current?.focus();
    }, 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // 2 saniye içinde tekrar submit'i engelle
    const now = Date.now();
    if (now - lastSubmitTime < 2000) {
      return;
    }
    setLastSubmitTime(now);

    // Değişiklik kontrolü
    if (!hasChanges()) {
      toast.info("Herhangi bir değişiklik yapılmadı.");
      return;
    }

    // Silinen kategorileri filtreliyoruz
    const activeNonDeletedCategories = activeCategories.filter(
      (cat) => !cat.isDeleted
    );

    const hasEmptyName = activeNonDeletedCategories.some(
      (cat) => !cat.name || cat.name.trim() === ""
    );

    if (hasEmptyName) {
      toast.error("Tüm kategorilere isim girmeniz gerekmektedir !");
      return;
    }

    const categoriesToSend = activeNonDeletedCategories.map(
      (category, index) => {
        const base = {
          name: category.name.trim(),
          order: index,
        };
        if (category._id) {
          base._id = category._id;
        }
        return base;
      }
    );

    const newServerCategories = await submitCategories(categoriesToSend);
    if (newServerCategories) {
      const updatedCategories = newServerCategories.map((cat) => ({
        ...cat,
        _id: cat._id.toString(),
        isDeleted: false,
      }));

      setActiveCategories(updatedCategories);
      // Orijinal kategorileri de güncelle
      setOriginalCategories([...updatedCategories]);
    }
  };

  const handleCategoryChange = (id, e) => {
    setActiveCategories((prev) =>
      prev.map((category) =>
        (category._id || category.tempId) === id
          ? { ...category, name: e.target.value }
          : category
      )
    );
  };

  // Silme dialogunu açma
  const handleDeleteCategory = (id, categoryName) => {
    setDeleteDialog({
      isOpen: true,
      categoryId: id,
      categoryName: categoryName || "Bu kategori",
    });
  };

  // Silme işlemini onaylama
  const confirmDelete = () => {
    const { categoryId } = deleteDialog;

    setActiveCategories((prev) =>
      prev.map((category) =>
        (category._id || category.tempId) === categoryId
          ? { ...category, isDeleted: true }
          : category
      )
    );

    // Dialog'u kapat
    setDeleteDialog({
      isOpen: false,
      categoryId: null,
      categoryName: "",
    });

    toast.info(
      "Kategori silme işlemi için sıraya alındı. Değişiklikleri kaydedin.",
      {
        position: "top-right",
      }
    );
  };

  // Silme işlemini iptal etme
  const cancelDelete = () => {
    setDeleteDialog({
      isOpen: false,
      categoryId: null,
      categoryName: "",
    });
  };

  // Silinen kategorileri geri getirme (undo)
  const handleUndoDelete = (id) => {
    setActiveCategories((prev) =>
      prev.map((category) =>
        (category._id || category.tempId) === id
          ? { ...category, isDeleted: false }
          : category
      )
    );

    toast.success("Kategori geri getirildi.", {
      position: "top-right",
    });
  };

  useEffect(() => {
    // Eğer mevcut kategoriler varsa onları al ve isDeleted field'ını ekle
    const categoriesWithDeleteFlag = newCategories.map((cat) => ({
      ...cat,
      isDeleted: false,
    }));

    setActiveCategories(categoriesWithDeleteFlag);
    // Orijinal kategorileri de kaydet
    setOriginalCategories([...categoriesWithDeleteFlag]);
  }, [newCategories]);

  // Aktif (silinmemiş) kategorileri filtrele
  const visibleCategories = activeCategories.filter((cat) => !cat.isDeleted);
  const deletedCategories = activeCategories.filter((cat) => cat.isDeleted);

  return (
    <>
      <form onSubmit={handleSubmit} className="overflow-hidden mb-4">
        <div className="flex justify-center items-center">
          <p className="text-lg font-semibold">Kategori Yönetimi</p>
        </div>
        <div className="my-4 flex justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={handleAddCategory}
            className="flex items-center gap-2 cursor-pointer"
          >
            <Plus size={20} />
            Kategori Ekle
          </Button>
        </div>

        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={visibleCategories.map((cat) => cat._id || cat.tempId)}
            strategy={verticalListSortingStrategy}
          >
            {visibleCategories.map((category, index) => (
              <DraggableCategoryButton
                key={category._id || category.tempId}
                id={category._id || category.tempId}
                name={category.name}
                onChange={(e) =>
                  handleCategoryChange(category._id || category.tempId, e)
                }
                onDelete={() =>
                  handleDeleteCategory(
                    category._id || category.tempId,
                    category.name
                  )
                }
                inputRef={
                  index === visibleCategories.length - 1 ? newInputRef : null
                }
              />
            ))}
          </SortableContext>
        </DndContext>

        {/* Silinen kategorilerin listesi */}
        {deletedCategories.length > 0 && (
          <div className="mt-6 space-y-3 bg-red-50 dark:bg-red-950 border-red-300 dark:border-red-700 opacity-60">
            {deletedCategories.map((category) => (
              <div
                key={category._id || category.tempId}
                className="bg-red-100 dark:bg-red-900 border border-red-300 dark:border-red-700 rounded-md p-2 mb-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-red-700 dark:text-red-300">
                    <AlertTriangle size={16} />
                    <span className="text-sm font-medium">
                      "{category.name}" kategorisi silinmek üzere işaretlendi
                    </span>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      handleUndoDelete(category._id || category.tempId)
                    }
                    className="text-red-700 dark:text-red-500 border-red-300  hover:bg-red-200  border cursor-pointer dark:bg-white dark:hover:bg-red-100"
                  >
                    Geri Yükle
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-8 flex justify-center">
          <Button
            type="submit"
            size="lg"
            className="cursor-pointer"
            disabled={loading}
          >
            <Save size={20} />
            {loading ? "Kaydediliyor..." : "Değişiklikleri Kaydet"}
          </Button>
        </div>
      </form>

      {/* Silme Onay Dialogu */}
      <AlertDialog open={deleteDialog.isOpen} onOpenChange={cancelDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center justify-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              Kategoriyi Silmek İstediğinize Emin misiniz?
            </AlertDialogTitle>
            <AlertDialogDescription>
              <div className="space-y-2">
                {" "}
                <div>
                  "
                  <strong className="text-red-500">
                    {deleteDialog.categoryName}
                  </strong>
                  " kategorisini silmek üzeresiniz.
                </div>
                {deleteDialog.categoryId?.startsWith("temp-") ? (
                  <p className="text-orange-600 dark:text-orange-400">
                    Bu yeni bir kategori olduğu için hemen silinecektir.
                  </p>
                ) : (
                  <p>
                    Bu kategori silinmek üzere işaretlenecek ve "Değişiklikleri
                    Kaydet" butonuna bastığınızda kalıcı olarak silinecektir.
                  </p>
                )}
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={cancelDelete}
              className="cursor-pointer"
            >
              İptal
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="cursor-pointer "
            >
              Evet, Sil
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default CategoryButtons;
