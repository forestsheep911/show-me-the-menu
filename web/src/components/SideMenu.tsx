"use client";

import { useState, useEffect, useCallback, RefObject } from "react";
import Link from "next/link";
import { Settings, Shuffle, ChevronRight, Pin, PinOff, Camera, Loader2, PanelLeftOpen, PanelLeftClose } from "lucide-react";
import { cn } from "@/lib/utils";
import { useMenuStore } from "@/store/menuStore";
import { toPng } from "html-to-image";

// 菜单宽度常量
const MENU_WIDTH_COLLAPSED = 68; // 窄版：只显示图标
const MENU_WIDTH_EXPANDED = 256; // 宽版：显示完整内容

interface SideMenuProps {
    className?: string;
    weekViewRef?: RefObject<HTMLDivElement | null>;
}

export function SideMenu({ className, weekViewRef }: SideMenuProps) {
    const [isPinned, setIsPinned] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false); // 是否展开（宽版）
    const [isHovered, setIsHovered] = useState(false);
    const [isCapturing, setIsCapturing] = useState(false);
    const generateNewMenu = useMenuStore((state) => state.generateNewMenu);

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

    // 实际显示宽度的逻辑：
    // - 非固定模式：hover时展开，否则收窄
    // - 固定模式：根据 isExpanded 状态决定
    const showExpanded = isPinned ? isExpanded : isHovered;

    const handleKeyDown = useCallback((e: KeyboardEvent) => {
        const target = e.target as HTMLElement;
        if (
            target.tagName === "INPUT" ||
            target.tagName === "TEXTAREA" ||
            target.isContentEditable
        ) {
            return;
        }

        if (e.key === "f" || e.key === "F") {
            e.preventDefault();
            setIsPinned((prev) => !prev);
        }

        if (e.key === "Escape" && isPinned) {
            e.preventDefault();
            setIsPinned(false);
        }
    }, [isPinned]);

    useEffect(() => {
        document.addEventListener("keydown", handleKeyDown);
        return () => document.removeEventListener("keydown", handleKeyDown);
    }, [handleKeyDown]);

    const handleMouseLeaveMenu = useCallback(() => {
        if (!isPinned) {
            setIsHovered(false);
        }
    }, [isPinned]);

    // 计算当前菜单宽度
    const currentWidth = showExpanded ? MENU_WIDTH_EXPANDED : MENU_WIDTH_COLLAPSED;

    return (
        <>
            {/* 占位元素：当固定时在文档流中占据空间 */}
            {isPinned && (
                <div
                    className="h-screen shrink-0 transition-all duration-300 ease-[cubic-bezier(0.25,0.1,0.25,1.0)]"
                    style={{ width: currentWidth }}
                />
            )}

            {/* 菜单主体 */}
            <div
                className={cn(
                    "fixed top-0 left-0 h-screen flex flex-col bg-white text-gray-800 transition-all duration-300 ease-[cubic-bezier(0.25,0.1,0.25,1.0)] border-r border-gray-200 shadow-xl overflow-hidden z-50",
                    className
                )}
                style={{ width: currentWidth }}
                onMouseEnter={() => !isPinned && setIsHovered(true)}
                onMouseLeave={handleMouseLeaveMenu}
            >
                {/* Header / Toggle Area */}
                <div className="h-16 flex items-center shrink-0 border-b border-gray-100 px-3">
                    {/* Logo - 只在展开时显示 */}
                    <div className={cn(
                        "font-bold text-lg tracking-tight bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text text-transparent transition-all duration-300 whitespace-nowrap overflow-hidden",
                        showExpanded ? "opacity-100 w-auto" : "opacity-0 w-0"
                    )}>
                        ShowMenu
                    </div>

                    {/* 按钮区域 */}
                    <div className={cn(
                        "flex items-center gap-1 transition-all duration-300",
                        showExpanded ? "ml-auto" : "mx-auto"
                    )}>
                        {/* 展开/收起按钮 - 只在固定模式下显示 */}
                        {isPinned && (
                            <button
                                onClick={() => setIsExpanded(!isExpanded)}
                                className="group flex items-center justify-center w-9 h-9 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all duration-200"
                                title={isExpanded ? "收起菜单" : "展开菜单"}
                            >
                                {isExpanded ? (
                                    <PanelLeftClose className="size-4" />
                                ) : (
                                    <PanelLeftOpen className="size-4" />
                                )}
                            </button>
                        )}

                        {/* Pin 按钮 - 只在展开时显示，或者非固定模式下显示 */}
                        {(showExpanded || !isPinned) && (
                            <button
                                onClick={() => {
                                    setIsPinned(!isPinned);
                                    // 固定时默认展开
                                    if (!isPinned) {
                                        setIsExpanded(true);
                                    }
                                }}
                                className={cn(
                                    "group flex items-center justify-center w-9 h-9 rounded-lg transition-all duration-200",
                                    isPinned
                                        ? "bg-orange-100 text-orange-600 hover:bg-orange-200"
                                        : "text-gray-400 hover:text-gray-600 hover:bg-gray-100"
                                )}
                                title={isPinned ? "取消固定 (F)" : "固定菜单 (F)"}
                            >
                                {isPinned ? (
                                    <Pin className="size-4" />
                                ) : (
                                    <PinOff className="size-4" />
                                )}
                            </button>
                        )}
                    </div>
                </div>

                {/* Scrollable Content */}
                <div className="flex-1 flex flex-col gap-2 p-2 overflow-x-hidden overflow-y-auto">
                    {/* Generate Menu Button */}
                    <button
                        onClick={() => generateNewMenu()}
                        className={cn(
                            "relative flex items-center rounded-xl transition-all duration-200 group overflow-hidden bg-gradient-to-br from-orange-50 to-orange-100/50 hover:from-orange-100 hover:to-orange-200/50 border border-orange-200/60",
                            showExpanded ? "w-full p-3" : "w-12 h-12 justify-center mx-auto"
                        )}
                        title="一键生成下周菜单"
                    >
                        <div className={cn(
                            "flex items-center justify-center text-orange-600 transition-all duration-300",
                            showExpanded ? "" : "mx-auto"
                        )}>
                            <Shuffle className={cn("transition-transform", showExpanded ? "size-5" : "size-6")} />
                        </div>

                        {/* Text - 只在展开时显示 */}
                        <div className={cn(
                            "ml-3 flex flex-col items-start gap-0.5 whitespace-nowrap transition-all duration-300",
                            showExpanded ? "opacity-100" : "opacity-0 w-0 ml-0 pointer-events-none"
                        )}>
                            <span className="font-medium text-orange-900/80 text-[15px]">生成下周菜单</span>
                            <span className="text-[10px] text-orange-700/50">随机生成新食谱</span>
                        </div>

                        {showExpanded && (
                            <ChevronRight className="absolute right-3 size-4 text-orange-400/50 group-hover:text-orange-500 transition-colors" />
                        )}
                    </button>

                    {/* Screenshot Button */}
                    <button
                        onClick={handleCapture}
                        disabled={isCapturing || !weekViewRef}
                        className={cn(
                            "relative flex items-center rounded-xl transition-all duration-200 group overflow-hidden bg-gradient-to-br from-blue-50 to-blue-100/50 hover:from-blue-100 hover:to-blue-200/50 border border-blue-200/60 disabled:opacity-50 disabled:cursor-not-allowed",
                            showExpanded ? "w-full p-3" : "w-12 h-12 justify-center mx-auto"
                        )}
                        title="截图保存菜单"
                    >
                        <div className={cn(
                            "flex items-center justify-center text-blue-600 transition-all duration-300",
                            showExpanded ? "" : "mx-auto"
                        )}>
                            {isCapturing ? (
                                <Loader2 className={cn("animate-spin", showExpanded ? "size-5" : "size-6")} />
                            ) : (
                                <Camera className={cn("transition-transform", showExpanded ? "size-5" : "size-6")} />
                            )}
                        </div>

                        <div className={cn(
                            "ml-3 flex flex-col items-start gap-0.5 whitespace-nowrap transition-all duration-300",
                            showExpanded ? "opacity-100" : "opacity-0 w-0 ml-0 pointer-events-none"
                        )}>
                            <span className="font-medium text-blue-900/80 text-[15px]">
                                {isCapturing ? '正在截图...' : '截图保存'}
                            </span>
                            <span className="text-[10px] text-blue-700/50">完整菜单高清图片</span>
                        </div>

                        {showExpanded && (
                            <ChevronRight className="absolute right-3 size-4 text-blue-400/50 group-hover:text-blue-500 transition-colors" />
                        )}
                    </button>

                    <div className={cn("h-px bg-gray-100 my-1", showExpanded ? "mx-2" : "mx-1")} />

                    {/* Admin Link */}
                    <Link
                        href="/edit"
                        className={cn(
                            "relative flex items-center rounded-xl transition-all duration-200 group overflow-hidden hover:bg-gray-100",
                            showExpanded ? "w-full p-3" : "w-12 h-12 justify-center mx-auto"
                        )}
                        title="后台管理"
                    >
                        <div className={cn(
                            "flex items-center justify-center text-gray-400 group-hover:text-gray-600 transition-all duration-300",
                            showExpanded ? "" : "mx-auto"
                        )}>
                            <Settings className={cn("transition-transform", showExpanded ? "size-5" : "size-6")} />
                        </div>

                        <div className={cn(
                            "ml-3 whitespace-nowrap transition-all duration-300",
                            showExpanded ? "opacity-100" : "opacity-0 w-0 ml-0 pointer-events-none"
                        )}>
                            <span className="font-medium text-gray-600 text-[15px] group-hover:text-gray-900 transition-colors">后台管理</span>
                        </div>
                    </Link>
                </div>

                {/* Footer User/Profile Area */}
                <div className="p-2 border-t border-gray-100 mt-auto">
                    <button className={cn(
                        "flex items-center rounded-lg transition-all duration-200 hover:bg-gray-50",
                        showExpanded ? "w-full p-2 gap-3" : "w-12 h-12 justify-center mx-auto"
                    )}>
                        <div className="size-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 shrink-0 flex items-center justify-center text-xs font-bold text-white shadow-sm ring-2 ring-white">
                            Me
                        </div>
                        <div className={cn(
                            "text-left overflow-hidden whitespace-nowrap transition-all duration-300",
                            showExpanded ? "w-auto opacity-100" : "w-0 opacity-0"
                        )}>
                            <div className="text-sm font-medium text-gray-700 truncate">Forest</div>
                            <div className="text-xs text-gray-400 truncate">Pro Plan</div>
                        </div>
                    </button>
                </div>
            </div>

            {/* Content Backdrop - 非固定模式下悬停时的背景遮罩 */}
            {!isPinned && isHovered && (
                <div
                    className="fixed inset-0 bg-black/10 z-40 animate-in fade-in duration-200"
                    onClick={() => setIsHovered(false)}
                />
            )}
        </>
    );
}
