"use client";

import Link from "next/link";
import { ArrowLeft, ChevronRight, Carrot, Plus, UtensilsCrossed, Trash2 } from "lucide-react";
import { useMenuStore } from "@/store/menuStore";
import { Button } from "@/components/ui/button";
import { FormEvent, useState } from "react";

export default function EditMenuPage() {
  const { dishes, ingredients, tags, addTag, removeTag } = useMenuStore();
  const [newTag, setNewTag] = useState("");

  const handleAddTag = (event: FormEvent) => {
    event.preventDefault();
    if (!newTag.trim()) return;
    addTag(newTag.trim());
    setNewTag("");
  };

  return (
    <main className="flex flex-col w-full min-h-screen bg-gray-50/50">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b p-4 shadow-sm">
        <div className="max-w-3xl mx-auto flex items-center justify-between w-full">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/">
                <ArrowLeft className="size-5" />
              </Link>
            </Button>
            <h1 className="text-xl font-bold text-gray-800">后台管理</h1>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 p-6 max-w-3xl mx-auto w-full space-y-8">
        {/* 管理入口 */}
        <section>
          <h2 className="text-sm font-bold uppercase tracking-wider text-gray-400 mb-4 pl-1">管理入口</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Link 
              href="/edit/dishes"
              className="group flex items-center justify-between p-6 bg-white rounded-xl border shadow-sm hover:shadow-md transition-all hover:border-primary/20 active:scale-99"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-full bg-orange-100 text-orange-600 group-hover:bg-orange-200 transition-colors">
                  <UtensilsCrossed className="size-6" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-gray-800 group-hover:text-primary transition-colors">菜品管理</h3>
                  <p className="text-sm text-gray-500">当前共有 {dishes.length} 道菜</p>
                </div>
              </div>
              <ChevronRight className="text-gray-300 group-hover:text-primary group-hover:translate-x-1 transition-all" />
            </Link>
            <Link 
              href="/ingredients"
              className="group flex items-center justify-between p-6 bg-white rounded-xl border shadow-sm hover:shadow-md transition-all hover:border-green-500/20 active:scale-99"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-full bg-green-100 text-green-600 group-hover:bg-green-200 transition-colors">
                  <Carrot className="size-6" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-gray-800 group-hover:text-green-600 transition-colors">食材库管理</h3>
                  <p className="text-sm text-gray-500">管理所有基础食材 ({ingredients.length})</p>
                </div>
              </div>
              <ChevronRight className="text-gray-300 group-hover:text-green-600 group-hover:translate-x-1 transition-all" />
            </Link>
          </div>
        </section>

        {/* 标签管理 */}
        <section>
          <h2 className="text-sm font-bold uppercase tracking-wider text-gray-400 mb-4 pl-1">标签管理</h2>
          <div className="bg-white rounded-xl border shadow-sm p-6 space-y-4">
            <div className="flex flex-wrap gap-2">
              {tags.length === 0 && <p className="text-sm text-gray-400">暂无标签，请添加。</p>}
              {tags.map((tag) => {
                const count = dishes.filter((dish) => dish.tags.includes(tag)).length;
                return (
                  <span key={tag} className="flex items-center gap-2 px-3 py-1 rounded-full bg-orange-50 text-orange-600 text-sm border border-orange-100">
                    {tag}
                    <span className="text-xs text-orange-400">({count})</span>
                    <button
                      type="button"
                      className="text-orange-400 hover:text-orange-600"
                      onClick={() => removeTag(tag)}
                    >
                      <Trash2 className="size-3" />
                    </button>
                  </span>
                );
              })}
            </div>
            <form onSubmit={handleAddTag} className="flex flex-col sm:flex-row gap-3 items-start sm:items-end">
              <div className="flex-1 w-full">
                <label htmlFor="new-tag" className="text-sm font-medium text-gray-600">
                  新标签名称
                </label>
                <input
                  id="new-tag"
                  type="text"
                  value={newTag}
                  onChange={(event) => setNewTag(event.target.value)}
                  className="mt-2 w-full rounded-md border border-gray-200 px-3 py-2 text-sm focus:border-[#ff7043] focus:outline-none focus:ring-2 focus:ring-[#ffcc80]/50"
                  placeholder="例如：低脂、无辣、儿童餐"
                />
              </div>
              <Button type="submit" disabled={!newTag.trim()}>
                <Plus className="size-4 mr-2" />
                添加标签
              </Button>
            </form>
          </div>
        </section>
      </div>
    </main>
  );
}
