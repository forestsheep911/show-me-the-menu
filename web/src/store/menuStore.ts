import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { WeeklyMenu, MenuEntry, Dish, Tag, Ingredient, IngredientColorName, INGREDIENT_COLORS } from "@/types/menu";
import { initialWeeklyMenu } from "@/data/initialMenu";
import { defaultDishes, defaultDishTags } from "@/data/dishes";
import { initialIngredients } from "@/data/ingredients";

// 柔和的卡片颜色调色板
export const SOFT_CARD_COLORS = [
  "#FF9A9E", // 柔和粉
  "#A18CD1", // 柔和紫
  "#FBC2EB", // 淡紫粉
  "#84FAB0", // 清新绿
  "#FFD1FF", // 亮粉
  "#FFD89B", // 暖橙
  "#A8E6CF", // 薄荷绿
  "#88D8F5", // 天空蓝
  "#DDD6F3", // 薰衣草
  "#FAACA8", // 珊瑚粉
  "#B5EAD7", // 淡绿
  "#E2B0FF", // 浅紫
  "#FFB7B2", // 蜜桃粉
  "#B2F7EF", // 青蓝
  "#F0E68C", // 柠檬黄
];

// 随机打乱数组并返回前n个不重复的元素
const shuffleAndPick = <T,>(arr: T[], n: number): T[] => {
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, n);
};

const createEntryId = () => {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `entry-${Math.random().toString(36).slice(2, 11)}`;
};

const getRandomItem = <T,>(arr: T[]): T => {
  return arr[Math.floor(Math.random() * arr.length)];
};

const filterDishesByTags = (dishes: Dish[], tags: string[]) => {
  const normalized = tags.filter(Boolean);
  if (normalized.length === 0) return dishes;
  return dishes.filter((dish) => normalized.every((tag) => dish.tags.includes(tag)));
};

interface MenuState {
  weeklyMenu: WeeklyMenu;
  dishes: Dish[];
  tags: Tag[];
  ingredients: Ingredient[];
  backgroundColor: string; // 主页背景色

  setWeeklyMenu: (menu: WeeklyMenu) => void;
  generateNewMenu: () => void;
  updateEntryDish: (dayIndex: number, entryId: string, dishName: string) => void;
  addMenuEntry: (dayIndex: number, tags?: string[]) => void;
  removeMenuEntry: (dayIndex: number, entryId: string) => void;
  updateDayColor: (dayIndex: number, color: string) => void; // 更新单天卡片颜色
  toggleDayLock: (dayIndex: number) => void; // 切换锁定状态
  setBackgroundColor: (color: string) => void; // 设置背景色

  addDish: (dishName: string, tags?: string[], mainIngredients?: string[], subIngredients?: string[], steps?: string) => void;
  removeDish: (dishName: string) => void;
  updateDish: (oldName: string, updates: Partial<Dish>) => void;

  addTag: (name: string, color?: string) => void;
  removeTag: (tagName: string) => void;
  updateTag: (tagName: string, updates: Partial<Tag>) => void;

  addIngredient: (name: string, bgColor?: string, textColor?: string, type?: 'main' | 'sub') => void;
  removeIngredient: (name: string) => void;
  updateIngredient: (oldName: string, updates: Partial<Ingredient>) => void;
  reorderIngredients: (ingredients: Ingredient[]) => void;

  getTagColor: (tagName: string) => string;
}

