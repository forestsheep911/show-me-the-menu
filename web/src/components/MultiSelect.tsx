"use client";

import { useState, useRef, useEffect, useCallback, useLayoutEffect } from "react";
import { createPortal } from "react-dom";
import { X, MoreHorizontal, GripVertical, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { INGREDIENT_COLORS, IngredientColorName } from "@/types/menu";
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
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

export interface MultiSelectOption {
  name: string;
  color: IngredientColorName;
}

interface MultiSelectProps {
  options: MultiSelectOption[];
  selected: string[];
  onChange: (selected: string[]) => void;
  onCreateOption?: (name: string, color?: IngredientColorName) => void;
  onDeleteOption?: (name: string) => void;
  onUpdateOption?: (oldName: string, updates: Partial<MultiSelectOption>) => void;
  onReorderOptions?: (options: MultiSelectOption[]) => void;
  placeholder?: string;
  className?: string;
}

// Portal menu component for option editing
function OptionMenu({
  option,
  anchorRect,
  editValue,
  setEditValue,
  onSave,
  onDelete,
  onColorChange,
  onClose,
}: {
  option: MultiSelectOption;
  anchorRect: DOMRect;
  editValue: string;
  setEditValue: (value: string) => void;
  onSave: () => void;
  onDelete?: () => void;
  onColorChange: (color: IngredientColorName) => void;
  onClose: () => void;
}) {
  const menuRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ top: 0, left: 0 });

  // Calculate position after mount to get actual menu dimensions
  useLayoutEffect(() => {
    if (!menuRef.current) return;

    const menuRect = menuRef.current.getBoundingClientRect();
    const menuWidth = menuRect.width || 200;
    const menuHeight = menuRect.height || 350;
    const padding = 8;

    let left = anchorRect.right + padding;
    let top = anchorRect.top;

    // Check if menu would overflow right edge - show on left instead
    if (left + menuWidth > window.innerWidth - padding) {
      left = anchorRect.left - menuWidth - padding;
    }

    // If still overflows left, center it
    if (left < padding) {
      left = Math.max(padding, (window.innerWidth - menuWidth) / 2);
    }

    // Check if menu would overflow bottom edge
    if (top + menuHeight > window.innerHeight - padding) {
      top = window.innerHeight - menuHeight - padding;
    }

    // Ensure top is not negative
    if (top < padding) {
      top = padding;
    }

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPosition({ top, left });
  }, [anchorRect]);

  // Lock body scroll when menu is open
  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    const originalPaddingRight = document.body.style.paddingRight;

    // Get scrollbar width to prevent layout shift
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;

    document.body.style.overflow = "hidden";
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }

    return () => {
      document.body.style.overflow = originalOverflow;
      document.body.style.paddingRight = originalPaddingRight;
    };
  }, []);

  // Prevent wheel events from propagating to body
  const handleWheel = (e: React.WheelEvent) => {
    e.stopPropagation();
  };

  return createPortal(
    <>
      {/* Backdrop to capture clicks and prevent scroll */}
      <div
        className="fixed inset-0 z-[9998]"
        onMouseDown={(e) => {
          e.stopPropagation();
          onClose();
        }}
        onWheel={(e) => e.preventDefault()}
      />
      <div
        ref={menuRef}
        className="fixed w-[200px] bg-white rounded-lg shadow-xl border z-[9999] py-1 max-h-[80vh] overflow-y-auto"
        style={{ top: position.top, left: position.left }}
        onWheel={handleWheel}
        onMouseDown={(e) => e.stopPropagation()}
      >
        {/* Rename input */}
        <div className="px-2 py-1.5 border-b" onClick={(e) => e.stopPropagation()}>
          <input
            type="text"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                onSave();
                onClose();
              }
              if (e.key === "Escape") {
                onClose();
              }
            }}
            className="w-full px-2 py-1 text-sm border rounded focus:outline-none focus:ring-1 focus:ring-blue-400"
            placeholder="重命名"
            autoFocus
          />
        </div>

        {/* Delete button */}
        {onDelete && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              onDelete();
            }}
            className="w-full px-3 py-1.5 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
          >
            <Trash2 className="size-3.5" />
            删除
          </button>
        )}

        {/* Color picker */}
        <div className="px-2 py-1.5 border-t">
          <div className="text-xs text-gray-500 mb-2">颜色</div>
          <div className="space-y-1">
            {(Object.keys(INGREDIENT_COLORS) as IngredientColorName[]).map((colorName) => {
              const c = INGREDIENT_COLORS[colorName];
              const isSelected = option.color === colorName;
              return (
                <button
                  key={colorName}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    onColorChange(colorName);
                  }}
                  className={cn(
                    "w-full flex items-center gap-2 px-2 py-1 rounded text-sm hover:bg-gray-100 transition-colors",
                    isSelected && "bg-gray-100"
                  )}
                >
                  <span
                    className="w-4 h-4 rounded"
                    style={{ backgroundColor: c.bg }}
                  />
                  <span className="capitalize text-gray-700">
                    {colorName === "default" ? "Default" : colorName.charAt(0).toUpperCase() + colorName.slice(1)}
                  </span>
                  {isSelected && <span className="ml-auto text-blue-500">✓</span>}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </>,
    document.body
  );
}

