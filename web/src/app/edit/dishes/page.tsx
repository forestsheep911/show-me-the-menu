"use client";

import Link from "next/link";
import { useMenuStore } from "@/store/menuStore";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { ArrowLeft, Plus, Trash2, Edit2, Save, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { matchesSearch } from "@/lib/search";

export default function DishesManagePage() {
  const { dishes, tags, addDish, removeDish, updateDish } = useMenuStore();
  const [searchTerm, setSearchTerm] = useState("");
  const [newDishName, setNewDishName] = useState("");
  const [newDishTags, setNewDishTags] = useState<string[]>([]);
  const [editingDish, setEditingDish] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");

  const filteredDishes = dishes.filter((dish) => matchesSearch(dish.name, searchTerm));

  const handleAddDish = () => {
    if (!newDishName.trim()) return;
    addDish(newDishName.trim(), newDishTags);
    setNewDishName("");
    setNewDishTags([]);
  };

  const toggleNewDishTag = (tag: string) => {
    setNewDishTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const toggleDishTag = (dishName: string, tag: string) => {
    const dish = dishes.find((item) => item.name === dishName);
    if (!dish) return;
    const hasTag = dish.tags.includes(tag);
    const updatedTags = hasTag ? dish.tags.filter((t) => t !== tag) : [...dish.tags, tag];
    updateDish(dishName, { tags: updatedTags });
  };

  const startEditing = (dishName: string) => {
    setEditingDish(dishName);
    setEditValue(dishName);
  };

  const saveEdit = () => {
    if (editingDish && editValue.trim()) {
      updateDish(editingDish, { name: editValue.trim() });
      setEditingDish(null);
      setEditValue("");
    }
  };

  const cancelEdit = () => {
    setEditingDish(null);
    setEditValue("");
  };

  return (
    <main className="flex flex-col w-full min-h-screen bg-gray-50/50">
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b p-4 shadow-sm">
        <div className="max-w-5xl mx-auto flex items-center justify-between w-full">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/edit">
                <ArrowLeft className="size-5" />
              </Link>
            </Button>
            <div>
              <h1 className="text-xl font-bold text-gray-800">菜品管理</h1>
              <p className="text-xs text-gray-500">直接维护全部菜品与标签，不再分分类</p>
            </div>
          </div>
        </div>
      </header>

      <div className="flex-1 p-6 max-w-5xl mx-auto w-full space-y-6">
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center bg-white p-4 rounded-xl border shadow-sm">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 size-4" />
            <input
              type="text"
              placeholder="搜索菜品..."
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <div className="w-full sm:w-auto flex flex-col gap-2">
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                placeholder="新菜品名称"
                value={newDishName}
                onChange={(event) => setNewDishName(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") handleAddDish();
                }}
                className="flex-1 sm:w-64 px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
              <Button onClick={handleAddDish} disabled={!newDishName.trim()}>
                <Plus className="size-4 mr-2" />
                添加菜品
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {tags.length === 0 ? (
                <span className="text-xs text-gray-400">暂无标签，请先在后台添加。</span>
              ) : (
                tags.map((tag) => {
                  const isActive = newDishTags.includes(tag);
                  return (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => toggleNewDishTag(tag)}
                      className={cn(
                        "px-2 py-0.5 text-xs rounded-full border transition-colors",
                        isActive
                          ? "bg-[#ff7043]/10 border-[#ff7043]/40 text-[#f4511e]"
                          : "border-gray-200 text-gray-500 hover:border-gray-300"
                      )}
                    >
                      {tag}
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 border-b text-gray-500">
                <tr>
                  <th className="px-6 py-4 font-medium w-16">#</th>
                  <th className="px-6 py-4 font-medium">菜品名称</th>
                  <th className="px-6 py-4 font-medium">标签</th>
                  <th className="px-6 py-4 font-medium w-48 text-right">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredDishes.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-gray-400">
                      {searchTerm ? "未找到匹配的菜品" : "暂无菜品，请添加"}
                    </td>
                  </tr>
                ) : (
                  filteredDishes.map((dish, index) => {
                    const isEditing = editingDish === dish.name;
                    return (
                      <tr key={dish.name} className="hover:bg-gray-50/50 transition-colors group">
                        <td className="px-6 py-4 text-gray-400 font-mono text-xs">{index + 1}</td>
                        <td className="px-6 py-4">
                          {isEditing ? (
                            <input
                              type="text"
                              value={editValue}
                              onChange={(event) => setEditValue(event.target.value)}
                              className="w-full max-w-xs px-2 py-1 text-sm border rounded focus:outline-none focus:ring-2 focus:ring-primary/20"
                              autoFocus
                              onKeyDown={(event) => {
                                if (event.key === "Enter") saveEdit();
                                if (event.key === "Escape") cancelEdit();
                              }}
                            />
                          ) : (
                            <span className="font-medium text-gray-700">{dish.name}</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-wrap gap-2">
                            {tags.map((tag) => {
                              const active = dish.tags.includes(tag);
                              return (
                                <button
                                  key={`${dish.name}-${tag}`}
                                  type="button"
                                  onClick={() => toggleDishTag(dish.name, tag)}
                                  className={cn(
                                    "px-2 py-0.5 text-xs rounded-full border transition-colors",
                                    active
                                      ? "bg-green-50 border-green-200 text-green-600"
                                      : "border-gray-200 text-gray-400 hover:text-gray-600"
                                  )}
                                >
                                  {tag}
                                </button>
                              );
                            })}
                            {tags.length === 0 && (
                              <span className="text-xs text-gray-400">暂无标签</span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          {isEditing ? (
                            <div className="flex items-center justify-end gap-2">
                              <Button size="sm" onClick={saveEdit} className="bg-green-600 hover:bg-green-700 text-white h-8 px-3">
                                <Save className="size-3.5 mr-1" /> 保存
                              </Button>
                              <Button size="sm" variant="ghost" onClick={cancelEdit} className="h-8 px-3">
                                取消
                              </Button>
                            </div>
                          ) : (
                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => startEditing(dish.name)}
                                className="h-8 w-8 p-0 text-gray-500 hover:text-blue-600 hover:bg-blue-50"
                                title="编辑"
                              >
                                <Edit2 className="size-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => {
                                  if (confirm(`确定要删除 "${dish.name}" 吗？`)) {
                                    removeDish(dish.name);
                                  }
                                }}
                                className="h-8 w-8 p-0 text-gray-500 hover:text-red-600 hover:bg-red-50"
                                title="删除"
                              >
                                <Trash2 className="size-4" />
                              </Button>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
          <div className="px-6 py-4 border-t bg-gray-50 text-xs text-gray-400 flex justify-between items-center">
            <span>总计 {dishes.length} 道菜</span>
            <span>提示：可根据需求继续扩展，如难度、食材等字段</span>
          </div>
        </div>
      </div>
    </main>
  );
}
