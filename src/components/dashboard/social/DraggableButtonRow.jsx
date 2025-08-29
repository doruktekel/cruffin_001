"use client";

import { Grip, Trash2 } from "lucide-react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const DraggableButtonRow = ({
  keyName,
  icon,
  label,
  link,
  onChange,
  onDelete,
  inputRef,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: keyName,
  });

  // Drag sırasında scroll'u engelle
  useEffect(() => {
    if (isDragging) {
      document.body.style.overflow = "hidden";
      document.body.style.userSelect = "none";
    } else {
      document.body.style.overflow = "auto";
      document.body.style.userSelect = "auto";
    }

    // Cleanup
    return () => {
      document.body.style.overflow = "auto";
      document.body.style.userSelect = "auto";
    };
  }, [isDragging]);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    maxWidth: "100%",
    overflow: "visible",
    zIndex: isDragging ? 9999 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center justify-between gap-2 p-2 mb-2 bg-gray-100 dark:bg-gray-900 rounded-lg relative flex-wrap"
    >
      {/* Sol: draggable alan (değişken genişlik) */}
      <div
        className="flex items-center gap-1 shrink-0 max-w-full cursor-grab active:cursor-grabbing"
        {...attributes}
        {...listeners}
      >
        <Grip size={20} />
        {icon}
        <span className="capitalize whitespace-nowrap">{label}</span>
      </div>

      {/* Orta ve sağ: input + sil */}
      <div className="flex items-center gap-4 flex-1 justify-end">
        <Input
          ref={inputRef}
          type="text"
          className="p-2 border rounded-md sm:w-[300px] md:w-[500px] lg:w-[800px] xl:w-[1000px] bg-white dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:placeholder:text-gray-400"
          placeholder={`Lütfen ${label} linkini giriniz...`}
          value={link || ""}
          onChange={onChange}
          onPointerDown={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
        />

        <Button
          type="button"
          variant="outline"
          onClick={onDelete} // Bu artık parent'dan gelen handleDeleteButton fonksiyonu
          onPointerDown={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
          className="p-2 cursor-pointer hover:bg-red-50 hover:border-red-300 hover:text-red-600 dark:hover:bg-red-950 dark:hover:border-red-700 dark:hover:text-red-400 transition-colors"
        >
          <Trash2 size={20} />
        </Button>
      </div>
    </div>
  );
};

export default DraggableButtonRow;
