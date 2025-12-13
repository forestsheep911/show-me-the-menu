"use client";

import Link from "next/link";
import { ArrowLeft, ChevronRight, Carrot, UtensilsCrossed } from "lucide-react";
import { useMenuStore } from "@/store/menuStore";
import { Button } from "@/components/ui/button";

export default function EditMenuPage() {
  const { dishes, ingredients } = useMenuStore();

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
            {/* 菜品管理 */}
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
                  <p className="text-sm text-gray-500">共 {dishes.length} 道菜</p>
                </div>
              </div>
              <ChevronRight className="text-gray-300 group-hover:text-primary group-hover:translate-x-1 transition-all" />
            </Link>

            {/* 食材库管理 */}
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
                  <p className="text-sm text-gray-500">共 {ingredients.length} 种食材</p>
                </div>
              </div>
              <ChevronRight className="text-gray-300 group-hover:text-green-600 group-hover:translate-x-1 transition-all" />
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}

