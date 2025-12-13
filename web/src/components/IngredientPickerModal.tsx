"use client";

import { useState, useMemo, useCallback } from "react";
import { X, Search, Plus, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { Ingredient, INGREDIENT_COLORS } from "@/types/menu";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

// 随机选择一个预设颜色
const getRandomPresetColor = () => {
    const presets = Object.values(INGREDIENT_COLORS);
    const preset = presets[Math.floor(Math.random() * presets.length)];
    return { bgColor: preset.bg, textColor: preset.text };
};

interface IngredientPickerModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    ingredients: Ingredient[];
    selected: string[];
    onChange: (selected: string[]) => void;
    onCreateIngredient: (name: string, bgColor: string, textColor: string, type: 'main' | 'sub') => void;
    ingredientType: 'main' | 'sub';
}

export function IngredientPickerModal({
    isOpen,
    onClose,
    title,
    ingredients,
    selected,
    onChange,
    onCreateIngredient,
    ingredientType,
}: IngredientPickerModalProps) {
    const [searchValue, setSearchValue] = useState("");
    const [localSelected, setLocalSelected] = useState<string[]>(selected);

    // Reset local state when modal opens
    useMemo(() => {
        if (isOpen) {
            setLocalSelected(selected);
            setSearchValue("");
        }
    }, [isOpen, selected]);

    // Filter ingredients by type and search
    const filteredIngredients = useMemo(() => {
        return ingredients
            .filter((ing) => ing.type === ingredientType)
            .filter((ing) => ing.name.toLowerCase().includes(searchValue.toLowerCase()));
    }, [ingredients, ingredientType, searchValue]);

    // Check if can create
    const canCreate = searchValue.trim() &&
        !ingredients.some((i) => i.name.toLowerCase() === searchValue.trim().toLowerCase());

    // Toggle selection
    const handleToggle = useCallback((name: string) => {
        setLocalSelected((prev) =>
            prev.includes(name)
                ? prev.filter((s) => s !== name)
                : [...prev, name]
        );
    }, []);

    // Create new ingredient
    const handleCreate = () => {
        if (!canCreate) return;
        const name = searchValue.trim();
        const { bgColor, textColor } = getRandomPresetColor();
        onCreateIngredient(name, bgColor, textColor, ingredientType);
        setLocalSelected((prev) => [...prev, name]);
        setSearchValue("");
    };

    // Confirm selection
    const handleConfirm = () => {
        onChange(localSelected);
        onClose();
    };

    // Cancel
    const handleCancel = () => {
        setLocalSelected(selected);
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && handleCancel()}>
            <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col p-0 gap-0">
                <DialogHeader className="px-6 py-4 border-b shrink-0">
                    <DialogTitle className="text-lg">{title}</DialogTitle>
                </DialogHeader>

                {/* Search bar */}
                <div className="px-6 py-3 border-b shrink-0">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="搜索食材..."
                            value={searchValue}
                            onChange={(e) => setSearchValue(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === "Enter" && canCreate) {
                                    handleCreate();
                                }
                            }}
                            className="w-full pl-10 pr-4 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400"
                            autoFocus
                        />
                        {canCreate && (
                            <button
                                type="button"
                                onClick={handleCreate}
                                className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1 px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                            >
                                <Plus className="size-3" />
                                新建 &quot;{searchValue.trim()}&quot;
                            </button>
                        )}
                    </div>
                </div>

                {/* Ingredients grid with flex-wrap */}
                <div className="flex-1 overflow-y-auto px-6 py-4">
                    {filteredIngredients.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                            <div className="text-lg mb-2">
                                {searchValue ? "未找到匹配食材" : "暂无食材"}
                            </div>
                            {canCreate && (
                                <button
                                    type="button"
                                    onClick={handleCreate}
                                    className="flex items-center gap-1 px-3 py-1.5 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                                >
                                    <Plus className="size-4" />
                                    新建 &quot;{searchValue.trim()}&quot;
                                </button>
                            )}
                        </div>
                    ) : (
                        <div className="flex flex-wrap gap-2">
                            {filteredIngredients.map((ing) => {
                                const isSelected = localSelected.includes(ing.name);

                                return (
                                    <button
                                        key={ing.name}
                                        type="button"
                                        onClick={() => handleToggle(ing.name)}
                                        className={cn(
                                            "relative px-3 py-1.5 text-sm rounded-lg transition-all",
                                            "hover:scale-105 hover:shadow-md",
                                            isSelected && "ring-2 ring-offset-1 ring-blue-500"
                                        )}
                                        style={{
                                            backgroundColor: ing.bgColor,
                                            color: ing.textColor
                                        }}
                                    >
                                        {ing.name}
                                        {isSelected && (
                                            <span className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                                                <Check className="size-3 text-white" />
                                            </span>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Footer with selected items and confirm */}
                <div className="px-6 py-4 border-t bg-gray-50 shrink-0">
                    <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0 mr-4">
                            {localSelected.length > 0 ? (
                                <div className="flex flex-wrap gap-1">
                                    <span className="text-sm text-gray-500 mr-2">已选 {localSelected.length}:</span>
                                    {localSelected.map((name) => {
                                        const ing = ingredients.find((i) => i.name === name);
                                        return (
                                            <span
                                                key={name}
                                                className="inline-flex items-center gap-0.5 px-1.5 py-0.5 text-xs rounded"
                                                style={{
                                                    backgroundColor: ing?.bgColor || INGREDIENT_COLORS.default.bg,
                                                    color: ing?.textColor || INGREDIENT_COLORS.default.text
                                                }}
                                            >
                                                {name}
                                                <button
                                                    type="button"
                                                    onClick={() => setLocalSelected((prev) => prev.filter((s) => s !== name))}
                                                    className="hover:opacity-70"
                                                >
                                                    <X className="size-3" />
                                                </button>
                                            </span>
                                        );
                                    })}
                                </div>
                            ) : (
                                <span className="text-sm text-gray-400">未选择任何食材</span>
                            )}
                        </div>
                        <div className="flex gap-2 shrink-0">
                            <Button variant="outline" onClick={handleCancel}>
                                取消
                            </Button>
                            <Button onClick={handleConfirm}>
                                确定
                            </Button>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
