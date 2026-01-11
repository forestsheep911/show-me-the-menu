"use client";

import { useState, useEffect, useCallback, RefObject } from "react";
import Link from "next/link";
import { Settings, Shuffle, ChevronRight, Camera, Loader2, PanelLeftOpen, PanelLeftClose, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { useMenuStore, MAX_CARDS } from "@/store/menuStore";
import { toPng } from "html-to-image";
import { ShimmerButton } from "@/components/ui/shimmer-button";
import { BlurFade } from "@/components/ui/blur-fade";

// 菜单宽度常量
const MENU_WIDTH_COLLAPSED = 68; // 窄版：只显示图标
const MENU_WIDTH_EXPANDED = 256; // 宽版：显示完整内容

interface SideMenuProps {
    className?: string;
    weekViewRef?: RefObject<HTMLDivElement | null>;
}

export function SideMenu({ className, weekViewRef }: SideMenuProps) {
    const [isExpanded, setIsExpanded] = useState(false);
    const [isCapturing, setIsCapturing] = useState(false);
    const generateNewMenu = useMenuStore((state) => state.generateNewMenu);
    const addDayCard = useMenuStore((state) => state.addDayCard);
    const weeklyMenu = useMenuStore((state) => state.weeklyMenu);

    // 截图功能
    const handleCapture = useCallback(async () => {
        if (!weekViewRef?.current || isCapturing) return;

        setIsCapturing(true);
        try {
            const dataUrl = await toPng(weekViewRef.current, {
                backgroundColor: '#fafafa',
                quality: 1.0,
                pixelRatio: 2,
            });

            const link = document.createElement('a');
            const now = new Date();
            const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
            link.download = `周菜单_${dateStr}.png`;
            link.href = dataUrl;
            link.click();
        } catch (error) {
            console.error('截图失败:', error);
            alert('截图失败，请重试');
        } finally {
            setIsCapturing(false);
        }
    }, [weekViewRef, isCapturing]);

    const handleKeyDown = useCallback((e: KeyboardEvent) => {
        const target = e.target as HTMLElement;
        if (
            target.tagName === "INPUT" ||
            target.tagName === "TEXTAREA" ||
            target.isContentEditable
        ) {
            return;
        }

        // F 键切换展开/收起
        if (e.key === "f" || e.key === "F") {
            e.preventDefault();
            setIsExpanded((prev) => !prev);
        }

        // Escape 键收起菜单
        if (e.key === "Escape" && isExpanded) {
            e.preventDefault();
            setIsExpanded(false);
        }
    }, [isExpanded]);

    useEffect(() => {
        document.addEventListener("keydown", handleKeyDown);
        return () => document.removeEventListener("keydown", handleKeyDown);
    }, [handleKeyDown]);

    // 计算当前菜单宽度
    const currentWidth = isExpanded ? MENU_WIDTH_EXPANDED : MENU_WIDTH_COLLAPSED;

    // 点击展开/收起按钮
    const handleToggleExpand = () => {
        setIsExpanded(!isExpanded);
    };

    return (
        <>
            {/* 占位元素 */}
            <div
                className="h-screen shrink-0 transition-all duration-300 ease-[cubic-bezier(0.25,0.1,0.25,1.0)]"
                style={{ width: currentWidth }}
            />

            {/* 菜单主体 */}
            <div
                className={cn(
                    "fixed top-0 left-0 h-screen flex flex-col bg-white/95 backdrop-blur-md text-gray-800 transition-all duration-300 ease-[cubic-bezier(0.25,0.1,0.25,1.0)] border-r border-gray-200/80 shadow-xl overflow-hidden z-50",
                    className
                )}
                style={{ width: currentWidth }}
            >
                {/* Header / Toggle Area */}
                <div className="h-16 flex items-center shrink-0 border-b border-gray-100 px-3">
                    <button
                        onClick={handleToggleExpand}
                        className={cn(
                            "group flex items-center justify-center w-9 h-9 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all duration-200",
                            isExpanded ? "" : "mx-auto"
                        )}
                        title={isExpanded ? "收起菜单 (F)" : "展开菜单 (F)"}
                    >
                        {isExpanded ? (
                            <PanelLeftClose className="size-5" />
                        ) : (
                            <PanelLeftOpen className="size-5" />
                        )}
                    </button>
                </div>

                {/* Scrollable Content */}
                <div className="flex-1 flex flex-col gap-2 p-2 overflow-x-hidden overflow-y-auto">
                    {/* Generate Menu Button - 使用 ShimmerButton */}
                    <BlurFade delay={0.05} direction="right">
                        {isExpanded ? (
                            <ShimmerButton
                                onClick={() => generateNewMenu()}
                                shimmerColor="#fb923c"
                                shimmerSize="0.08em"
                                shimmerDuration="2.5s"
                                borderRadius="12px"
                                background="linear-gradient(135deg, #f97316 0%, #ea580c 100%)"
                                className="w-full py-3 px-4 text-sm font-medium"
                            >
                                <Shuffle className="size-4 mr-2" />
                                生成下周菜单
                            </ShimmerButton>
                        ) : (
                            <button
                                onClick={() => generateNewMenu()}
                                className="w-12 h-12 mx-auto flex items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 text-white shadow-lg shadow-orange-500/25 hover:shadow-xl hover:shadow-orange-500/30 hover:scale-105 transition-all duration-200"
                                title="生成下周菜单"
                            >
                                <Shuffle className="size-5" />
                            </button>
                        )}
                    </BlurFade>

                    {/* Screenshot Button */}
                    <BlurFade delay={0.1} direction="right">
                        {isExpanded ? (
                            <ShimmerButton
                                onClick={handleCapture}
                                disabled={isCapturing || !weekViewRef}
                                shimmerColor="#60a5fa"
                                shimmerSize="0.08em"
                                shimmerDuration="2.5s"
                                borderRadius="12px"
                                background="linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)"
                                className="w-full py-3 px-4 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isCapturing ? (
                                    <Loader2 className="size-4 mr-2 animate-spin" />
                                ) : (
                                    <Camera className="size-4 mr-2" />
                                )}
                                {isCapturing ? '正在截图...' : '截图保存'}
                            </ShimmerButton>
                        ) : (
                            <button
                                onClick={handleCapture}
                                disabled={isCapturing || !weekViewRef}
                                className="w-12 h-12 mx-auto flex items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30 hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                                title="截图保存"
                            >
                                {isCapturing ? (
                                    <Loader2 className="size-5 animate-spin" />
                                ) : (
                                    <Camera className="size-5" />
                                )}
                            </button>
                        )}
                    </BlurFade>

                    {/* Add Card Button */}
                    <BlurFade delay={0.15} direction="right">
                        {isExpanded ? (
                            <ShimmerButton
                                onClick={addDayCard}
                                disabled={weeklyMenu.length >= MAX_CARDS}
                                shimmerColor="#4ade80"
                                shimmerSize="0.08em"
                                shimmerDuration="2.5s"
                                borderRadius="12px"
                                background="linear-gradient(135deg, #22c55e 0%, #16a34a 100%)"
                                className="w-full py-3 px-4 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <Plus className="size-4 mr-2" />
                                添加卡片 ({weeklyMenu.length}/{MAX_CARDS})
                            </ShimmerButton>
                        ) : (
                            <button
                                onClick={addDayCard}
                                disabled={weeklyMenu.length >= MAX_CARDS}
                                className="w-12 h-12 mx-auto flex items-center justify-center rounded-xl bg-gradient-to-br from-green-500 to-green-600 text-white shadow-lg shadow-green-500/25 hover:shadow-xl hover:shadow-green-500/30 hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                                title={weeklyMenu.length >= MAX_CARDS ? `已达上限 (${MAX_CARDS})` : `添加卡片 (${weeklyMenu.length}/${MAX_CARDS})`}
                            >
                                <Plus className="size-5" />
                            </button>
                        )}
                    </BlurFade>

                    <div className={cn("h-px bg-gray-100 my-1", isExpanded ? "mx-2" : "mx-1")} />

                    {/* Admin Link */}
                    <BlurFade delay={0.2} direction="right">
                        <Link
                            href="/edit"
                            className={cn(
                                "relative flex items-center rounded-xl transition-all duration-200 group overflow-hidden hover:bg-gray-100",
                                isExpanded ? "w-full p-3" : "w-12 h-12 justify-center mx-auto"
                            )}
                            title="后台管理"
                        >
                            <div className={cn(
                                "flex items-center justify-center text-gray-400 group-hover:text-gray-600 transition-all duration-300",
                                isExpanded ? "" : "mx-auto"
                            )}>
                                <Settings className={cn("transition-transform group-hover:rotate-45", isExpanded ? "size-5" : "size-6")} />
                            </div>

                            {isExpanded && (
                                <div className="ml-3 flex items-center justify-between flex-1 whitespace-nowrap overflow-hidden">
                                    <span className="font-medium text-gray-600 text-[15px] group-hover:text-gray-900 transition-colors">后台管理</span>
                                    <ChevronRight className="size-4 text-gray-300 group-hover:text-gray-500 group-hover:translate-x-1 transition-all shrink-0" />
                                </div>
                            )}
                        </Link>
                    </BlurFade>
                </div>

                {/* Footer User/Profile Area */}
                <div className="p-2 border-t border-gray-100 mt-auto">
                    <BlurFade delay={0.25} direction="up">
                        <button className={cn(
                            "flex items-center rounded-lg transition-all duration-200 hover:bg-gray-50",
                            isExpanded ? "w-full p-2 gap-3" : "w-12 h-12 justify-center mx-auto"
                        )}>
                            <div className="size-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 shrink-0 flex items-center justify-center text-xs font-bold text-white shadow-sm ring-2 ring-white">
                                Me
                            </div>
                            {isExpanded && (
                                <div className="text-left overflow-hidden whitespace-nowrap">
                                    <div className="text-sm font-medium text-gray-700 truncate">Forest</div>
                                    <div className="text-xs text-gray-400 truncate">Pro Plan</div>
                                </div>
                            )}
                        </button>
                    </BlurFade>
                </div>
            </div>
        </>
    );
}
