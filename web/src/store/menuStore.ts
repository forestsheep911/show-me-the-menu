import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { WeeklyMenu, DayMenu, DayMenuItems } from '@/types/menu';
import { initialWeeklyMenu } from '@/data/initialMenu';
import { dishPool as defaultDishPool } from '@/data/dishes';
import { initialIngredients } from '@/data/ingredients';

interface DishPool {
  [category: string]: string[];
}

interface MenuState {
  weeklyMenu: WeeklyMenu;
  dishes: DishPool;
  ingredients: string[];
  
  setWeeklyMenu: (menu: WeeklyMenu) => void;
  generateNewMenu: () => void;
  updateDayItem: (dayIndex: number, category: string, newItem: string) => void;
  moveItem: (fromDayIndex: number, toDayIndex: number, category: string) => void;
  
  // Dish management
  addDish: (category: string, dishName: string) => void;
  removeDish: (category: string, dishName: string) => void;
  updateDish: (category: string, oldName: string, newName: string) => void;

  // Ingredient management
  addIngredient: (name: string) => void;
  removeIngredient: (name: string) => void;
  updateIngredient: (oldName: string, newName: string) => void;
}

// 辅助函数：从数组中随机获取一个元素
const getRandomItem = (arr: string[]) => {
  if (!arr || arr.length === 0) return "";
  return arr[Math.floor(Math.random() * arr.length)];
};

export const useMenuStore = create<MenuState>()(
  persist(
    (set, get) => ({
      weeklyMenu: initialWeeklyMenu,
      dishes: defaultDishPool,
      ingredients: initialIngredients,
      
      setWeeklyMenu: (menu) => set({ weeklyMenu: menu }),
      
      generateNewMenu: () => set((state) => {
        // 使用当前 store 中的 dishes，而不是导入的静态数据
        const currentDishes = state.dishes;
        
        // 深拷贝当前菜单结构，保留主题和颜色，只替换菜品
        const newMenu = state.weeklyMenu.map(day => {
          const newItems: DayMenuItems = { ...day.items };
          
          // 遍历每个类别进行随机替换
          Object.keys(newItems).forEach(category => {
            const pool = currentDishes[category];
            if (pool && pool.length > 0) {
              // 简单的随机算法
              newItems[category] = getRandomItem(pool);
            }
          });
          
          // 点心特殊处理
          if (currentDishes["点心"] && currentDishes["点心"].length > 0) {
             if (Math.random() > 0.3) {
                newItems["点心"] = getRandomItem(currentDishes["点心"]);
             } else {
                newItems["点心"] = "";
             }
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
      }),

      // Dish management implementation
      addDish: (category, dishName) => set((state) => {
        if (!dishName.trim()) return state;
        const currentCategoryDishes = state.dishes[category] || [];
        if (currentCategoryDishes.includes(dishName)) return state;

        return {
          dishes: {
            ...state.dishes,
            [category]: [...currentCategoryDishes, dishName]
          }
        };
      }),

      removeDish: (category, dishName) => set((state) => {
        const currentCategoryDishes = state.dishes[category] || [];
        return {
          dishes: {
            ...state.dishes,
            [category]: currentCategoryDishes.filter(d => d !== dishName)
          }
        };
      }),

      updateDish: (category, oldName, newName) => set((state) => {
        if (!newName.trim()) return state;
        const currentCategoryDishes = state.dishes[category] || [];
        return {
          dishes: {
            ...state.dishes,
            [category]: currentCategoryDishes.map(d => d === oldName ? newName : d)
          }
        };
      }),

      // Ingredient management implementation
      addIngredient: (name) => set((state) => {
        const trimmedName = name.trim();
        if (!trimmedName || state.ingredients.includes(trimmedName)) return state;
        return { ingredients: [...state.ingredients, trimmedName] };
      }),

      removeIngredient: (name) => set((state) => ({
        ingredients: state.ingredients.filter(i => i !== name)
      })),

      updateIngredient: (oldName, newName) => set((state) => {
        const trimmedNewName = newName.trim();
        if (!trimmedNewName) return state;
        return {
          ingredients: state.ingredients.map(i => i === oldName ? trimmedNewName : i)
        };
      }),
    }),
    {
      name: 'menu-storage', // name of the item in the storage (must be unique)
      storage: createJSONStorage(() => localStorage), // (optional) by default, 'localStorage' is used
      partialize: (state) => ({ dishes: state.dishes, weeklyMenu: state.weeklyMenu, ingredients: state.ingredients }), // Persist both dishes, current menu, and ingredients
    }
  )
);
