"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Settings, Shuffle, Menu, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useMenuStore } from "@/store/menuStore";

interface SideMenuProps {
    className?: string;
}

export function SideMenu({ className }: SideMenuProps) {
    const [isOpen, setIsOpen] = useState(false);
    const generateNewMenu = useMenuStore((state) => state.generateNewMenu);

    // 键盘快捷键处理
    const handleKeyDown = useCallback((e: KeyboardEvent) => {
        // 如果用户正在输入（input, textarea, contenteditable），忽略快捷键
        const target = e.target as HTMLElement;
        if (
            target.tagName === "INPUT" ||
            target.tagName === "TEXTAREA" ||
            target.isContentEditable
        ) {
            return;
        }

        // 按 F 键切换菜单
        if (e.key === "f" || e.key === "F") {
            e.preventDefault();
            setIsOpen((prev) => !prev);
        }

        // 按 ESC 键关闭菜单
        if (e.key === "Escape" && isOpen) {
            e.preventDefault();
            setIsOpen(false);
        }
    }, [isOpen]);

    // 添加全局键盘事件监听
    useEffect(() => {
        document.addEventListener("keydown", handleKeyDown);
        return () => {
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, [handleKeyDown]);

    return (
        <>
            {/* 侧边栏 */}
            <div
                className={cn(
                    "fixed top-0 right-0 h-full z-50 flex transition-transform duration-300 ease-in-out",
                    isOpen ? "translate-x-0" : "translate-x-[280px]",
                    className
                )}
            >
                {/* 展开/收起按钮 */}
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className={cn(
                        "absolute -left-12 top-1/2 -translate-y-1/2 w-12 h-24 rounded-l-2xl shadow-lg flex items-center justify-center transition-all duration-300 hover:scale-105",
                        "bg-gradient-to-r from-[#ff7043] to-[#f4511e] text-white",
                        isOpen && "from-gray-600 to-gray-700"
                    )}
                    aria-label={isOpen ? "收起菜单 (按 F 或 ESC)" : "展开菜单 (按 F)"}
                >
                    {isOpen ? (
                        <ChevronRight className="size-6" />
                    ) : (
                        <ChevronLeft className="size-6" />
                    )}
                </button>

                {/* 侧边栏内容 */}
                <div className="w-[280px] h-full bg-white/95 backdrop-blur-md shadow-2xl border-l border-gray-200 flex flex-col">
                    {/* 头部 */}
                    <div className="p-6 border-b border-gray-100">
                        <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                            <Menu className="size-5 text-[#ff7043]" />
                            菜单工具
                        </h2>
                        <p className="text-sm text-gray-500 mt-1">快捷操作面板</p>
                    </div>

                    {/* 菜单项 */}
                    <div className="flex-1 p-4 space-y-3">
                        {/* 一键生成菜单 */}
                        <Button
                            onClick={() => {
                                generateNewMenu();
                                // 可选：生成后关闭菜单
                                // setIsOpen(false);
                            }}
                            className="w-full h-14 bg-gradient-to-r from-[#ff7043] to-[#f4511e] hover:from-[#f4511e] hover:to-[#e64a19] text-white rounded-xl shadow-md transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-3 text-base font-medium"
                        >
                            <Shuffle className="size-5" />
                            一键生成下周菜单
                        </Button>

                        {/* 分割线 */}
                        <div className="h-px bg-gray-200 my-4" />

                        {/* 后台管理 */}
                        <Link href="/edit" className="block">
                            <Button
                                variant="outline"
                                className="w-full h-12 rounded-xl border-2 border-gray-200 hover:border-[#ff7043] hover:text-[#ff7043] transition-all hover:scale-[1.02] flex items-center justify-center gap-3 text-base"
                            >
                                <Settings className="size-5" />
                                后台管理
                            </Button>
                        </Link>
                    </div>

                    {/* 底部 */}
                    <div className="p-4 border-t border-gray-100 bg-gray-50/50">
                        <p className="text-xs text-gray-400 text-center">
                            按 <kbd className="px-1.5 py-0.5 bg-gray-200 rounded text-gray-600 font-mono">F</kbd> 打开/关闭菜单
                        </p>
                        <p className="text-xs text-gray-400 text-center mt-1">
                            点击卡片头部可更换颜色 🎨
                        </p>
                    </div>
                </div>
            </div>

            {/* 背景遮罩 - 点击可关闭 */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/20 z-40 transition-opacity duration-300"
                    onClick={() => setIsOpen(false)}
                />
            )}
        </>
    );
}
