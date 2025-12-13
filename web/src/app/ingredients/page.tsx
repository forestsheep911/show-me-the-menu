"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Plus, Trash2, Edit2, Save, X, Search, Palette } from "lucide-react";
import { useMenuStore } from "@/store/menuStore";
import { Button } from "@/components/ui/button";
import { INGREDIENT_COLORS, IngredientColorName, Ingredient } from "@/types/menu";
import { cn } from "@/lib/utils";
import { HexColorPicker, HexColorInput } from "react-colorful";
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

// Preset colors from INGREDIENT_COLORS for quick selection
const PRESET_COLORS = Object.entries(INGREDIENT_COLORS).map(([name, colors]) => ({
  name,
  bg: colors.bg,
  text: colors.text,
}));

// 根据背景色自动计算合适的文字颜色
function getContrastTextColor(bgColor: string): string {
  // Remove # if present
  const hex = bgColor.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  // Calculate luminance
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.5 ? '#37352F' : '#FFFFFF';
}

export default function IngredientsPage() {
  const { ingredients, addIngredient, removeIngredient, updateIngredient } = useMenuStore();

  const [newIngredientName, setNewIngredientName] = useState("");
  const [newIngredientType, setNewIngredientType] = useState<'main' | 'sub'>('main');
  const [editingIngredient, setEditingIngredient] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<'all' | 'main' | 'sub'>('all');
  const [colorPickerOpen, setColorPickerOpen] = useState<string | null>(null);
  const [customBgColor, setCustomBgColor] = useState("#E3E2E0");

  const handleAdd = () => {
    if (newIngredientName.trim()) {
      const defaultColors = INGREDIENT_COLORS.default;
      addIngredient(newIngredientName.trim(), defaultColors.bg, defaultColors.text, newIngredientType);
      setNewIngredientName("");
    }
  };

  const startEditing = (name: string) => {
    setEditingIngredient(name);
    setEditValue(name);
  };

  const saveEdit = () => {
    if (editingIngredient && editValue.trim()) {
      updateIngredient(editingIngredient, { name: editValue.trim() });
      setEditingIngredient(null);
      setEditValue("");
    }
  };

  const cancelEdit = () => {
    setEditingIngredient(null);
    setEditValue("");
  };

  const handlePresetColorChange = (ingredientName: string, bgColor: string, textColor: string) => {
    updateIngredient(ingredientName, { bgColor, textColor });
    setColorPickerOpen(null);
  };

  const handleCustomColorApply = (ingredientName: string) => {
    const textColor = getContrastTextColor(customBgColor);
    updateIngredient(ingredientName, { bgColor: customBgColor, textColor });
    setColorPickerOpen(null);
  };

  const handleTypeChange = (ingredientName: string, type: 'main' | 'sub') => {
    updateIngredient(ingredientName, { type });
  };

  const filteredIngredients = ingredients.filter((item: Ingredient) => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || item.type === filterType;
    return matchesSearch && matchesType;
  });

  // Count by type
  const mainCount = ingredients.filter((i: Ingredient) => i.type === 'main').length;
  const subCount = ingredients.filter((i: Ingredient) => i.type === 'sub').length;

  return (
    <main className="flex flex-col w-full min-h-screen bg-gray-50/50">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b p-4 shadow-sm">
        <div className="max-w-5xl mx-auto flex items-center justify-between w-full">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/edit">
                <ArrowLeft className="size-5" />
              </Link>
            </Button>
            <div>
              <h1 className="text-xl font-bold text-gray-800">食材库管理</h1>
              <p className="text-xs text-gray-500">
                共 {ingredients.length} 种食材 (主料 {mainCount} / 辅料 {subCount})
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 p-6 max-w-5xl mx-auto w-full space-y-6">

        {/* Controls */}
        <div className="flex flex-col gap-4 bg-white p-4 rounded-xl border shadow-sm">
          {/* Search and Filter Row */}
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 size-4" />
              <input
                type="text"
                placeholder="搜索食材..."
                className="w-full pl-9 pr-4 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Type Filter */}
            <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
              <button
                type="button"
                onClick={() => setFilterType('all')}
                className={cn(
                  "px-3 py-1.5 text-sm rounded-md transition-colors",
                  filterType === 'all'
                    ? "bg-white shadow-sm text-gray-800"
                    : "text-gray-500 hover:text-gray-700"
                )}
              >
                全部 ({ingredients.length})
              </button>
              <button
                type="button"
                onClick={() => setFilterType('main')}
                className={cn(
                  "px-3 py-1.5 text-sm rounded-md transition-colors",
                  filterType === 'main'
                    ? "bg-white shadow-sm text-gray-800"
                    : "text-gray-500 hover:text-gray-700"
                )}
              >
                主料 ({mainCount})
              </button>
              <button
                type="button"
                onClick={() => setFilterType('sub')}
                className={cn(
                  "px-3 py-1.5 text-sm rounded-md transition-colors",
                  filterType === 'sub'
                    ? "bg-white shadow-sm text-gray-800"
                    : "text-gray-500 hover:text-gray-700"
                )}
              >
                辅料 ({subCount})
              </button>
            </div>
          </div>

          {/* Add New Ingredient Row */}
          <div className="flex flex-col sm:flex-row gap-2 pt-2 border-t">
            <input
              type="text"
              placeholder="新食材名称"
              className="flex-1 sm:w-64 px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20"
              value={newIngredientName}
              onChange={(e) => setNewIngredientName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleAdd();
              }}
            />

            {/* Type selector for new ingredient */}
            <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
              <button
                type="button"
                onClick={() => setNewIngredientType('main')}
                className={cn(
                  "px-3 py-1.5 text-sm rounded-md transition-colors",
                  newIngredientType === 'main'
                    ? "bg-white shadow-sm text-gray-800"
                    : "text-gray-500 hover:text-gray-700"
                )}
              >
                主料
              </button>
              <button
                type="button"
                onClick={() => setNewIngredientType('sub')}
                className={cn(
                  "px-3 py-1.5 text-sm rounded-md transition-colors",
                  newIngredientType === 'sub'
                    ? "bg-white shadow-sm text-gray-800"
                    : "text-gray-500 hover:text-gray-700"
                )}
              >
                辅料
              </button>
            </div>

            <Button onClick={handleAdd} disabled={!newIngredientName.trim()}>
              <Plus className="size-4 mr-2" />
              添加
            </Button>
          </div>
        </div>

        {/* Table View for Ingredients */}
        <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 border-b text-gray-500">
                <tr>
                  <th className="px-4 py-3 font-medium w-12">#</th>
                  <th className="px-4 py-3 font-medium">食材名称</th>
                  <th className="px-4 py-3 font-medium w-24">类型</th>
                  <th className="px-4 py-3 font-medium w-20">颜色</th>
                  <th className="px-4 py-3 font-medium w-24 text-right">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredIngredients.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-12 text-center text-gray-400">
                      {searchTerm || filterType !== 'all' ? '未找到匹配的食材' : '暂无食材，请添加'}
                    </td>
                  </tr>
                ) : (
                  filteredIngredients.map((item: Ingredient, index: number) => {
                    const isEditing = editingIngredient === item.name;

                    return (
                      <tr key={item.name} className="hover:bg-gray-50/50 transition-colors group">
                        {/* Index */}
                        <td className="px-4 py-3 text-gray-400 font-mono text-xs">
                          {index + 1}
                        </td>

                        {/* Name */}
                        <td className="px-4 py-3">
                          {isEditing ? (
                            <div className="flex items-center gap-2">
                              <input
                                type="text"
                                value={editValue}
                                onChange={(e) => setEditValue(e.target.value)}
                                className="flex-1 px-2 py-1 text-sm border rounded focus:outline-none focus:ring-2 focus:ring-primary/20"
                                autoFocus
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') saveEdit();
                                  if (e.key === 'Escape') cancelEdit();
                                }}
                              />
                              <Button size="icon-sm" variant="ghost" onClick={saveEdit} className="text-green-600 h-7 w-7">
                                <Save className="size-3.5" />
                              </Button>
                              <Button size="icon-sm" variant="ghost" onClick={cancelEdit} className="text-gray-400 h-7 w-7">
                                <X className="size-3.5" />
                              </Button>
                            </div>
                          ) : (
                            <span
                              className="inline-block px-2 py-1 rounded-md font-medium"
                              style={{ backgroundColor: item.bgColor, color: item.textColor }}
                            >
                              {item.name}
                            </span>
                          )}
                        </td>

                        {/* Type */}
                        <td className="px-4 py-3">
                          <button
                            type="button"
                            onClick={() => handleTypeChange(item.name, item.type === 'main' ? 'sub' : 'main')}
                            className={cn(
                              "px-2 py-1 text-xs rounded-full transition-colors font-medium",
                              item.type === 'main'
                                ? "bg-orange-100 text-orange-700 hover:bg-orange-200"
                                : "bg-green-100 text-green-700 hover:bg-green-200"
                            )}
                          >
                            {item.type === 'main' ? '主料' : '辅料'}
                          </button>
                        </td>

                        {/* Color */}
                        <td className="px-4 py-3">
                          <Popover open={colorPickerOpen === item.name} onOpenChange={(open) => {
                            setColorPickerOpen(open ? item.name : null);
                            if (open) {
                              setCustomBgColor(item.bgColor);
                            }
                          }}>
                            <PopoverTrigger asChild>
                              <button
                                type="button"
                                className="flex items-center gap-1.5 px-2 py-1 rounded-md hover:bg-gray-100 transition-colors"
                              >
                                <span
                                  className="w-6 h-6 rounded border border-gray-200"
                                  style={{ backgroundColor: item.bgColor }}
                                />
                                <Palette className="size-3.5 text-gray-400" />
                              </button>
                            </PopoverTrigger>
                            <PopoverContent className="w-64 p-0" align="start">
                              <div className="p-3 space-y-3">
                                {/* Preset Colors */}
                                <div>
                                  <div className="text-xs text-gray-500 mb-2 font-medium">预设颜色</div>
                                  <div className="grid grid-cols-5 gap-2">
                                    {PRESET_COLORS.map((preset) => (
                                      <button
                                        key={preset.name}
                                        type="button"
                                        onClick={() => handlePresetColorChange(item.name, preset.bg, preset.text)}
                                        className={cn(
                                          "w-8 h-8 rounded-lg border-2 transition-all hover:scale-110",
                                          item.bgColor === preset.bg
                                            ? "border-blue-500 ring-2 ring-blue-200"
                                            : "border-transparent hover:border-gray-300"
                                        )}
                                        style={{ backgroundColor: preset.bg }}
                                        title={preset.name}
                                      />
                                    ))}
                                  </div>
                                </div>

                                {/* Custom Color Picker */}
                                <div className="border-t pt-3">
                                  <div className="text-xs text-gray-500 mb-2 font-medium">自定义颜色</div>
                                  <HexColorPicker
                                    color={customBgColor}
                                    onChange={setCustomBgColor}
                                    style={{ width: '100%', height: '120px' }}
                                  />
                                  <div className="flex items-center gap-2 mt-2">
                                    <span className="text-xs text-gray-500">#</span>
                                    <HexColorInput
                                      color={customBgColor}
                                      onChange={setCustomBgColor}
                                      className="flex-1 px-2 py-1 text-sm border rounded focus:outline-none focus:ring-1 focus:ring-blue-400 uppercase"
                                    />
                                    <span
                                      className="w-8 h-8 rounded border border-gray-200 shrink-0"
                                      style={{ backgroundColor: customBgColor }}
                                    />
                                  </div>
                                  <Button
                                    size="sm"
                                    className="w-full mt-2"
                                    onClick={() => handleCustomColorApply(item.name)}
                                  >
                                    应用自定义颜色
                                  </Button>
                                </div>
                              </div>
                            </PopoverContent>
                          </Popover>
                        </td>

                        {/* Actions */}
                        <td className="px-4 py-3 text-right">
                          <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button
                              size="icon-sm"
                              variant="ghost"
                              onClick={() => startEditing(item.name)}
                              className="h-7 w-7 p-0 text-gray-500 hover:text-blue-600"
                              title="编辑"
                            >
                              <Edit2 className="size-3.5" />
                            </Button>
                            <Button
                              size="icon-sm"
                              variant="ghost"
                              onClick={() => setDeleteConfirm(item.name)}
                              className="h-7 w-7 p-0 text-gray-500 hover:text-red-600"
                              title="删除"
                            >
                              <Trash2 className="size-3.5" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          <div className="px-4 py-3 border-t bg-gray-50 text-xs text-gray-400 flex justify-between items-center">
            <span>总计 {filteredIngredients.length} 种食材</span>
            <span>提示：点击类型可切换主料/辅料，点击颜色可更改</span>
          </div>
        </div>
      </div>

      {/* Delete confirmation dialog */}
      <AlertDialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认删除</AlertDialogTitle>
            <AlertDialogDescription>
              确定要删除「{deleteConfirm}」吗？此操作将同时从所有菜品中移除该食材。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deleteConfirm) {
                  removeIngredient(deleteConfirm);
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
    </main>
  );
}