// Sortable option item component
function SortableOptionItem({
  option,
  isSelected,
  onToggle,
  onUpdate,
  onDelete,
}: {
  option: MultiSelectOption;
  isSelected: boolean;
  onToggle: () => void;
  onUpdate?: (updates: Partial<MultiSelectOption>) => void;
  onDelete?: () => void;
}) {
  const [showMenu, setShowMenu] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(option.name);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [menuAnchorRect, setMenuAnchorRect] = useState<DOMRect | null>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: option.name });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const colors = INGREDIENT_COLORS[option.color] || INGREDIENT_COLORS.default;

  // Focus input when editing
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);



  const handleSaveEdit = () => {
    const trimmed = editValue.trim();
    if (trimmed && trimmed !== option.name && onUpdate) {
      onUpdate({ name: trimmed });
    }
    setIsEditing(false);
    setEditValue(option.name);
  };

  const handleColorChange = (color: IngredientColorName) => {
    if (onUpdate) {
      onUpdate({ color });
    }
    setShowMenu(false);
  };

  const handleOpenMenu = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (menuButtonRef.current) {
      setMenuAnchorRect(menuButtonRef.current.getBoundingClientRect());
      setShowMenu(true);
    }
  };

  const handleCloseMenu = () => {
    setShowMenu(false);
    // Save any pending edit when closing
    const trimmed = editValue.trim();
    if (trimmed && trimmed !== option.name && onUpdate) {
      onUpdate({ name: trimmed });
    }
  };

  return (
    <>
      <div
        ref={setNodeRef}
        style={style}
        className={cn(
          "group flex items-center gap-1 px-1 py-1 rounded hover:bg-gray-100 transition-colors",
          isDragging && "opacity-50 bg-gray-100"
        )}
      >
        {/* Drag handle */}
        <button
          type="button"
          className="cursor-grab opacity-0 group-hover:opacity-50 hover:!opacity-100 p-0.5"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="size-3.5 text-gray-400" />
        </button>

        {/* Option content */}
        {isEditing ? (
          <input
            ref={inputRef}
            type="text"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onBlur={handleSaveEdit}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSaveEdit();
              if (e.key === "Escape") {
                setIsEditing(false);
                setEditValue(option.name);
              }
            }}
            className="flex-1 px-2 py-0.5 text-sm border rounded focus:outline-none focus:ring-1 focus:ring-blue-400"
            onClick={(e) => e.stopPropagation()}
          />
        ) : (
          <button
            type="button"
            onClick={onToggle}
            className="flex-1 flex items-center gap-2"
          >
            <span
              className="px-2 py-0.5 text-xs rounded-sm"
              style={{ backgroundColor: colors.bg, color: colors.text }}
            >
              {option.name}
            </span>
            {isSelected && (
              <span className="text-blue-500 text-xs">✓</span>
            )}
          </button>
        )}

        {/* Menu button */}
        <button
          ref={menuButtonRef}
          type="button"
          onClick={handleOpenMenu}
          className="opacity-0 group-hover:opacity-50 hover:!opacity-100 p-0.5 rounded hover:bg-gray-200"
        >
          <MoreHorizontal className="size-3.5 text-gray-500" />
        </button>

        {/* Portal menu */}
        {showMenu && menuAnchorRect && (
          <OptionMenu
            option={option}
            anchorRect={menuAnchorRect}
            editValue={editValue}
            setEditValue={setEditValue}
            onSave={handleSaveEdit}
            onDelete={onDelete ? () => {
              setShowMenu(false);
              setShowDeleteConfirm(true);
            } : undefined}
            onColorChange={handleColorChange}
            onClose={handleCloseMenu}
          />
        )}
      </div>

      {/* Delete confirmation dialog */}
      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认删除</AlertDialogTitle>
            <AlertDialogDescription>
              确定要删除「{option.name}」吗？此操作将同时从所有菜品中移除该食材。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => onDelete?.()}
              className="bg-red-600 hover:bg-red-700"
            >
              删除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

