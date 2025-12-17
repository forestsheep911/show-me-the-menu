"use client";

import { useState, useMemo } from "react";
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragStartEvent,
  DragOverlay,
  pointerWithin,
  PointerSensor,
  useSensor,
  useSensors,
  UniqueIdentifier,
  MeasuringStrategy,
} from "@dnd-kit/core";

import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useMenuStore } from "@/store/menuStore";
import { DayCard } from "./DayCard";
import { DishCard } from "./DishCard";
import { DayMenu, MenuEntry, Dish, Tag } from "@/types/menu";

interface DragData {
  type: "dish";
  entry: MenuEntry;
  dayIndex: number;
}

export function WeekView() {
  const { weeklyMenu, setWeeklyMenu, moveDishEntry, dishes, tags } = useMenuStore();
  const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null);
  const [activeEntry, setActiveEntry] = useState<MenuEntry | null>(null);
  const [overDayIndex, setOverDayIndex] = useState<number | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    })
  );

  // 收集所有 entry ids 用于 SortableContext
  const allEntryIds = useMemo(() => {
    return weeklyMenu.flatMap((day: DayMenu) => day.entries.map((e: MenuEntry) => e.id));
  }, [weeklyMenu]);

  // 按天分组的 entry ids
  const entryIdsByDay = useMemo(() => {
    return weeklyMenu.map((day: DayMenu) => day.entries.map((e: MenuEntry) => e.id));
  }, [weeklyMenu]);

  // 找到 entry 所属的天索引
  const findDayIndexByEntryId = (entryId: string): number => {
    for (let i = 0; i < weeklyMenu.length; i++) {
      if (weeklyMenu[i].entries.some((e: MenuEntry) => e.id === entryId)) {
        return i;
      }
    }
    return -1;
  };

  // 处理天卡片拖拽结束 (交换两天内容)
  const handleDayDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const activeData = active.data.current as { type?: string } | undefined;
    if (activeData?.type === "dish") return; // 跳过菜品拖拽

    const oldIndex = weeklyMenu.findIndex((item: DayMenu) => item.day === active.id);
    const newIndex = weeklyMenu.findIndex((item: DayMenu) => item.day === over.id);

    if (oldIndex === -1 || newIndex === -1) return;

    const newMenu = [...weeklyMenu];
    const tempEntries = newMenu[oldIndex].entries;
    const tempTheme = newMenu[oldIndex].theme;
    const tempColor = newMenu[oldIndex].color;
    const tempLocked = newMenu[oldIndex].locked;
    const tempNote = newMenu[oldIndex].note;

    newMenu[oldIndex] = {
      ...newMenu[oldIndex],
      entries: newMenu[newIndex].entries,
      theme: newMenu[newIndex].theme,
      color: newMenu[newIndex].color,
      locked: newMenu[newIndex].locked,
      note: newMenu[newIndex].note,
    };

    newMenu[newIndex] = {
      ...newMenu[newIndex],
      entries: tempEntries,
      theme: tempTheme,
      color: tempColor,
      locked: tempLocked,
      note: tempNote,
    };

    setWeeklyMenu(newMenu);
  };

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const data = active.data.current as DragData | undefined;

    if (data?.type === "dish") {
      setActiveId(active.id);
      setActiveEntry(data.entry);
    }
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) {
      setOverDayIndex(null);
      return;
    }

    const activeData = active.data.current as DragData | undefined;
    if (activeData?.type !== "dish") return;

    // 检查是否 over 在某个 day container 上
    const overData = over.data.current as { type?: string; dayIndex?: number } | undefined;

    if (overData?.type === "dish" && overData.dayIndex !== undefined) {
      setOverDayIndex(overData.dayIndex);
    } else if (overData?.type === "day-container" && overData.dayIndex !== undefined) {
      setOverDayIndex(overData.dayIndex);
    } else if (overData?.type === "day-end-zone" && overData.dayIndex !== undefined) {
      setOverDayIndex(overData.dayIndex);
    } else {
      // 尝试从 entry id 找到天
      const dayIndex = findDayIndexByEntryId(over.id as string);
      if (dayIndex !== -1) {
        setOverDayIndex(dayIndex);
      }
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    setActiveId(null);
    setActiveEntry(null);
    setOverDayIndex(null);

    if (!over) return;

    const activeData = active.data.current as DragData | undefined;
    if (activeData?.type !== "dish") {
      handleDayDragEnd(event);
      return;
    }

    const activeEntryId = active.id as string;
    const fromDayIndex = activeData.dayIndex;

    // 确定目标位置
    const overData = over.data.current as { type?: string; dayIndex?: number } | undefined;
    let toDayIndex: number;
    let toIndex: number;

    if (over.id === active.id) {
      // 没有移动
      return;
    }

    if (overData?.type === "dish" && overData.dayIndex !== undefined) {
      // over 在另一个菜品上
      toDayIndex = overData.dayIndex;
      const overEntry = weeklyMenu[toDayIndex].entries.find((e: MenuEntry) => e.id === over.id);
      toIndex = weeklyMenu[toDayIndex].entries.indexOf(overEntry!);
    } else if (overData?.type === "day-end-zone" && overData.dayIndex !== undefined) {
      // over 在末尾放置区上 - 添加到末尾
      toDayIndex = overData.dayIndex;
      toIndex = weeklyMenu[toDayIndex].entries.length;
    } else if (overData?.type === "day-container" && overData.dayIndex !== undefined) {
      // over 在空白的天容器上 - 添加到末尾
      toDayIndex = overData.dayIndex;
      toIndex = weeklyMenu[toDayIndex].entries.length;
    } else {
      // 尝试从 id 找
      const dayIndex = findDayIndexByEntryId(over.id as string);
      if (dayIndex !== -1) {
        toDayIndex = dayIndex;
        const entries = weeklyMenu[toDayIndex].entries;
        toIndex = entries.findIndex((e: MenuEntry) => e.id === over.id);
        if (toIndex === -1) {
          toIndex = entries.length;
        }
      } else {
        // 检查是否是 day id
        const dayCardIndex = weeklyMenu.findIndex((d: DayMenu) => d.day === over.id);
        if (dayCardIndex !== -1) {
          toDayIndex = dayCardIndex;
          toIndex = weeklyMenu[toDayIndex].entries.length;
        } else {
          return;
        }
      }
    }

    moveDishEntry(fromDayIndex, toDayIndex, activeEntryId, toIndex);
  };

  // 获取当前拖拽菜品的信息用于 overlay
  const activeDish = activeEntry
    ? dishes.find((d: Dish) => d.name === activeEntry.dishName)
    : undefined;

  return (
    <div className="flex flex-col items-center w-full">
      <DndContext
        id="menu-dnd-context"
        sensors={sensors}
        collisionDetection={pointerWithin}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
        measuring={{
          droppable: {
            strategy: MeasuringStrategy.Always,
          },
        }}
      >
        <SortableContext
          items={weeklyMenu.map((d: DayMenu) => d.day)}
          strategy={verticalListSortingStrategy}
        >
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 w-full px-4 h-full">
            {weeklyMenu.map((dayMenu: DayMenu, index: number) => (
              <SortableContext
                key={dayMenu.day}
                items={entryIdsByDay[index]}
                strategy={verticalListSortingStrategy}
              >
                <DayCard
                  menu={dayMenu}
                  index={index}
                  className="w-full h-full"
                  isDropTarget={overDayIndex === index && findDayIndexByEntryId(activeId as string) !== index}
                />
              </SortableContext>
            ))}
          </div>
        </SortableContext>

        <DragOverlay dropAnimation={{
          duration: 200,
          easing: "cubic-bezier(0.18, 0.67, 0.6, 1.22)",
        }}>
          {activeEntry && (
            <DishCard
              entry={activeEntry}
              dayIndex={-1}
              dish={activeDish}
              tags={tags}
              onUpdateDish={() => { }}
              onRemove={() => { }}
              isDragOverlay
            />
          )}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
