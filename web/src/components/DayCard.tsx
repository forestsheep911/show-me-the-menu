"use client";

import { useState, useRef, useEffect } from "react";
import { DayMenu, Dish, Tag } from "@/types/menu";
import { cn } from "@/lib/utils";
import { useMenuStore, SOFT_CARD_COLORS } from "@/store/menuStore";
import { DishCard } from "./DishCard";
import { useDroppable } from "@dnd-kit/core";
import { Trash2, Lock, Unlock, Plus, NotebookPen, X, Pencil } from "lucide-react";
import { HexColorPicker, HexColorInput } from "react-colorful";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface AutoResizeTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
}

function AutoResizeTextarea({ value, onChange, ...props }: AutoResizeTextareaProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [value]);

  return (
    <textarea
      ref={textareaRef}
      value={value}
      onChange={onChange}
      rows={1}
      {...props}
    />
  );
}

interface DayCardProps {
  menu: DayMenu;
  index: number; // Day index (0-4)
  className?: string;
  isDropTarget?: boolean;
}

export function DayCard({ menu, index, className, isDropTarget = false }: DayCardProps) {
  const updateEntryDish = useMenuStore((state) => state.updateEntryDish);
  const addMenuEntry = useMenuStore((state) => state.addMenuEntry);
  const duplicateMenuEntry = useMenuStore((state) => state.duplicateMenuEntry);
  const randomizeMenuEntry = useMenuStore((state) => state.randomizeMenuEntry);
  const removeMenuEntry = useMenuStore((state) => state.removeMenuEntry);
  const updateDayColor = useMenuStore((state) => state.updateDayColor);
  const toggleDayLock = useMenuStore((state) => state.toggleDayLock);
  const updateDayNote = useMenuStore((state) => state.updateDayNote);
  const updateDayName = useMenuStore((state) => state.updateDayName);
  const removeDayCard = useMenuStore((state) => state.removeDayCard);
  const weeklyMenu = useMenuStore((state) => state.weeklyMenu);
  const dishes = useMenuStore((state) => state.dishes);
  const tags = useMenuStore((state) => state.tags);

  const [colorPickerOpen, setColorPickerOpen] = useState(false);
  const [tempColor, setTempColor] = useState(menu.color);
  const [isEditingName, setIsEditingName] = useState(false);
  const [editingName, setEditingName] = useState(menu.day);
  const nameInputRef = useRef<HTMLInputElement>(null);

  // Droppable for the day container (for empty days or dropping at end)
  const { setNodeRef: setDroppableRef, isOver } = useDroppable({
    id: `day-container-${index}`,
    data: {
      type: "day-container",
      dayIndex: index,
    },
  });

  // Droppable for the end of the list (allows dropping at the bottom)
  const { setNodeRef: setEndZoneRef, isOver: isOverEndZone } = useDroppable({
    id: `day-end-zone-${index}`,
    data: {
      type: "day-end-zone",
      dayIndex: index,
    },
  });

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

  const handleNameDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingName(menu.day);
    setIsEditingName(true);
    setTimeout(() => nameInputRef.current?.select(), 0);
  };

  const handleNameBlur = () => {
    const trimmedName = editingName.trim();
    if (trimmedName && trimmedName !== menu.day) {
      updateDayName(index, trimmedName);
    } else {
      setEditingName(menu.day);
    }
    setIsEditingName(false);
  };

  const handleNameKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleNameBlur();
    } else if (e.key === "Escape") {
      setEditingName(menu.day);
      setIsEditingName(false);
    }
  };

  return (
    <>
      <div
        suppressHydrationWarning
        style={{ borderColor: isDropTarget || isOver ? "#3b82f6" : menu.color }}
        className={cn(
          "bg-white rounded-[20px] shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden border-2 select-none flex flex-col",
          isDropTarget || isOver ? "ring-2 ring-blue-400 ring-offset-2 shadow-lg" : "",
          className
        )}
      >
        <div
          className="relative px-3 py-3 flex items-center justify-between text-white font-bold"
          style={{ backgroundColor: menu.color }}
        >
          {/* Left: Add & Note Actions */}
          <div className="flex items-center gap-1 z-10">
            <button
              onClick={(e) => {
                e.stopPropagation();
                addMenuEntry(index);
              }}
              className="p-1.5 hover:bg-black/10 rounded-full transition-colors"
              title="添加菜品"
            >
              <Plus className="size-5" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (menu.note !== undefined) {
                  // If note exists, delete it (set to undefined)
                  updateDayNote(index, undefined);
                } else {
                  // If note doesn't exist, create it (set to empty string)
                  updateDayNote(index, "");
                }
              }}
              className="p-1.5 hover:bg-black/10 rounded-full transition-colors"
              title={menu.note !== undefined ? "删除备注" : "添加备注"}
            >
              {menu.note !== undefined ? (
                <Trash2 className="size-5" />
              ) : (
                <NotebookPen className="size-5" />
              )}
            </button>
          </div>

          {/* Center: Title (Color Picker trigger / Editable) */}
          {isEditingName ? (
            <input
              ref={nameInputRef}
              type="text"
              value={editingName}
              onChange={(e) => setEditingName(e.target.value)}
              onBlur={handleNameBlur}
              onKeyDown={handleNameKeyDown}
              className="absolute left-1/2 -translate-x-1/2 text-lg text-center bg-white/20 rounded px-2 py-0.5 outline-none border border-white/40 focus:border-white text-white font-bold max-w-[140px]"
              autoFocus
              onClick={(e) => e.stopPropagation()}
              onPointerDown={(e) => e.stopPropagation()}
            />
          ) : (
            <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-1">
              <span
                className="text-lg cursor-pointer hover:opacity-80 transition-opacity select-none"
                onClick={handleHeaderClick}
                title="点击更换颜色"
              >
                {menu.day}
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleNameDoubleClick(e);
                }}
                className="p-1 hover:bg-black/10 rounded-full transition-colors"
                title="编辑名称"
              >
                <Pencil className="size-4 text-white/70 hover:text-white" />
              </button>
            </div>
          )}

          {/* Right: Lock & Delete Actions */}
          <div className="flex items-center gap-1 z-10">
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleDayLock(index);
              }}
              className="p-1.5 hover:bg-black/10 rounded-full transition-colors"
              title={menu.locked ? "已锁定 (不会被随机生成覆盖)" : "未锁定 (点击锁定)"}
            >
              {menu.locked ? (
                <Lock className="size-5 text-white/90" />
              ) : (
                <Unlock className="size-5 text-white/50 hover:text-white/90" />
              )}
            </button>
            {weeklyMenu.length > 1 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (window.confirm(`确定要删除「${menu.day}」吗？`)) {
                    removeDayCard(index);
                  }
                }}
                className="p-1.5 hover:bg-black/10 rounded-full transition-colors"
                title="删除卡片"
              >
                <X className="size-5 text-white/50 hover:text-white/90" />
              </button>
            )}
          </div>
        </div>

        <div
          ref={setDroppableRef}
          className={cn(
            "p-4 flex-1 flex flex-col gap-3 min-h-[120px] transition-colors duration-200",
            (isDropTarget || isOver) && "bg-blue-50/50"
          )}
        >
          {(menu.entries ?? []).map((entry) => {
            const dishList = Array.isArray(dishes) ? dishes : [];
            const dish = dishList.find((d: Dish) => d.name === entry.dishName);

            return (
              <DishCard
                key={entry.id}
                entry={entry}
                dayIndex={index}
                dish={dish}
                tags={tags}
                onUpdateDish={(newDish) => updateEntryDish(index, entry.id, newDish)}
                onRemove={() => removeMenuEntry(index, entry.id)}
                onDuplicate={() => duplicateMenuEntry(index, entry.id)}
                onRandomize={() => randomizeMenuEntry(index, entry.id)}
              />
            );
          })}

          {/* Empty state hint */}
          {menu.entries.length === 0 && (
            <div className="flex-1 flex items-center justify-center text-gray-300 text-sm">
              点击 + 添加菜品
            </div>
          )}

          {/* Drop zone for adding to end of list */}
          {menu.entries.length > 0 && (
            <div
              ref={setEndZoneRef}
              className={cn(
                "min-h-[24px] rounded-lg transition-all duration-200 relative",
                isOverEndZone && "min-h-[32px]"
              )}
            >
              {/* Drop indicator line at the end */}
              {isOverEndZone && (
                <div className="absolute top-1 left-0 right-0 z-10">
                  <div className="relative h-0.5 w-full bg-blue-500 rounded-full shadow-sm">
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 size-2.5 bg-blue-500 rounded-full -translate-x-1" />
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 size-2.5 bg-blue-500 rounded-full translate-x-1" />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Note Area */}
          {menu.note !== undefined && (
            <div className="mt-auto pt-2 border-t border-dashed border-gray-200">
              <AutoResizeTextarea
                value={menu.note}
                onChange={(e) => updateDayNote(index, e.target.value)}
                placeholder="写点备注..."
                className="w-full text-sm text-gray-600 bg-transparent border-none resize-none focus:ring-0 px-1 py-1 min-h-[40px] overflow-hidden placeholder:text-gray-300"
                onPointerDown={(e) => e.stopPropagation()}
              />
            </div>
          )}
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
