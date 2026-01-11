"use client";

import Link from "next/link";
import { ArrowLeft, ChevronRight, Carrot, UtensilsCrossed } from "lucide-react";
import { useMenuStore } from "@/store/menuStore";
import { Button } from "@/components/ui/button";
import { MagicCard } from "@/components/ui/magic-card";
import { BlurFade } from "@/components/ui/blur-fade";
import { DotPattern } from "@/components/ui/dot-pattern";
import { cn } from "@/lib/utils";

export default function EditMenuPage() {
  const { dishes, ingredients } = useMenuStore();

  return (
    <main className="flex flex-col w-full min-h-screen bg-gray-50 relative">
      {/* 背景圆点图案 */}
      <DotPattern
        width={20}
        height={20}
        cx={1}
        cy={1}
        cr={1}
        className={cn(
          "fixed inset-0 z-0",
          "text-gray-200",
          "[mask-image:radial-gradient(ellipse_at_center,white_10%,transparent_70%)]"
        )}
      />

      {/* Header */}
      <header className="sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b p-4 shadow-sm">
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
      <div className="flex-1 p-6 max-w-3xl mx-auto w-full space-y-8 relative z-10">
        {/* 管理入口 */}
        <section>
          <BlurFade delay={0.1} direction="up">
            <h2 className="text-sm font-bold uppercase tracking-wider text-gray-400 mb-4 pl-1">管理入口</h2>
          </BlurFade>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* 菜品管理 */}
            <BlurFade delay={0.15} direction="up">
              <Link href="/edit/dishes" className="block">
                <MagicCard
                  gradientColor="#fff7ed"
                  gradientFrom="#fb923c"
                  gradientTo="#f97316"
                  gradientSize={150}
                  gradientOpacity={0.15}
                  className="rounded-xl"
                >
                  <div className="group flex items-center justify-between p-6">
                    <div className="flex items-center gap-4">
                      <div className="p-3 rounded-full bg-orange-100 text-orange-600 group-hover:bg-orange-200 transition-colors">
                        <UtensilsCrossed className="size-6" />
                      </div>
                      <div>
                        <h3 className="font-bold text-lg text-gray-800 group-hover:text-orange-600 transition-colors">菜品管理</h3>
                        <p className="text-sm text-gray-500">共 {dishes.length} 道菜</p>
                      </div>
                    </div>
                    <ChevronRight className="text-gray-300 group-hover:text-orange-500 group-hover:translate-x-1 transition-all" />
                  </div>
                </MagicCard>
              </Link>
            </BlurFade>

            {/* 食材库管理 */}
            <BlurFade delay={0.2} direction="up">
              <Link href="/ingredients" className="block">
                <MagicCard
                  gradientColor="#f0fdf4"
                  gradientFrom="#4ade80"
                  gradientTo="#22c55e"
                  gradientSize={150}
                  gradientOpacity={0.15}
                  className="rounded-xl"
                >
                  <div className="group flex items-center justify-between p-6">
                    <div className="flex items-center gap-4">
                      <div className="p-3 rounded-full bg-green-100 text-green-600 group-hover:bg-green-200 transition-colors">
                        <Carrot className="size-6" />
                      </div>
                      <div>
                        <h3 className="font-bold text-lg text-gray-800 group-hover:text-green-600 transition-colors">食材库管理</h3>
                        <p className="text-sm text-gray-500">共 {ingredients.length} 种食材</p>
                      </div>
                    </div>
                    <ChevronRight className="text-gray-300 group-hover:text-green-500 group-hover:translate-x-1 transition-all" />
                  </div>
                </MagicCard>
              </Link>
            </BlurFade>
          </div>
        </section>
      </div>
    </main>
  );
}
