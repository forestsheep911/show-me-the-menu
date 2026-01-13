"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { MenuEntry, Dish, Tag } from "@/types/menu";
import { cn } from "@/lib/utils";
import { Trash2, Copy, RefreshCw, MoreHorizontal } from "lucide-react";
import { DishSelector } from "./DishSelector";
import {
    ContextMenu,
    ContextMenuContent,
    ContextMenuItem,
    ContextMenuSeparator,
    ContextMenuTrigger,
} from "@/components/ui/context-menu";

interface DishCardProps {
    entry: MenuEntry;
    dayIndex: number;
    dish?: Dish;
    tags: Tag[];
    onUpdateDish: (dishName: string) => void;
    onRemove: () => void;
    onDuplicate?: () => void;
    onRandomize?: () => void;
    isDragOverlay?: boolean;
}

export function DishCard({
    entry,
    dayIndex,
    dish,
    tags,
    onUpdateDish,
    onRemove,
    onDuplicate,
    onRandomize,
    isDragOverlay = false,
}: DishCardProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
        isOver,
    } = useSortable({
        id: entry.id,
        data: {
            type: "dish",
            entry,
            dayIndex,
        },
    });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    const dishTags = dish?.tags ?? [];

    if (isDragOverlay) {
        return (
            <div
                className="rounded-xl border-2 border-blue-400 p-3 shadow-xl bg-white/95 backdrop-blur-sm cursor-grabbing"
                style={{ width: 280 }}
            >
                <div className="flex items-start justify-between gap-3 mb-2">
                    <span className="text-sm font-medium">
                        {entry.dishName || "点击选择菜品"}
                    </span>
                </div>
                {dishTags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                        {dishTags.map((tagName: string) => {
                            const tagInfo = tags.find((t) => t.name === tagName);
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
    }

    return (
        <ContextMenu modal={false}>
            <ContextMenuTrigger asChild>
                <div className="relative">
                    {/* Drop indicator - 蓝色横线指示插入位置 */}
                    {isOver && !isDragging && (
                        <div className="absolute -top-1.5 left-0 right-0 z-10">
                            <div className="relative h-0.5 w-full bg-blue-500 rounded-full shadow-sm">
                                <div className="absolute left-0 top-1/2 -translate-y-1/2 size-2.5 bg-blue-500 rounded-full -translate-x-1" />
                                <div className="absolute right-0 top-1/2 -translate-y-1/2 size-2.5 bg-blue-500 rounded-full translate-x-1" />
                            </div>
                        </div>
                    )}
                    <div
                        ref={setNodeRef}
                        style={style}
                        {...attributes}
                        {...listeners}
                        className={cn(
                            "rounded-xl border border-gray-100 p-3 shadow-[inset_0_0_0_1px_rgba(0,0,0,0.02)] bg-white/70 transition-all duration-200 touch-none cursor-grab active:cursor-grabbing",
                            isDragging && "opacity-40 scale-[0.98] border-dashed border-gray-300",
                            isOver && !isDragging && "mt-2"
                        )}
                    >
                        <div className="flex items-start justify-between gap-3 mb-2">
                            <div className="flex-1 min-w-0">
                                <DishSelector
                                    entryTags={entry.tags}
                                    currentDish={entry.dishName || "点击选择菜品"}
                                    onSelect={onUpdateDish}
                                />
                            </div>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onRemove();
                                }}
                                onPointerDown={(e) => e.stopPropagation()}
                                className="text-gray-400 hover:text-red-500 transition-colors shrink-0"
                                aria-label="删除菜品"
                            >
                                <Trash2 className="size-4" />
                            </button>
                        </div>
                        {dishTags.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                                {dishTags.map((tagName: string) => {
                                    const tagInfo = tags.find((t) => t.name === tagName);
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
                </div>
            </ContextMenuTrigger>
            <ContextMenuContent className="w-48">
                <ContextMenuItem
                    onClick={() => onDuplicate?.()}
                    disabled={!onDuplicate}
                >
                    <Copy className="size-4" />
                    复制菜品
                </ContextMenuItem>
                <ContextMenuItem
                    onClick={() => {
                        onRandomize?.();
                    }}
                >
                    <RefreshCw className="size-4" />
                    随机换一个
                </ContextMenuItem>
                <ContextMenuSeparator />
                <ContextMenuItem
                    variant="destructive"
                    onClick={() => onRemove()}
                >
                    <Trash2 className="size-4" />
                    删除菜品
                </ContextMenuItem>
            </ContextMenuContent>
        </ContextMenu>
    );
}


// Simplified version for drop indicator
interface DropIndicatorProps {
    isVisible: boolean;
}

export function DropIndicator({ isVisible }: DropIndicatorProps) {
    if (!isVisible) return null;

    return (
        <div className="relative h-1 w-full my-1">
            <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-0.5 bg-blue-500 rounded-full" />
            <div className="absolute left-0 top-1/2 -translate-y-1/2 size-2 bg-blue-500 rounded-full -translate-x-1/2" />
            <div className="absolute right-0 top-1/2 -translate-y-1/2 size-2 bg-blue-500 rounded-full translate-x-1/2" />
        </div>
    );
}
