import { DayMenu } from "@/types/menu";
import { cn } from "@/lib/utils";
import { useMenuStore } from "@/store/menuStore";
import { DishSelector } from "./DishSelector";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Trash2 } from "lucide-react";
import { Button } from "./ui/button";

interface DayCardProps {
  menu: DayMenu;
  index: number; // Day index (0-4)
  className?: string;
}

export function DayCard({ menu, index, className }: DayCardProps) {
  const updateEntryDish = useMenuStore((state) => state.updateEntryDish);
  const addMenuEntry = useMenuStore((state) => state.addMenuEntry);
  const removeMenuEntry = useMenuStore((state) => state.removeMenuEntry);
  const dishes = useMenuStore((state) => state.dishes);
  const tags = useMenuStore((state) => state.tags);

  // dnd-kit hook for sortable items
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: menu.day });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 1,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div 
      ref={setNodeRef}
      suppressHydrationWarning
      style={{ ...style, borderColor: menu.color }}
      className={cn(
        "bg-white rounded-[20px] shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden border-2 border-transparent select-none flex flex-col",
        isDragging ? "shadow-2xl scale-105 cursor-grabbing" : "cursor-grab",
        className
      )}
      {...attributes}
      {...listeners}
    >
      <div 
        className="p-4 text-center text-white font-bold text-lg"
        style={{ backgroundColor: menu.color }}
      >
        <div>{menu.day}</div>
      </div>
      
      <div className="p-4 cursor-default flex-1 flex flex-col gap-4" onPointerDown={(e) => e.stopPropagation()}> 
        {/* Stop propagation so clicking inside doesn't trigger drag */}
        {(menu.entries ?? []).map((entry) => {
          const dishList = Array.isArray(dishes) ? dishes : [];
          const dish = dishList.find((d) => d.name === entry.dishName);
          const dishTags = dish?.tags ?? [];

          return (
            <div
              key={entry.id}
              className="rounded-xl border border-gray-100 p-3 shadow-[inset_0_0_0_1px_rgba(0,0,0,0.02)] bg-white/70"
            >
              <div className="flex items-start justify-between gap-3 mb-2">
                <DishSelector
                  entryTags={entry.tags}
                  currentDish={entry.dishName || "点击选择菜品"}
                  onSelect={(newDish) => updateEntryDish(index, entry.id, newDish)}
                />
                <button
                  onClick={() => removeMenuEntry(index, entry.id)}
                  className="text-gray-400 hover:text-red-500 transition-colors shrink-0"
                  aria-label="删除菜品"
                >
                  <Trash2 className="size-4" />
                </button>
              </div>
              <div className="flex flex-wrap gap-1">
                {dishTags.length > 0 ? (
                  dishTags.map((tagName) => {
                    const tagList = Array.isArray(tags) ? tags : [];
                    const tagInfo = tagList.find((t) => t.name === tagName);
                    const tagColor = tagInfo?.color ?? "#6b7280";
                    return (
                      <span
                        key={tagName}
                        className="px-2 py-0.5 text-xs rounded-full text-white"
                        style={{ backgroundColor: tagColor }}
                      >
                        {tagName}
                      </span>
                    );
                  })
                ) : (
                  <span className="text-xs text-gray-400">
                    {entry.dishName ? "该菜暂未设置标签" : "等待选择菜品"}
                  </span>
                )}
              </div>
            </div>
          );
        })}

        <Button
          variant="secondary"
          className="w-full border-dashed border-2 border-gray-200 text-gray-500 hover:text-[#ff7043] hover:border-[#ff7043]/50"
          onClick={() => addMenuEntry(index)}
        >
          + 添加菜品
        </Button>
      </div>
    </div>
  );
}
