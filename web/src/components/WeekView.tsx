"use client";

import { useMenuStore } from "@/store/menuStore";
import { DayCard } from "./DayCard";
import { DndContext, DragEndEvent, closestCenter, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { SortableContext, horizontalListSortingStrategy } from "@dnd-kit/sortable";
import { Button } from "./ui/button";
import { Shuffle } from "lucide-react";

export function WeekView() {
  const { weeklyMenu, setWeeklyMenu, generateNewMenu } = useMenuStore();

  // Hydration fix: Zustand persist might cause mismatch, but here we just need to ensure initial render matches
  const sensors = useSensors(
    useSensor(PointerSensor, {
        activationConstraint: {
            distance: 8, // 移动 8px 后才开始拖拽，防止误触点击
        },
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      const oldIndex = weeklyMenu.findIndex((item) => item.day === active.id);
      const newIndex = weeklyMenu.findIndex((item) => item.day === over.id);
      
      // 注意：这里我们移动的是整个 DayMenu 对象，也就是交换了两天的菜单
      // 如果只想交换“内容”而保持“周几”不变，需要单独处理逻辑
      // 这里暂时实现为交换位置（例如周一的内容换到周二位置，但通常用户期望的是周一变周二？）
      // 实际上对于“排班表”，通常是交换内容。
      // 我们来做一个“交换内容但保持周几Title不变”的逻辑
      
      const newMenu = [...weeklyMenu];
      // 交换 entries, theme, color
      const tempEntries = newMenu[oldIndex].entries;
      const tempTheme = newMenu[oldIndex].theme;
      const tempColor = newMenu[oldIndex].color;

      newMenu[oldIndex] = {
        ...newMenu[oldIndex],
        entries: newMenu[newIndex].entries,
        theme: newMenu[newIndex].theme,
        color: newMenu[newIndex].color
      };

      newMenu[newIndex] = {
        ...newMenu[newIndex],
        entries: tempEntries,
        theme: tempTheme,
        color: tempColor
      };

      setWeeklyMenu(newMenu);
    }
  };

  return (
    <div className="flex flex-col items-center gap-8 w-full">
        <div className="flex gap-4">
            <Button 
                onClick={generateNewMenu}
                className="bg-[#ff7043] hover:bg-[#f4511e] text-white rounded-full px-8 py-6 text-lg shadow-md transition-all hover:scale-105 active:scale-95"
            >
                <Shuffle className="mr-2 h-5 w-5" />
                一键生成下周菜单
            </Button>
        </div>

        <DndContext 
            id="menu-dnd-context"
            sensors={sensors} 
            collisionDetection={closestCenter} 
            onDragEnd={handleDragEnd}
        >
            <SortableContext 
                items={weeklyMenu.map(d => d.day)} 
                strategy={horizontalListSortingStrategy}
            >
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4 w-full px-4 h-full">
                    {weeklyMenu.map((dayMenu, index) => (
                        <DayCard 
                            key={dayMenu.day} 
                            menu={dayMenu} 
                            index={index}
                            className="w-full h-full"
                        />
                    ))}
                </div>
            </SortableContext>
        </DndContext>
    </div>
  );
}