export function MultiSelect({
  options,
  selected,
  onChange,
  onCreateOption,
  onDeleteOption,
  onUpdateOption,
  onReorderOptions,
  placeholder = "选择或创建...",
  className,
}: MultiSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Filter options based on input
  const filteredOptions = options.filter((opt) =>
    opt.name.toLowerCase().includes(inputValue.toLowerCase())
  );

  // Check if can create new option
  const canCreate = inputValue.trim() &&
    !options.some((opt) => opt.name.toLowerCase() === inputValue.trim().toLowerCase());

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleToggleOption = useCallback((name: string) => {
    if (selected.includes(name)) {
      onChange(selected.filter((s) => s !== name));
    } else {
      onChange([...selected, name]);
    }
    setInputValue("");
  }, [selected, onChange]);

  const handleCreate = useCallback(() => {
    const trimmed = inputValue.trim();
    if (trimmed && onCreateOption) {
      onCreateOption(trimmed);
      onChange([...selected, trimmed]);
      setInputValue("");
    }
  }, [inputValue, onCreateOption, onChange, selected]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && canCreate) {
      e.preventDefault();
      handleCreate();
    } else if (e.key === "Backspace" && !inputValue && selected.length > 0) {
      // Remove last selected item
      onChange(selected.slice(0, -1));
    } else if (e.key === "Escape") {
      setIsOpen(false);
      inputRef.current?.blur();
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = options.findIndex((o) => o.name === active.id);
      const newIndex = options.findIndex((o) => o.name === over.id);
      const newOptions = arrayMove(options, oldIndex, newIndex);
      onReorderOptions?.(newOptions);
    }
  };

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      {/* Input area with selected tags */}
      <div
        className={cn(
          "flex flex-wrap items-center gap-1 min-h-[32px] px-2 py-1 border rounded-md bg-white cursor-text",
          isOpen && "ring-2 ring-blue-200 border-blue-400"
        )}
        onClick={() => {
          setIsOpen(true);
          inputRef.current?.focus();
        }}
      >
        {/* Selected tags */}
        {selected.map((name) => {
          const option = options.find((o) => o.name === name);
          const colors = INGREDIENT_COLORS[option?.color || "default"];
          return (
            <span
              key={name}
              className="inline-flex items-center gap-0.5 px-1.5 py-0.5 text-xs rounded-sm"
              style={{ backgroundColor: colors.bg, color: colors.text }}
            >
              {name}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onChange(selected.filter((s) => s !== name));
                }}
                className="hover:opacity-70"
              >
                <X className="size-3" />
              </button>
            </span>
          );
        })}

        {/* Input */}
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={(e) => {
            setInputValue(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={selected.length === 0 ? placeholder : ""}
          className="flex-1 min-w-[60px] outline-none text-sm bg-transparent"
        />
      </div>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg shadow-lg border z-50 max-h-64 overflow-y-auto">
          {/* Create option */}
          {canCreate && (
            <button
              type="button"
              onClick={handleCreate}
              className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 border-b flex items-center gap-2"
            >
              <span className="text-gray-500">创建</span>
              <span
                className="px-1.5 py-0.5 text-xs rounded-sm"
                style={{
                  backgroundColor: INGREDIENT_COLORS.default.bg,
                  color: INGREDIENT_COLORS.default.text
                }}
              >
                {inputValue.trim()}
              </span>
            </button>
          )}

          {/* Hint */}
          <div className="px-3 py-1.5 text-xs text-gray-400 border-b">
            选择一个选项或创建新选项
          </div>

          {/* Options list with drag and drop */}
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={filteredOptions.map((o) => o.name)}
              strategy={verticalListSortingStrategy}
            >
              <div className="py-1">
                {filteredOptions.length === 0 && !canCreate ? (
                  <div className="px-3 py-2 text-sm text-gray-400 text-center">
                    无匹配选项
                  </div>
                ) : (
                  filteredOptions.map((option) => (
                    <SortableOptionItem
                      key={option.name}
                      option={option}
                      isSelected={selected.includes(option.name)}
                      onToggle={() => handleToggleOption(option.name)}
                      onUpdate={onUpdateOption ? (updates) => onUpdateOption(option.name, updates) : undefined}
                      onDelete={onDeleteOption ? () => onDeleteOption(option.name) : undefined}
                    />
                  ))
                )}
              </div>
            </SortableContext>
          </DndContext>
        </div>
      )}
    </div>
  );
}
