"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Settings, Shuffle, PanelLeftOpen, PanelLeftClose, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useMenuStore } from "@/store/menuStore";
import { Button } from "@/components/ui/button";

interface SideMenuProps {
    className?: string;
}

export function SideMenu({ className }: SideMenuProps) {
    const [isExpanded, setIsExpanded] = useState(false);
    const generateNewMenu = useMenuStore((state) => state.generateNewMenu);

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
            setIsExpanded((prev) => !prev);
        }

        if (e.key === "Escape" && isExpanded) {
            e.preventDefault();
            setIsExpanded(false);
        }
    }, [isExpanded]);

    useEffect(() => {
        document.addEventListener("keydown", handleKeyDown);
        return () => document.removeEventListener("keydown", handleKeyDown);
    }, [handleKeyDown]);

    return (
        <>
            <div
                className={cn(
                    "fixed inset-y-0 left-0 z-50 flex flex-col bg-white text-gray-800 transition-all duration-300 ease-[cubic-bezier(0.25,0.1,0.25,1.0)] border-r border-gray-200 shadow-xl",
                    isExpanded ? "w-64" : "w-[68px]",
                    className
                )}
                onMouseEnter={() => {
                    // Optional: Auto expand on hover if desired, but user asked for clicking. 
                    // Sticking to click for stability unless requested.
                }}
            >
                {/* Header / Toggle Area */}
                <div className="h-16 flex items-center justify-center shrink-0 border-b border-gray-100">
                    <button
                        onClick={() => setIsExpanded(!isExpanded)}
                        className={cn(
                            "group flex items-center justify-center w-10 h-10 rounded-lg hover:bg-gray-100 transition-colors text-gray-400 hover:text-gray-900",
                            isExpanded && "ml-auto mr-3" // Align right when expanded
                        )}
                        title={isExpanded ? "收起 (Esc)" : "展开菜单 (F)"}
                    >
                        {isExpanded ? <PanelLeftClose className="size-5" /> : <PanelLeftOpen className="size-5" />}
                    </button>

                    {isExpanded && (
                        <div className="absolute left-4 font-bold text-lg tracking-tight bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text text-transparent opacity-0 animate-in fade-in slide-in-from-left-2 duration-300 fill-mode-forwards" style={{ animationDelay: '100ms' }}>
                            ShowMenu
                        </div>
                    )}
                </div>

                {/* Scrollable Content */}
                <div className="flex-1 flex flex-col gap-3 p-3 overflow-x-hidden overflow-y-auto">
                    {/* Generate Menu Button */}
                    <button
                        onClick={() => {
                            generateNewMenu();
                            // Optional: Close on action
                            // setIsExpanded(false); 
                        }}
                        className={cn(
                            "relative flex items-center rounded-xl transition-all duration-200 group overflow-hidden",
                            isExpanded ? "w-full p-3 bg-gradient-to-br from-orange-50 to-orange-100/50 hover:from-orange-100 hover:to-orange-200/50 border border-orange-200/60" : "w-11 h-11 justify-center hover:bg-gray-100"
                        )}
                        title="一键生成下周菜单"
                    >
                        <div className={cn(
                            "flex items-center justify-center transition-all duration-300 z-10",
                            isExpanded ? "text-orange-600" : "text-gray-400 group-hover:text-orange-500"
                        )}>
                            <Shuffle className={cn("transition-transform", isExpanded ? "size-5" : "size-6")} />
                        </div>

                        {/* Text Label - Only visible when expanded */}
                        <div className={cn(
                            "absolute left-10 ml-1 whitespace-nowrap transition-all duration-300 ease-in-out flex flex-col items-start gap-0.5",
                            isExpanded ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4 pointer-events-none"
                        )}>
                            <span className="font-medium text-orange-900/80 text-[15px]">生成下周菜单</span>
                            <span className="text-[10px] text-orange-700/50">随机生成新食谱</span>
                        </div>

                        {isExpanded && (
                            <ChevronRight className="absolute right-3 size-4 text-orange-400/50 group-hover:text-orange-500 transition-colors" />
                        )}
                    </button>

                    <div className={cn("h-px bg-gray-100 my-1 mx-2", !isExpanded && "mx-1")} />

                    {/* Admin Link */}
                    <Link
                        href="/edit"
                        className={cn(
                            "relative flex items-center rounded-xl transition-all duration-200 group overflow-hidden",
                            isExpanded ? "w-full p-3 hover:bg-gray-100" : "w-11 h-11 justify-center hover:bg-gray-100"
                        )}
                        title="后台管理"
                    >
                        <div className={cn(
                            "flex items-center justify-center transition-all duration-300 z-10",
                            isExpanded ? "text-gray-400 group-hover:text-gray-600" : "text-gray-400 group-hover:text-gray-600"
                        )}>
                            <Settings className={cn("transition-transform", isExpanded ? "size-5" : "size-6")} />
                        </div>

                        <div className={cn(
                            "absolute left-10 ml-1 whitespace-nowrap transition-all duration-300 ease-in-out",
                            isExpanded ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4 pointer-events-none"
                        )}>
                            <span className="font-medium text-gray-600 text-[15px] group-hover:text-gray-900 transition-colors">后台管理</span>
                        </div>
                    </Link>
                </div>

                {/* Footer User/Profile Area - Placeholder for "Premium" feel */}
                <div className="p-3 border-t border-gray-100 mt-auto">
                    <button className={cn(
                        "flex items-center rounded-lg transition-all duration-200 hover:bg-gray-50",
                        isExpanded ? "w-full p-2 gap-3" : "w-11 h-11 justify-center"
                    )}>
                        <div className="size-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 shrink-0 flex items-center justify-center text-xs font-bold text-white shadow-sm ring-2 ring-white">
                            Me
                        </div>
                        <div className={cn(
                            "text-left overflow-hidden transition-all duration-300",
                            isExpanded ? "w-auto opacity-100" : "w-0 opacity-0"
                        )}>
                            <div className="text-sm font-medium text-gray-700 truncate">Forest</div>
                            <div className="text-xs text-gray-400 truncate">Pro Plan</div>
                        </div>
                    </button>
                </div>
            </div>

            {/* Content Backdrop - Optional, if we want to dim the page when expanded on mobile */}
            {isExpanded && (
                <div
                    className="fixed inset-0 bg-black/20 z-40 md:hidden animate-in fade-in duration-300"
                    onClick={() => setIsExpanded(false)}
                />
            )}
        </>
    );
}
