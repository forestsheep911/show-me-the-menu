"use client";

import { useState, use } from "react";
import Link from "next/link";
import { ArrowLeft, Plus, Trash2, Edit2, Save, X, Search } from "lucide-react";
import { useMenuStore } from "@/store/menuStore";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function CategoryEditPage({ params }: { params: Promise<{ category: string }> }) {
  const { category: encodedCategory } = use(params);
  const category = decodeURIComponent(encodedCategory);
  const router = useRouter();
  
  const { dishes, addDish, removeDish, updateDish } = useMenuStore();
  const categoryDishes = dishes[category] || [];

  const [newDishName, setNewDishName] = useState("");
  const [editingDish, setEditingDish] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  // Handle invalid category
  if (!dishes[category]) {
    return (
        <div className="flex flex-col items-center justify-center h-screen gap-4">
            <h1 className="text-2xl font-bold text-gray-800">分类不存在</h1>
            <Button onClick={() => router.push('/edit')}>返回列表</Button>
        </div>
    );
  }

  const handleAddDish = () => {
    if (newDishName.trim()) {
      addDish(category, newDishName.trim());
      setNewDishName("");
    }
  };

  const startEditing = (name: string) => {
    setEditingDish(name);
    setEditValue(name);
  };

  const saveEdit = () => {
    if (editingDish && editValue.trim()) {
      updateDish(category, editingDish, editValue.trim());
      setEditingDish(null);
      setEditValue("");
    }
  };

  const cancelEdit = () => {
    setEditingDish(null);
    setEditValue("");
  };

  const filteredDishes = categoryDishes.filter(dish => 
    dish.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
                <h1 className="text-xl font-bold text-gray-800">{category}管理</h1>
                <p className="text-xs text-gray-500">共 {categoryDishes.length} 道菜</p>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 p-6 max-w-5xl mx-auto w-full space-y-6">
        
        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center bg-white p-4 rounded-xl border shadow-sm">
            <div className="relative w-full sm:w-72">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 size-4" />
                <input 
                    type="text" 
                    placeholder="搜索菜品..." 
                    className="w-full pl-9 pr-4 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
                <input
                    type="text"
                    placeholder="新菜品名称"
                    className="flex-1 sm:w-64 px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20"
                    value={newDishName}
                    onChange={(e) => setNewDishName(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') handleAddDish();
                    }}
                />
                <Button onClick={handleAddDish} disabled={!newDishName.trim()}>
                    <Plus className="size-4 mr-2" />
                    添加
                </Button>
            </div>
        </div>

        {/* Table Area */}
        <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                    <thead className="bg-gray-50 border-b text-gray-500">
                        <tr>
                            <th className="px-6 py-4 font-medium w-16">#</th>
                            <th className="px-6 py-4 font-medium">菜品名称</th>
                            <th className="px-6 py-4 font-medium w-48 text-right">操作</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {filteredDishes.length === 0 ? (
                            <tr>
                                <td colSpan={3} className="px-6 py-12 text-center text-gray-400">
                                    {searchTerm ? '未找到匹配的菜品' : '暂无菜品，请添加'}
                                </td>
                            </tr>
                        ) : (
                            filteredDishes.map((dish, index) => {
                                const isEditing = editingDish === dish;
                                return (
                                    <tr key={dish} className="hover:bg-gray-50/50 transition-colors group">
                                        <td className="px-6 py-4 text-gray-400 font-mono text-xs">{index + 1}</td>
                                        <td className="px-6 py-4">
                                            {isEditing ? (
                                                <input
                                                    type="text"
                                                    value={editValue}
                                                    onChange={(e) => setEditValue(e.target.value)}
                                                    className="w-full max-w-xs px-2 py-1 text-sm border rounded focus:outline-none focus:ring-2 focus:ring-primary/20"
                                                    autoFocus
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Enter') saveEdit();
                                                        if (e.key === 'Escape') cancelEdit();
                                                    }}
                                                />
                                            ) : (
                                                <span className="font-medium text-gray-700">{dish}</span>
                                            )}
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
                                                        onClick={() => startEditing(dish)}
                                                        className="h-8 w-8 p-0 text-gray-500 hover:text-blue-600 hover:bg-blue-50"
                                                        title="编辑"
                                                    >
                                                        <Edit2 className="size-4" />
                                                    </Button>
                                                    <Button 
                                                        size="sm" 
                                                        variant="ghost" 
                                                        onClick={() => {
                                                            if (confirm(`确定要删除"${dish}"吗？`)) {
                                                                removeDish(category, dish);
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
                <span>总计 {categoryDishes.length} 道菜</span>
                <span>提示：未来可以在此处扩展更多字段，如：卡路里、难度、食材等</span>
            </div>
        </div>
      </div>
    </main>
  );
}


