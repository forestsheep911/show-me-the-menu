import { create } from 'zustand';
import { WeeklyMenu, DayMenu, DayMenuItems } from '@/types/menu';
import { initialWeeklyMenu } from '@/data/initialMenu';
import { dishPool } from '@/data/dishes';

interface MenuState {
  weeklyMenu: WeeklyMenu;
  setWeeklyMenu: (menu: WeeklyMenu) => void;
  generateNewMenu: () => void;
  updateDayItem: (dayIndex: number, category: string, newItem: string) => void;
  moveItem: (fromDayIndex: number, toDayIndex: number, category: string) => void;
}

// 辅助函数：从数组中随机获取一个元素
const getRandomItem = (arr: string[]) => arr[Math.floor(Math.random() * arr.length)];

export const useMenuStore = create<MenuState>((set) => ({
  weeklyMenu: initialWeeklyMenu,
  
  setWeeklyMenu: (menu) => set({ weeklyMenu: menu }),
  
  generateNewMenu: () => set((state) => {
    // 深拷贝当前菜单结构，保留主题和颜色，只替换菜品
    const newMenu = state.weeklyMenu.map(day => {
      const newItems: DayMenuItems = { ...day.items };
      
      // 遍历每个类别进行随机替换
      Object.keys(newItems).forEach(category => {
        const pool = dishPool[category as keyof typeof dishPool];
        if (pool && pool.length > 0) {
          // 简单的随机算法，后期可以加入去重和权重逻辑
          newItems[category] = getRandomItem(pool);
        }
      });
      
      // 有些日子可能没有点心，这里为了演示简单处理，保留原逻辑：有的天有点心，有的没有
      // 或者我们可以随机决定是否有点心
      if (Math.random() > 0.3) {
         newItems["点心"] = getRandomItem(dishPool["点心"]);
      } else {
         newItems["点心"] = "";
      }

      return { ...day, items: newItems };
    });

    return { weeklyMenu: newMenu };
  }),

  updateDayItem: (dayIndex, category, newItem) => set((state) => {
    const newMenu = [...state.weeklyMenu];
    newMenu[dayIndex] = {
      ...newMenu[dayIndex],
      items: {
        ...newMenu[dayIndex].items,
        [category]: newItem
      }
    };
    return { weeklyMenu: newMenu };
  }),

  moveItem: (fromDayIndex, toDayIndex, category) => set((state) => {
    const newMenu = [...state.weeklyMenu];
    const fromItem = newMenu[fromDayIndex].items[category];
    const toItem = newMenu[toDayIndex].items[category];

    // 交换两个日期的同类菜品
    newMenu[fromDayIndex].items[category] = toItem;
    newMenu[toDayIndex].items[category] = fromItem;

    return { weeklyMenu: newMenu };
  })
}));

