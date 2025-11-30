import { DayMenu } from "@/types/menu";
import { cn } from "@/lib/utils";
import { useMenuStore } from "@/store/menuStore";
import { DishSelector } from "./DishSelector";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface DayCardProps {
  menu: DayMenu;
  index: number; // Day index (0-4)
  className?: string;
}

const CATEGORY_ORDER = ['大荤', '小荤', '蔬菜', '汤', '主食'];

export function DayCard({ menu, index, className }: DayCardProps) {
  const updateDayItem = useMenuStore((state) => state.updateDayItem);
  
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
      
      <div className="p-4 cursor-default" onPointerDown={(e) => e.stopPropagation()}> 
        {/* Stop propagation so clicking inside doesn't trigger drag */}
        
        {CATEGORY_ORDER.map((category) => {
          const item = menu.items[category];
          if (!item) return null;
          
          return (
            <div key={category} className="mb-3 border-b border-dashed border-gray-100 pb-2 last:border-0 last:mb-0 last:pb-0">
              <span className="block text-xs text-gray-400 mb-[2px]">{category}</span>
              <DishSelector 
                category={category}
                currentDish={item}
                onSelect={(newDish) => updateDayItem(index, category, newDish)}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
