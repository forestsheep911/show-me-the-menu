"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { X, Plus, Search, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Tag } from "@/types/menu";
import { HexColorPicker } from "react-colorful";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
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

// 预设标签颜色
const PRESET_TAG_COLORS = [
    "#6b7280", // gray
    "#ef4444", // red
    "#f97316", // orange  
    "#eab308", // yellow
    "#22c55e", // green
    "#14b8a6", // teal
    "#3b82f6", // blue
    "#8b5cf6", // violet
    "#ec4899", // pink
    "#78716c", // stone
];

interface TagSelectorProps {
    tags: Tag[];
    selected: string[];
    onChange: (selected: string[]) => void;
    onCreateTag: (name: string, color: string) => void;
    onDeleteTag: (name: string) => void;
    onUpdateTag: (name: string, updates: Partial<Tag>) => void;
    placeholder?: string;
    className?: string;
}

export function TagSelector({
    tags,
    selected,
    onChange,
    onCreateTag,
    onDeleteTag,
    onUpdateTag,
    placeholder = "添加标签...",
    className,
}: TagSelectorProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [searchValue, setSearchValue] = useState("");
    const [newTagName, setNewTagName] = useState("");
    const [newTagColor, setNewTagColor] = useState(PRESET_TAG_COLORS[0]);
    const [showColorPicker, setShowColorPicker] = useState(false);
    const [editingTag, setEditingTag] = useState<string | null>(null);
    const [editTagName, setEditTagName] = useState("");
    const [editTagColor, setEditTagColor] = useState("");
    const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
    const searchInputRef = useRef<HTMLInputElement>(null);

    // Filter tags by search
    const filteredTags = tags.filter((tag) =>
        tag.name.toLowerCase().includes(searchValue.toLowerCase())
    );

    // Check if can create new tag
    const canCreate = newTagName.trim() &&
        !tags.some((t) => t.name.toLowerCase() === newTagName.trim().toLowerCase());

    // Handle tag toggle
    const handleToggle = useCallback((tagName: string) => {
        if (selected.includes(tagName)) {
            onChange(selected.filter((s) => s !== tagName));
        } else {
            onChange([...selected, tagName]);
        }
    }, [selected, onChange]);

    // Handle create new tag
    const handleCreate = () => {
        if (!canCreate) return;
        onCreateTag(newTagName.trim(), newTagColor);
        onChange([...selected, newTagName.trim()]);
        setNewTagName("");
        setNewTagColor(PRESET_TAG_COLORS[Math.floor(Math.random() * PRESET_TAG_COLORS.length)]);
    };

    // Start editing a tag
    const startEdit = (tag: Tag) => {
        setEditingTag(tag.name);
        setEditTagName(tag.name);
        setEditTagColor(tag.color);
    };

    // Save edit
    const saveEdit = () => {
        if (!editingTag || !editTagName.trim()) return;

        const updates: Partial<Tag> = {};
        const originalTag = tags.find(t => t.name === editingTag);

        if (editTagName.trim() !== editingTag) {
            updates.name = editTagName.trim();
        }
        if (originalTag && editTagColor !== originalTag.color) {
            updates.color = editTagColor;
        }

        if (Object.keys(updates).length > 0) {
            onUpdateTag(editingTag, updates);
            // Update selected if name changed
            if (updates.name && selected.includes(editingTag)) {
                onChange(selected.map(s => s === editingTag ? updates.name! : s));
            }
        }

        setEditingTag(null);
    };

    // Focus search on open
    useEffect(() => {
        if (isOpen && searchInputRef.current) {
            setTimeout(() => searchInputRef.current?.focus(), 100);
        }
    }, [isOpen]);

    return (
        <>
            <Popover open={isOpen} onOpenChange={setIsOpen}>
                <PopoverTrigger asChild>
                    <div
                        className={cn(
                            "flex flex-wrap items-center gap-1 min-h-[32px] px-2 py-1 border rounded-md bg-white cursor-pointer hover:border-gray-400 transition-colors",
                            isOpen && "ring-2 ring-blue-200 border-blue-400",
                            className
                        )}
                    >
                        {/* Selected tags */}
                        {selected.length > 0 ? (
                            selected.map((tagName) => {
                                const tag = tags.find((t) => t.name === tagName);
                                return (
                                    <span
                                        key={tagName}
                                        className="inline-flex items-center gap-0.5 px-1.5 py-0.5 text-xs rounded-sm text-white"
                                        style={{ backgroundColor: tag?.color || "#6b7280" }}
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        {tagName}
                                        <button
                                            type="button"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onChange(selected.filter((s) => s !== tagName));
                                            }}
                                            className="hover:opacity-70"
                                        >
                                            <X className="size-3" />
                                        </button>
                                    </span>
                                );
                            })
                        ) : (
                            <span className="text-sm text-gray-400">{placeholder}</span>
                        )}
                    </div>
                </PopoverTrigger>

                <PopoverContent className="w-64 p-0" align="start">
                    {/* Search */}
                    <div className="p-2 border-b">
                        <div className="relative">
                            <Search className="absolute left-2 top-1/2 -translate-y-1/2 size-3.5 text-gray-400" />
                            <input
                                ref={searchInputRef}
                                type="text"
                                placeholder="搜索标签..."
                                value={searchValue}
                                onChange={(e) => setSearchValue(e.target.value)}
                                className="w-full pl-7 pr-2 py-1.5 text-sm border rounded focus:outline-none focus:ring-1 focus:ring-blue-400"
                            />
                        </div>
                    </div>

                    {/* Tags list */}
                    <div className="max-h-48 overflow-y-auto p-1">
                        {filteredTags.length === 0 ? (
                            <div className="px-2 py-3 text-center text-sm text-gray-400">
                                {searchValue ? "无匹配标签" : "暂无标签"}
                            </div>
                        ) : (
                            filteredTags.map((tag) => {
                                const isSelected = selected.includes(tag.name);
                                const isEditing = editingTag === tag.name;

                                if (isEditing) {
                                    return (
                                        <div key={tag.name} className="p-2 space-y-2 bg-gray-50 rounded">
                                            <input
                                                type="text"
                                                value={editTagName}
                                                onChange={(e) => setEditTagName(e.target.value)}
                                                onKeyDown={(e) => {
                                                    if (e.key === "Enter") saveEdit();
                                                    if (e.key === "Escape") setEditingTag(null);
                                                }}
                                                className="w-full px-2 py-1 text-sm border rounded focus:outline-none focus:ring-1 focus:ring-blue-400"
                                                autoFocus
                                            />
                                            <div className="flex items-center gap-1 flex-wrap">
                                                {PRESET_TAG_COLORS.map((color) => (
                                                    <button
                                                        key={color}
                                                        type="button"
                                                        onClick={() => setEditTagColor(color)}
                                                        className={cn(
                                                            "w-5 h-5 rounded-sm transition-transform",
                                                            editTagColor === color && "scale-125 ring-2 ring-offset-1 ring-gray-400"
                                                        )}
                                                        style={{ backgroundColor: color }}
                                                    />
                                                ))}
                                            </div>
                                            <div className="flex justify-end gap-1">
                                                <button
                                                    type="button"
                                                    onClick={() => setEditingTag(null)}
                                                    className="px-2 py-1 text-xs text-gray-500 hover:bg-gray-200 rounded"
                                                >
                                                    取消
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={saveEdit}
                                                    className="px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
                                                >
                                                    保存
                                                </button>
                                            </div>
                                        </div>
                                    );
                                }

                                return (
                                    <div
                                        key={tag.name}
                                        className="group flex items-center justify-between px-2 py-1.5 rounded hover:bg-gray-100 cursor-pointer"
                                        onClick={() => handleToggle(tag.name)}
                                    >
                                        <div className="flex items-center gap-2">
                                            <span
                                                className="px-1.5 py-0.5 text-xs rounded-sm text-white"
                                                style={{ backgroundColor: tag.color }}
                                            >
                                                {tag.name}
                                            </span>
                                            {isSelected && (
                                                <span className="text-blue-500 text-xs">✓</span>
                                            )}
                                        </div>
                                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                type="button"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    startEdit(tag);
                                                }}
                                                className="p-1 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded"
                                                title="编辑"
                                            >
                                                <svg className="size-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                                </svg>
                                            </button>
                                            <button
                                                type="button"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setDeleteConfirm(tag.name);
                                                }}
                                                className="p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded"
                                                title="删除"
                                            >
                                                <Trash2 className="size-3" />
                                            </button>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>

                    {/* Create new tag */}
                    <div className="border-t p-2 space-y-2">
                        <div className="text-xs text-gray-500 font-medium">新建标签</div>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                placeholder="标签名称"
                                value={newTagName}
                                onChange={(e) => setNewTagName(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") handleCreate();
                                }}
                                className="flex-1 px-2 py-1 text-sm border rounded focus:outline-none focus:ring-1 focus:ring-blue-400"
                            />
                            <Popover open={showColorPicker} onOpenChange={setShowColorPicker}>
                                <PopoverTrigger asChild>
                                    <button
                                        type="button"
                                        className="w-8 h-8 rounded border-2 border-gray-200 hover:border-gray-400 transition-colors"
                                        style={{ backgroundColor: newTagColor }}
                                    />
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-3" align="end">
                                    <div className="space-y-3">
                                        <div className="grid grid-cols-5 gap-1">
                                            {PRESET_TAG_COLORS.map((color) => (
                                                <button
                                                    key={color}
                                                    type="button"
                                                    onClick={() => {
                                                        setNewTagColor(color);
                                                        setShowColorPicker(false);
                                                    }}
                                                    className={cn(
                                                        "w-6 h-6 rounded-sm transition-transform hover:scale-110",
                                                        newTagColor === color && "ring-2 ring-offset-1 ring-gray-400"
                                                    )}
                                                    style={{ backgroundColor: color }}
                                                />
                                            ))}
                                        </div>
                                        <HexColorPicker
                                            color={newTagColor}
                                            onChange={setNewTagColor}
                                            style={{ width: "100%" }}
                                        />
                                    </div>
                                </PopoverContent>
                            </Popover>
                        </div>
                        <button
                            type="button"
                            onClick={handleCreate}
                            disabled={!canCreate}
                            className={cn(
                                "w-full flex items-center justify-center gap-1 py-1.5 text-sm rounded transition-colors",
                                canCreate
                                    ? "bg-blue-500 text-white hover:bg-blue-600"
                                    : "bg-gray-100 text-gray-400 cursor-not-allowed"
                            )}
                        >
                            <Plus className="size-4" />
                            创建
                        </button>
                    </div>
                </PopoverContent>
            </Popover>

            {/* Delete Confirmation */}
            <AlertDialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>确认删除</AlertDialogTitle>
                        <AlertDialogDescription>
                            确定要删除标签「{deleteConfirm}」吗？此操作将从所有菜品中移除该标签。
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>取消</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => {
                                if (deleteConfirm) {
                                    onDeleteTag(deleteConfirm);
                                    onChange(selected.filter(s => s !== deleteConfirm));
                                    setDeleteConfirm(null);
                                }
                            }}
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
