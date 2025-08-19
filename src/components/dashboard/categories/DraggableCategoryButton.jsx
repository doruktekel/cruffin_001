import { Grip, Trash2 } from "lucide-react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Input } from "@/components/ui/input"; // shadcn input
import { Button } from "@/components/ui/button"; // shadcn button

const DraggableCategoryButton = ({
  id,
  name,
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
    id: id, // Artık doğru id gelecek
  });

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
      className="flex items-center gap-4 p-3 mb-2 bg-gray-100 dark:bg-gray-900 rounded-lg relative"
    >
      <div
        className="flex items-center gap-4 cursor-grab active:cursor-grabbing"
        {...attributes}
        {...listeners}
      >
        <Grip size={20} />
      </div>

      <Input
        ref={inputRef}
        type="text"
        className="p-1 border rounded-md bg-white dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:placeholder:text-gray-400 flex-grow"
        placeholder="Kategori adını giriniz..."
        value={name || ""}
        onChange={onChange}
        onPointerDown={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}
      />

      <Button
        type="button"
        variant="outline"
        onClick={onDelete} // Bu artık parent'dan gelen handleDeleteCategory fonksiyonu
        className="p-2 cursor-pointer hover:bg-red-50 hover:border-red-300 hover:text-red-600 dark:hover:bg-red-950 dark:hover:border-red-700 dark:hover:text-red-400 transition-colors"
      >
        <Trash2 size={20} />
      </Button>
    </div>
  );
};

export default DraggableCategoryButton;
