"use client";

import { useState } from "react";
import { DayMenu, Dish, Tag } from "@/types/menu";
import { cn } from "@/lib/utils";
import { useMenuStore, SOFT_CARD_COLORS } from "@/store/menuStore";
import { DishSelector } from "./DishSelector";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Trash2 } from "lucide-react";
import { Button } from "./ui/button";
import { HexColorPicker, HexColorInput } from "react-colorful";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface DayCardProps {
  menu: DayMenu;
  index: number; // Day index (0-4)
  className?: string;
}

export function DayCard({ menu, index, className }: DayCardProps) {
  const updateEntryDish = useMenuStore((state: { updateEntryDish: (dayIndex: number, entryId: string, dishName: string) => void }) => state.updateEntryDish);
  const addMenuEntry = useMenuStore((state: { addMenuEntry: (dayIndex: number, tags?: string[]) => void }) => state.addMenuEntry);
  const removeMenuEntry = useMenuStore((state: { removeMenuEntry: (dayIndex: number, entryId: string) => void }) => state.removeMenuEntry);
  const updateDayColor = useMenuStore((state: { updateDayColor: (dayIndex: number, color: string) => void }) => state.updateDayColor);
  const dishes = useMenuStore((state: { dishes: Dish[] }) => state.dishes);
  const tags = useMenuStore((state: { tags: Tag[] }) => state.tags);

  const [colorPickerOpen, setColorPickerOpen] = useState(false);
  const [tempColor, setTempColor] = useState(menu.color);

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

  const handleHeaderClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setTempColor(menu.color);
    setColorPickerOpen(true);
  };

  const handleColorChange = (color: string) => {
    setTempColor(color);
    updateDayColor(index, color);
  };

  const handlePresetClick = (color: string) => {
    setTempColor(color);
    updateDayColor(index, color);
  };

  return (
    <>
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
          className="p-4 text-center text-white font-bold text-lg cursor-pointer hover:opacity-90 transition-opacity"
          style={{ backgroundColor: menu.color }}
          onClick={handleHeaderClick}
          onPointerDown={(e) => e.stopPropagation()}
          title="点击更换颜色"
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
                {dishTags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {dishTags.map((tagName: string) => {
                      const tagList = Array.isArray(tags) ? tags : [];
                      const tagInfo = tagList.find((t: Tag) => t.name === tagName);
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
                    })}
                  </div>
                )}
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

      {/* 颜色选择器对话框 */}
      <Dialog open={colorPickerOpen} onOpenChange={setColorPickerOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>选择 {menu.day} 卡片颜色</DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            {/* 颜色预览 */}
            <div className="flex items-center gap-4">
              <div
                className="w-12 h-12 rounded-lg border shadow-inner"
                style={{ backgroundColor: tempColor }}
              />
              <div className="flex-1">
                <HexColorInput
                  color={tempColor}
                  onChange={handleColorChange}
                  prefixed
                  className="w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 uppercase"
                />
              </div>
            </div>

            {/* 预设颜色 */}
            <div>
              <div className="text-sm font-medium text-gray-500 mb-3">预设颜色</div>
              <div className="grid grid-cols-5 gap-2">
                {SOFT_CARD_COLORS.map((color) => (
                  <button
                    key={color}
                    onClick={() => handlePresetClick(color)}
                    className={`w-10 h-10 rounded-lg border-2 transition-all hover:scale-110 ${tempColor === color
                        ? "border-gray-800 ring-2 ring-gray-400"
                        : "border-transparent hover:border-gray-300"
                      }`}
                    style={{ backgroundColor: color }}
                    title={color}
                  />
                ))}
              </div>
            </div>

            {/* 自定义颜色选择器 */}
            <div className="color-picker-wrapper">
              <div className="text-sm font-medium text-gray-500 mb-3">自定义颜色</div>
              <HexColorPicker
                color={tempColor}
                onChange={handleColorChange}
                className="!w-full"
              />
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* 颜色选择器样式 */}
      <style jsx global>{`
        .color-picker-wrapper .react-colorful {
          width: 100% !important;
          height: 180px;
        }
        .color-picker-wrapper .react-colorful__saturation {
          border-radius: 8px 8px 0 0;
        }
        .color-picker-wrapper .react-colorful__hue {
          height: 18px;
          border-radius: 0 0 8px 8px;
        }
        .color-picker-wrapper .react-colorful__saturation-pointer,
        .color-picker-wrapper .react-colorful__hue-pointer {
          width: 20px;
          height: 20px;
        }
      `}</style>
    </>
  );
}
