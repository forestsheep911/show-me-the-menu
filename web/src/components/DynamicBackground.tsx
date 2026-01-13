"use client";

import { cn } from "@/lib/utils";
import { useMenuStore } from "@/store/menuStore";
import { DotPattern } from "@/components/ui/dot-pattern";
import { GridPattern } from "@/components/ui/grid-pattern";

/**
 * 动态背景组件
 * 根据 store 中的 backgroundSettings 渲染不同类型的背景
 */
export function DynamicBackground() {
    const backgroundSettings = useMenuStore((state) => state.backgroundSettings);

    // 渐变遮罩样式
    const maskStyle = "[mask-image:radial-gradient(ellipse_at_center,white_20%,transparent_80%)]";

    switch (backgroundSettings.type) {
        case 'dots':
            return (
                <DotPattern
                    width={24}
                    height={24}
                    cx={1}
                    cy={1}
                    cr={1.2}
                    className={cn(
                        "fixed inset-0 z-0",
                        maskStyle
                    )}
                    style={{ color: backgroundSettings.color }}
                />
            );

        case 'grid':
            return (
                <GridPattern
                    width={32}
                    height={32}
                    className={cn(
                        "fixed inset-0 z-0",
                        maskStyle
                    )}
                    strokeDasharray="0"
                    style={{ stroke: backgroundSettings.color }}
                />
            );

        case 'solid':
            return (
                <div
                    className="fixed inset-0 z-0"
                    style={{ backgroundColor: backgroundSettings.color }}
                />
            );

        case 'none':
        default:
            return null;
    }
}

// 预设背景配色方案
export const BACKGROUND_PRESETS = [
    { type: 'dots' as const, color: '#67e8f9', name: '青色圆点' },
    { type: 'dots' as const, color: '#fda4af', name: '粉色圆点' },
    { type: 'dots' as const, color: '#a5b4fc', name: '紫色圆点' },
    { type: 'dots' as const, color: '#86efac', name: '绿色圆点' },
    { type: 'dots' as const, color: '#fcd34d', name: '金色圆点' },
    { type: 'grid' as const, color: '#67e8f9', name: '青色网格' },
    { type: 'grid' as const, color: '#d1d5db', name: '灰色网格' },
    { type: 'grid' as const, color: '#fda4af', name: '粉色网格' },
    { type: 'solid' as const, color: '#fafafa', name: '浅灰纯色' },
    { type: 'solid' as const, color: '#f0f9ff', name: '浅蓝纯色' },
    { type: 'solid' as const, color: '#fef3c7', name: '暖黄纯色' },
    { type: 'none' as const, color: '', name: '无背景' },
];