export const useMenuStore = create<MenuState>()(
  persist(
    (set) => ({
      weeklyMenu: initialWeeklyMenu,
      dishes: defaultDishes,
      tags: defaultDishTags,
      ingredients: initialIngredients,
      backgroundColor: "#b2ebf2", // 默认背景色（青绿色点点）

      setWeeklyMenu: (menu) => set({ weeklyMenu: menu }),

      generateNewMenu: () =>
        set((state) => {
          // 随机选择5个不重复的颜色分配给每天
          // 只为未锁定的天生成新颜色（或者全部重新生成颜色？通常锁定也意味着锁定颜色，保持一致性比较好）
          // 这里我们假设锁定意味着"完全不变"，包括颜色。
          // 所以我们需要先找出哪些天没被锁定，然后为它们挑选颜色。
          // 但为了简单和美观，如果重新洗牌颜色可能更好，除非用户明确想保留颜色。
          // 既然是"这一天的菜单我都满意"，通常包含颜色风格。我们保留颜色。

          const unlockedCount = state.weeklyMenu.filter(d => !d.locked).length;
          const randomColors = shuffleAndPick(SOFT_CARD_COLORS, unlockedCount);
          let colorIndex = 0;

          const newMenu: WeeklyMenu = state.weeklyMenu.map((day) => {
            if (day.locked) {
              return day;
            }

            const newColor = randomColors[colorIndex++] ?? day.color;

            return {
              ...day,
              color: newColor,
              entries: day.entries.map((entry) => {
                const candidates = filterDishesByTags(state.dishes, entry.tags);
                if (candidates.length === 0) return entry;
                return { ...entry, dishName: getRandomItem(candidates).name };
              }),
            };
          });

          return { weeklyMenu: newMenu };
        }),

      updateEntryDish: (dayIndex, entryId, dishName) =>
        set((state) => {
          const newMenu = [...state.weeklyMenu];
          newMenu[dayIndex] = {
            ...newMenu[dayIndex],
            entries: newMenu[dayIndex].entries.map((entry) =>
              entry.id === entryId ? { ...entry, dishName } : entry
            ),
          };
          return { weeklyMenu: newMenu };
        }),

      addMenuEntry: (dayIndex, tags = []) =>
        set((state) => {
          const newEntry: MenuEntry = {
            id: createEntryId(),
            dishName: "",
            tags,
          };
          const newMenu = [...state.weeklyMenu];
          newMenu[dayIndex] = {
            ...newMenu[dayIndex],
            entries: [...newMenu[dayIndex].entries, newEntry],
          };
          return { weeklyMenu: newMenu };
        }),

      removeMenuEntry: (dayIndex, entryId) =>
        set((state) => {
          const newMenu = [...state.weeklyMenu];
          newMenu[dayIndex] = {
            ...newMenu[dayIndex],
            entries: newMenu[dayIndex].entries.filter((entry) => entry.id !== entryId),
          };
          return { weeklyMenu: newMenu };
        }),

      updateDayColor: (dayIndex, color) =>
        set((state) => {
          const newMenu = [...state.weeklyMenu];
          newMenu[dayIndex] = {
            ...newMenu[dayIndex],
            color,
          };
          return { weeklyMenu: newMenu };
        }),

      toggleDayLock: (dayIndex) =>
        set((state) => {
          const newMenu = [...state.weeklyMenu];
          newMenu[dayIndex] = {
            ...newMenu[dayIndex],
            locked: !newMenu[dayIndex].locked,
          };
          return { weeklyMenu: newMenu };
        }),

      setBackgroundColor: (color) => set({ backgroundColor: color }),

      addDish: (dishName, tags = [], mainIngredients = [], subIngredients = [], steps = "") =>
        set((state) => {
          const trimmed = dishName.trim();
          if (!trimmed) return state;
          if (state.dishes.some((dish) => dish.name === trimmed)) return state;
          return {
            dishes: [...state.dishes, {
              name: trimmed,
              tags,
              mainIngredients,
              subIngredients,
              steps,
            }],
          };
        }),

      removeDish: (dishName) =>
        set((state) => {
          const filteredDishes = state.dishes.filter((dish) => dish.name !== dishName);
          const updatedMenu = state.weeklyMenu.map((day) => ({
            ...day,
            entries: day.entries.map((entry) =>
              entry.dishName === dishName ? { ...entry, dishName: "" } : entry
            ),
          }));
          return { dishes: filteredDishes, weeklyMenu: updatedMenu };
        }),

      updateDish: (oldName, updates) =>
        set((state) => {
          const trimmedName = updates.name?.trim();
          if (trimmedName && state.dishes.some((dish) => dish.name === trimmedName && dish.name !== oldName)) {
            return state;
          }

          const updatedDishes = state.dishes.map((dish) =>
            dish.name === oldName
              ? {
                ...dish,
                ...updates,
                name: trimmedName ?? dish.name,
              }
              : dish
          );

          const updatedMenu = trimmedName
            ? state.weeklyMenu.map((day) => ({
              ...day,
              entries: day.entries.map((entry) =>
                entry.dishName === oldName ? { ...entry, dishName: trimmedName } : entry
              ),
            }))
            : state.weeklyMenu;

          return {
            dishes: updatedDishes,
            weeklyMenu: updatedMenu,
          };
        }),

      addTag: (name, color = "#6b7280") =>
        set((state) => {
          const trimmed = name.trim();
          if (!trimmed || state.tags.some((t) => t.name === trimmed)) return state;
          return { tags: [...state.tags, { name: trimmed, color }] };
        }),

      removeTag: (tagName) =>
        set((state) => {
          const updatedTags = state.tags.filter((t) => t.name !== tagName);
          const cleanedDishes = state.dishes.map((dish) => ({
            ...dish,
            tags: dish.tags.filter((t) => t !== tagName),
          }));
          const cleanedMenu = state.weeklyMenu.map((day) => ({
            ...day,
            entries: day.entries.map((entry) => ({
              ...entry,
              tags: entry.tags.filter((t) => t !== tagName),
            })),
          }));
          return { tags: updatedTags, dishes: cleanedDishes, weeklyMenu: cleanedMenu };
        }),

      updateTag: (tagName, updates) =>
        set((state) => {
          const trimmedName = updates.name?.trim();
          if (trimmedName && state.tags.some((t) => t.name === trimmedName && t.name !== tagName)) {
            return state;
          }

          const updatedTags = state.tags.map((t) =>
            t.name === tagName
              ? { ...t, ...updates, name: trimmedName ?? t.name }
              : t
          );

          let updatedDishes = state.dishes;
          let updatedMenu = state.weeklyMenu;

          if (trimmedName && trimmedName !== tagName) {
            updatedDishes = state.dishes.map((dish) => ({
              ...dish,
              tags: dish.tags.map((t) => (t === tagName ? trimmedName : t)),
            }));
            updatedMenu = state.weeklyMenu.map((day) => ({
              ...day,
              entries: day.entries.map((entry) => ({
                ...entry,
                tags: entry.tags.map((t) => (t === tagName ? trimmedName : t)),
              })),
            }));
          }

          return { tags: updatedTags, dishes: updatedDishes, weeklyMenu: updatedMenu };
        }),

      getTagColor: (tagName) => {
        // This will be resolved at runtime after store is created
        return "#6b7280";
      },

      addIngredient: (name, bgColor = INGREDIENT_COLORS.default.bg, textColor = INGREDIENT_COLORS.default.text, type = "main") =>
        set((state) => {
          const trimmedName = name.trim();
          if (!trimmedName || state.ingredients.some((i) => i.name === trimmedName)) return state;
          return { ingredients: [...state.ingredients, { name: trimmedName, bgColor, textColor, type }] };
        }),

      removeIngredient: (name) =>
        set((state) => {
          const updatedIngredients = state.ingredients.filter((i) => i.name !== name);
          // 同时从所有菜品中移除该食材
          const updatedDishes = state.dishes.map((dish) => ({
            ...dish,
            mainIngredients: dish.mainIngredients.filter((i) => i !== name),
            subIngredients: dish.subIngredients.filter((i) => i !== name),
          }));
          return { ingredients: updatedIngredients, dishes: updatedDishes };
        }),

      updateIngredient: (oldName, updates) =>
        set((state) => {
          const trimmedName = updates.name?.trim();
          if (trimmedName && state.ingredients.some((i) => i.name === trimmedName && i.name !== oldName)) {
            return state;
          }

          const updatedIngredients = state.ingredients.map((i) =>
            i.name === oldName
              ? { ...i, ...updates, name: trimmedName ?? i.name }
              : i
          );

          // 如果食材名改了，更新所有菜品中的引用
          let updatedDishes = state.dishes;
          if (trimmedName && trimmedName !== oldName) {
            updatedDishes = state.dishes.map((dish) => ({
              ...dish,
              mainIngredients: dish.mainIngredients.map((i) => (i === oldName ? trimmedName : i)),
              subIngredients: dish.subIngredients.map((i) => (i === oldName ? trimmedName : i)),
            }));
          }

          return { ingredients: updatedIngredients, dishes: updatedDishes };
        }),

      reorderIngredients: (ingredients) =>
        set({ ingredients }),
    }),
    {
      name: "menu-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        dishes: state.dishes,
        weeklyMenu: state.weeklyMenu,
        ingredients: state.ingredients,
        tags: state.tags,
        backgroundColor: state.backgroundColor,
      }),
      // 数据迁移：确保从 localStorage 恢复的旧数据结构兼容
      merge: (persistedState, currentState) => {
        const persisted = persistedState as Record<string, unknown> | undefined;
        if (!persisted) return currentState;

        // 确保 weeklyMenu 中每个 day 都有 entries 数组
        const persistedMenu = persisted.weeklyMenu as WeeklyMenu | undefined;
        const migratedMenu = Array.isArray(persistedMenu)
          ? persistedMenu.map((day, index) => ({
            ...initialWeeklyMenu[index],
            ...day,
            entries: Array.isArray(day?.entries) ? day.entries : initialWeeklyMenu[index].entries,
          }))
          : currentState.weeklyMenu;

        // 确保 dishes 是数组格式，并迁移旧数据
        const persistedDishes = persisted.dishes as Array<Record<string, unknown>> | undefined;
        const migratedDishes: Dish[] = Array.isArray(persistedDishes)
          ? persistedDishes.map((dish) => ({
            name: dish.name as string,
            tags: (dish.tags as string[]) ?? [],
            // 旧版本的 ingredients 字段迁移到 mainIngredients
            mainIngredients: (dish.mainIngredients as string[]) ?? (dish.ingredients as string[]) ?? [],
            subIngredients: (dish.subIngredients as string[]) ?? [],
            steps: (dish.steps as string) ?? "",
          }))
          : currentState.dishes;

        // 确保 tags 是数组格式，并迁移旧的字符串格式到新的对象格式
        let migratedTags: Tag[] = currentState.tags;
        const persistedTags = persisted.tags as Tag[] | string[] | undefined;
        if (Array.isArray(persistedTags)) {
          if (persistedTags.length > 0 && typeof persistedTags[0] === "string") {
            migratedTags = (persistedTags as string[]).map((tagName) => {
              const defaultTag = defaultDishTags.find((t) => t.name === tagName);
              return {
                name: tagName,
                color: defaultTag?.color ?? "#6b7280",
              };
            });
          } else {
            migratedTags = persistedTags as Tag[];
          }
        }

        // 确保 ingredients 是 Ingredient[] 格式
        let migratedIngredients: Ingredient[] = currentState.ingredients;
        const persistedIngredients = persisted.ingredients as Ingredient[] | string[] | undefined;
        if (Array.isArray(persistedIngredients)) {
          if (persistedIngredients.length > 0 && typeof persistedIngredients[0] === "string") {
            // 旧格式：string[] -> Ingredient[]
            migratedIngredients = (persistedIngredients as string[]).map((name) => {
              const defaultIng = initialIngredients.find((i) => i.name === name);
              return {
                name,
                bgColor: defaultIng?.bgColor ?? INGREDIENT_COLORS.default.bg,
                textColor: defaultIng?.textColor ?? INGREDIENT_COLORS.default.text,
                type: defaultIng?.type ?? "main",
              };
            });
          } else {
            // 确保所有食材都有新字段（旧数据可能没有）
            migratedIngredients = (persistedIngredients as (Ingredient & { color?: string })[]).map((ing) => {
              // Handle old 'color' field migration to bgColor/textColor
              if (!ing.bgColor && ing.color) {
                const colorData = INGREDIENT_COLORS[ing.color as IngredientColorName] || INGREDIENT_COLORS.default;
                return {
                  name: ing.name,
                  bgColor: colorData.bg,
                  textColor: colorData.text,
                  type: ing.type ?? "main",
                };
              }
              // Ensure type field exists
              if (!ing.type) {
                const defaultIng = initialIngredients.find((i) => i.name === ing.name);
                return { ...ing, type: defaultIng?.type ?? "main" };
              }
              return ing;
            });
          }
        }

        // 迁移 backgroundColor
        const migratedBackgroundColor =
          typeof persisted.backgroundColor === "string"
            ? persisted.backgroundColor
            : currentState.backgroundColor;

        return {
          ...currentState,
          weeklyMenu: migratedMenu,
          dishes: migratedDishes,
          tags: migratedTags,
          ingredients: migratedIngredients,
          backgroundColor: migratedBackgroundColor,
        };
      },
    }
  )
);
