"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Plus, Trash2, Edit2, Save, X, Search } from "lucide-react";
import { useMenuStore } from "@/store/menuStore";
import { Button } from "@/components/ui/button";

export default function IngredientsPage() {
  const { ingredients, addIngredient, removeIngredient, updateIngredient } = useMenuStore();
  
  const [newIngredientName, setNewIngredientName] = useState("");
  const [editingIngredient, setEditingIngredient] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const handleAdd = () => {
    if (newIngredientName.trim()) {
      addIngredient(newIngredientName.trim());
      setNewIngredientName("");
    }
  };

  const startEditing = (name: string) => {
    setEditingIngredient(name);
    setEditValue(name);
  };

  const saveEdit = () => {
    if (editingIngredient && editValue.trim()) {
      updateIngredient(editingIngredient, editValue.trim());
      setEditingIngredient(null);
      setEditValue("");
    }
  };

  const cancelEdit = () => {
    setEditingIngredient(null);
    setEditValue("");
  };

  const filteredIngredients = ingredients.filter(item => 
    item.toLowerCase().includes(searchTerm.toLowerCase())
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
                <h1 className="text-xl font-bold text-gray-800">食材库管理</h1>
                <p className="text-xs text-gray-500">共 {ingredients.length} 种食材</p>
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
                    placeholder="搜索食材..." 
                    className="w-full pl-9 pr-4 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
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
                <Button onClick={handleAdd} disabled={!newIngredientName.trim()}>
                    <Plus className="size-4 mr-2" />
                    添加
                </Button>
            </div>
        </div>

        {/* Grid View for Ingredients */}
        <div className="bg-white rounded-xl border shadow-sm p-6">
            {filteredIngredients.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                    {searchTerm ? '未找到匹配的食材' : '暂无食材，请添加'}
                </div>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {filteredIngredients.map((item) => {
                        const isEditing = editingIngredient === item;
                        return (
                            <div key={item} className="group relative flex flex-col items-center justify-center p-4 bg-gray-50 rounded-lg border border-transparent hover:border-primary/20 hover:bg-primary/5 transition-all">
                                {isEditing ? (
                                    <div className="w-full space-y-2 z-10">
                                        <input
                                            type="text"
                                            value={editValue}
                                            onChange={(e) => setEditValue(e.target.value)}
                                            className="w-full px-2 py-1 text-center text-sm border rounded focus:outline-none focus:ring-2 focus:ring-primary/20 bg-white"
                                            autoFocus
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') saveEdit();
                                                if (e.key === 'Escape') cancelEdit();
                                            }}
                                        />
                                        <div className="flex justify-center gap-1">
                                            <Button size="icon-sm" variant="ghost" onClick={saveEdit} className="text-green-600 h-6 w-6">
                                                <Save className="size-3" />
                                            </Button>
                                            <Button size="icon-sm" variant="ghost" onClick={cancelEdit} className="text-gray-400 h-6 w-6">
                                                <X className="size-3" />
                                            </Button>
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        <span className="font-medium text-gray-700 mb-1">{item}</span>
                                        <div className="absolute top-1 right-1 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-white/80 rounded backdrop-blur-sm">
                                            <Button 
                                                size="icon-sm" 
                                                variant="ghost" 
                                                onClick={() => startEditing(item)}
                                                className="h-6 w-6 p-0 text-gray-500 hover:text-blue-600"
                                                title="编辑"
                                            >
                                                <Edit2 className="size-3" />
                                            </Button>
                                            <Button 
                                                size="icon-sm" 
                                                variant="ghost" 
                                                onClick={() => {
                                                    if (confirm(`确定要删除"${item}"吗？`)) {
                                                        removeIngredient(item);
                                                    }
                                                }}
                                                className="h-6 w-6 p-0 text-gray-500 hover:text-red-600"
                                                title="删除"
                                            >
                                                <Trash2 className="size-3" />
                                            </Button>
                                        </div>
                                    </>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
            
            <div className="mt-8 pt-4 border-t text-xs text-gray-400 flex justify-between items-center">
                <span>提示：将来这些食材会与菜品进行关联</span>
            </div>
        </div>
      </div>
    </main>
  );
}


