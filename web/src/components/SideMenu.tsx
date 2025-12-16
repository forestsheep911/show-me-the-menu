"use client";

import { useState, useEffect, useCallback, RefObject } from "react";
import Link from "next/link";
import { Settings, Shuffle, ChevronRight, Pin, PinOff, Camera, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useMenuStore } from "@/store/menuStore";
import { toPng } from "html-to-image";

interface SideMenuProps {
    className?: string;
    weekViewRef?: RefObject<HTMLDivElement | null>;
}

export function SideMenu({ className, weekViewRef }: SideMenuProps) {
    const [isPinned, setIsPinned] = useState(false);
    const [isHovered, setIsHovered] = useState(false);
    const [isCapturing, setIsCapturing] = useState(false);
    const generateNewMenu = useMenuStore((state) => state.generateNewMenu);

    // 截图功能
    const handleCapture = useCallback(async () => {
        if (!weekViewRef?.current || isCapturing) return;

        setIsCapturing(true);
        try {
            const dataUrl = await toPng(weekViewRef.current, {
                backgroundColor: '#fafafa', // 匹配 bg-gray-50/50
                quality: 1.0,
                pixelRatio: 2, // 高清截图
            });

            // 创建下载链接
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

    // 展开状态：固定时始终展开，非固定时只在hover时展开
    const isExpanded = isPinned || isHovered;

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

    return (
        <>
            {/* 占位元素：当固定时在文档流中占据空间，把主内容往右推 */}
            {isPinned && (
                <div className="w-64 h-screen shrink-0" />
            )}

            {/* 鼠标触发区域：非固定时在最左边显示一个隐形的触发区 */}
            {!isPinned && !isHovered && (
                <div
                    className="fixed left-0 top-0 h-screen w-3 z-50"
                    onMouseEnter={() => setIsHovered(true)}
                />
            )}

            {/* 菜单主体 - 始终使用 fixed 定位保持一致性 */}
            <div
                className={cn(
                    "fixed top-0 left-0 h-screen flex flex-col bg-white text-gray-800 transition-all duration-300 ease-[cubic-bezier(0.25,0.1,0.25,1.0)] border-r border-gray-200 shadow-xl overflow-hidden z-50",
                    isExpanded ? "w-64" : "w-0",
                    className
                )}
                onMouseEnter={() => !isPinned && setIsHovered(true)}
                onMouseLeave={handleMouseLeaveMenu}
            >
                {/* 内部容器：固定宽度，防止内容被压缩 */}
                <div className="w-64 h-full flex flex-col">
                    {/* Header / Toggle Area */}
                    <div className="h-16 flex items-center justify-between shrink-0 border-b border-gray-100 px-3">
                        {/* 左侧 Logo */}
                        <div className="font-bold text-lg tracking-tight bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text text-transparent">
                            ShowMenu
                        </div>

                        {/* Pin 按钮 */}
                        <button
                            onClick={() => setIsPinned(!isPinned)}
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
                    </div>

                    {/* Scrollable Content */}
                    <div className="flex-1 flex flex-col gap-3 p-3 overflow-x-hidden overflow-y-auto">
                        {/* Generate Menu Button */}
                        <button
                            onClick={() => {
                                generateNewMenu();
                            }}
                            className="relative flex items-center w-full p-3 rounded-xl transition-all duration-200 group overflow-hidden bg-gradient-to-br from-orange-50 to-orange-100/50 hover:from-orange-100 hover:to-orange-200/50 border border-orange-200/60"
                            title="一键生成下周菜单"
                        >
                            <div className="flex items-center justify-center text-orange-600">
                                <Shuffle className="size-5" />
                            </div>

                            <div className="ml-3 flex flex-col items-start gap-0.5">
                                <span className="font-medium text-orange-900/80 text-[15px]">生成下周菜单</span>
                                <span className="text-[10px] text-orange-700/50">随机生成新食谱</span>
                            </div>

                            <ChevronRight className="absolute right-3 size-4 text-orange-400/50 group-hover:text-orange-500 transition-colors" />
                        </button>

                        {/* Screenshot Button */}
                        <button
                            onClick={handleCapture}
                            disabled={isCapturing || !weekViewRef}
                            className="relative flex items-center w-full p-3 rounded-xl transition-all duration-200 group overflow-hidden bg-gradient-to-br from-blue-50 to-blue-100/50 hover:from-blue-100 hover:to-blue-200/50 border border-blue-200/60 disabled:opacity-50 disabled:cursor-not-allowed"
                            title="截图保存菜单"
                        >
                            <div className="flex items-center justify-center text-blue-600">
                                {isCapturing ? (
                                    <Loader2 className="size-5 animate-spin" />
                                ) : (
                                    <Camera className="size-5" />
                                )}
                            </div>

                            <div className="ml-3 flex flex-col items-start gap-0.5">
                                <span className="font-medium text-blue-900/80 text-[15px]">
                                    {isCapturing ? '正在截图...' : '截图保存'}
                                </span>
                                <span className="text-[10px] text-blue-700/50">完整菜单高清图片</span>
                            </div>

                            <ChevronRight className="absolute right-3 size-4 text-blue-400/50 group-hover:text-blue-500 transition-colors" />
                        </button>

                        <div className="h-px bg-gray-100 my-1 mx-2" />

                        {/* Admin Link */}
                        <Link
                            href="/edit"
                            className="relative flex items-center w-full p-3 rounded-xl transition-all duration-200 group overflow-hidden hover:bg-gray-100"
                            title="后台管理"
                        >
                            <div className="flex items-center justify-center text-gray-400 group-hover:text-gray-600">
                                <Settings className="size-5" />
                            </div>

                            <div className="ml-3">
                                <span className="font-medium text-gray-600 text-[15px] group-hover:text-gray-900 transition-colors">后台管理</span>
                            </div>
                        </Link>
                    </div>

                    {/* Footer User/Profile Area */}
                    <div className="p-3 border-t border-gray-100 mt-auto">
                        <button className="flex items-center w-full p-2 gap-3 rounded-lg transition-all duration-200 hover:bg-gray-50">
                            <div className="size-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 shrink-0 flex items-center justify-center text-xs font-bold text-white shadow-sm ring-2 ring-white">
                                Me
                            </div>
                            <div className="text-left overflow-hidden">
                                <div className="text-sm font-medium text-gray-700 truncate">Forest</div>
                                <div className="text-xs text-gray-400 truncate">Pro Plan</div>
                            </div>
                        </button>
                    </div>
                </div>
            </div>

            {/* Content Backdrop - 浮动模式下的背景遮罩 */}
            {!isPinned && isHovered && (
                <div
                    className="fixed inset-0 bg-black/10 z-40 animate-in fade-in duration-200"
                    onClick={() => setIsHovered(false)}
                />
            )}
        </>
    );
}
