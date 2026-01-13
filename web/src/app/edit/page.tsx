"use client";

import Link from "next/link";
import { ArrowLeft, ChevronRight, Carrot, UtensilsCrossed, Palette, Grid3X3, CircleDot, Square, X } from "lucide-react";
import { useMenuStore } from "@/store/menuStore";
import { Button } from "@/components/ui/button";
import { MagicCard } from "@/components/ui/magic-card";
import { BlurFade } from "@/components/ui/blur-fade";
import { DynamicBackground, BACKGROUND_PRESETS } from "@/components/DynamicBackground";
import { cn } from "@/lib/utils";

export default function EditMenuPage() {
  const { dishes, ingredients, backgroundSettings, setBackgroundSettings } = useMenuStore();

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'dots': return <CircleDot className="size-4" />;
      case 'grid': return <Grid3X3 className="size-4" />;
      case 'solid': return <Square className="size-4" />;
      case 'none': return <X className="size-4" />;
      default: return null;
    }
  };

  return (
    <main className="flex flex-col w-full min-h-screen bg-gray-50 relative">
      {/* 动态背景 */}
      <DynamicBackground />

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

        {/* 外观设置 */}
        <section>
          <BlurFade delay={0.25} direction="up">
            <h2 className="text-sm font-bold uppercase tracking-wider text-gray-400 mb-4 pl-1 flex items-center gap-2">
              <Palette className="size-4" />
              背景设置
            </h2>
          </BlurFade>
          <BlurFade delay={0.3} direction="up">
            <div className="bg-white rounded-xl border shadow-sm p-6">
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
                {BACKGROUND_PRESETS.map((preset, index) => {
                  const isActive = backgroundSettings.type === preset.type &&
                    (preset.type === 'none' || backgroundSettings.color === preset.color);

                  return (
                    <button
                      key={`${preset.type}-${preset.color}-${index}`}
                      onClick={() => setBackgroundSettings({ type: preset.type, color: preset.color })}
                      className={cn(
                        "relative flex flex-col items-center gap-2 p-3 rounded-lg border-2 transition-all hover:scale-105",
                        isActive
                          ? "border-blue-500 bg-blue-50 shadow-md"
                          : "border-gray-200 hover:border-gray-300"
                      )}
                    >
                      {/* 预览 */}
                      <div
                        className={cn(
                          "w-10 h-10 rounded-lg flex items-center justify-center",
                          preset.type === 'none' ? "bg-gray-100" : ""
                        )}
                        style={
                          preset.type === 'solid'
                            ? { backgroundColor: preset.color }
                            : preset.type !== 'none'
                              ? {
                                backgroundColor: '#f9fafb',
                                backgroundImage: preset.type === 'dots'
                                  ? `radial-gradient(${preset.color} 1.5px, transparent 1.5px)`
                                  : `linear-gradient(${preset.color} 1px, transparent 1px), linear-gradient(90deg, ${preset.color} 1px, transparent 1px)`,
                                backgroundSize: preset.type === 'dots' ? '8px 8px' : '8px 8px'
                              }
                              : undefined
                        }
                      >
                        {preset.type === 'none' && <X className="size-5 text-gray-400" />}
                      </div>
                      {/* 名称 */}
                      <span className="text-xs text-gray-600 text-center leading-tight">{preset.name}</span>
                      {/* 选中指示 */}
                      {isActive && (
                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                          <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </BlurFade>
        </section>
      </div>
    </main>
  );
}
