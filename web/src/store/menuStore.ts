import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { WeeklyMenu, MenuEntry, Dish, Tag } from "@/types/menu";
import { initialWeeklyMenu } from "@/data/initialMenu";
import { defaultDishes, defaultDishTags } from "@/data/dishes";
import { initialIngredients } from "@/data/ingredients";

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
  ingredients: string[];

  setWeeklyMenu: (menu: WeeklyMenu) => void;
  generateNewMenu: () => void;
  updateEntryDish: (dayIndex: number, entryId: string, dishName: string) => void;
  addMenuEntry: (dayIndex: number, tags?: string[]) => void;
  removeMenuEntry: (dayIndex: number, entryId: string) => void;

  addDish: (dishName: string, tags: string[]) => void;
  removeDish: (dishName: string) => void;
  updateDish: (oldName: string, updates: Partial<Dish>) => void;

  addTag: (name: string, color?: string) => void;
  removeTag: (tagName: string) => void;
  updateTag: (tagName: string, updates: Partial<Tag>) => void;

  addIngredient: (name: string) => void;
  removeIngredient: (name: string) => void;
  updateIngredient: (oldName: string, newName: string) => void;

  getTagColor: (tagName: string) => string;
}

export const useMenuStore = create<MenuState>()(
  persist(
    (set) => ({
      weeklyMenu: initialWeeklyMenu,
      dishes: defaultDishes,
      tags: defaultDishTags,
      ingredients: initialIngredients,

      setWeeklyMenu: (menu) => set({ weeklyMenu: menu }),

      generateNewMenu: () =>
        set((state) => {
          const newMenu: WeeklyMenu = state.weeklyMenu.map((day) => ({
            ...day,
            entries: day.entries.map((entry) => {
              const candidates = filterDishesByTags(state.dishes, entry.tags);
              if (candidates.length === 0) return entry;
              return { ...entry, dishName: getRandomItem(candidates).name };
            }),
          }));

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

      addDish: (dishName, tags) =>
        set((state) => {
          const trimmed = dishName.trim();
          if (!trimmed) return state;
          if (state.dishes.some((dish) => dish.name === trimmed)) return state;
          return {
            dishes: [...state.dishes, { name: trimmed, tags: tags.length ? tags : [] }],
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
                  tags: updates.tags ?? dish.tags,
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
          // 如果要改名，检查新名字是否已存在
          if (trimmedName && state.tags.some((t) => t.name === trimmedName && t.name !== tagName)) {
            return state;
          }

          const updatedTags = state.tags.map((t) =>
            t.name === tagName
              ? { ...t, ...updates, name: trimmedName ?? t.name }
              : t
          );

          // 如果标签名改了，需要更新菜品和菜单中的引用
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
        const state = useMenuStore.getState();
        const tag = state.tags.find((t) => t.name === tagName);
        return tag?.color ?? "#6b7280";
      },

      addIngredient: (name) =>
        set((state) => {
          const trimmedName = name.trim();
          if (!trimmedName || state.ingredients.includes(trimmedName)) return state;
          return { ingredients: [...state.ingredients, trimmedName] };
        }),

      removeIngredient: (name) =>
        set((state) => ({
          ingredients: state.ingredients.filter((i) => i !== name),
        })),

      updateIngredient: (oldName, newName) =>
        set((state) => {
          const trimmedNewName = newName.trim();
          if (!trimmedNewName) return state;
          return {
            ingredients: state.ingredients.map((i) => (i === oldName ? trimmedNewName : i)),
          };
        }),
    }),
    {
      name: "menu-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        dishes: state.dishes,
        weeklyMenu: state.weeklyMenu,
        ingredients: state.ingredients,
        tags: state.tags,
      }),
      // 数据迁移：确保从 localStorage 恢复的旧数据结构兼容
      merge: (persistedState, currentState) => {
        const persisted = persistedState as Partial<MenuState> | undefined;
        if (!persisted) return currentState;

        // 确保 weeklyMenu 中每个 day 都有 entries 数组
        const migratedMenu = Array.isArray(persisted.weeklyMenu)
          ? persisted.weeklyMenu.map((day, index) => ({
              ...initialWeeklyMenu[index],
              ...day,
              entries: Array.isArray(day?.entries) ? day.entries : initialWeeklyMenu[index].entries,
            }))
          : currentState.weeklyMenu;

        // 确保 dishes 是数组格式（旧版本可能是对象格式）
        const migratedDishes = Array.isArray(persisted.dishes) 
          ? persisted.dishes 
          : currentState.dishes;

        // 确保 tags 是数组格式，并迁移旧的字符串格式到新的对象格式
        let migratedTags: Tag[] = currentState.tags;
        if (Array.isArray(persisted.tags)) {
          // 检查是否是旧的 string[] 格式
          if (persisted.tags.length > 0 && typeof persisted.tags[0] === "string") {
            // 迁移旧格式：string[] -> Tag[]
            migratedTags = (persisted.tags as unknown as string[]).map((tagName) => {
              // 尝试从默认标签中获取颜色
              const defaultTag = defaultDishTags.find((t) => t.name === tagName);
              return {
                name: tagName,
                color: defaultTag?.color ?? "#6b7280",
              };
            });
          } else {
            // 新格式，直接使用
            migratedTags = persisted.tags as Tag[];
          }
        }

        // 确保 ingredients 是数组格式
        const migratedIngredients = Array.isArray(persisted.ingredients)
          ? persisted.ingredients
          : currentState.ingredients;

        return {
          ...currentState,
          weeklyMenu: migratedMenu,
          dishes: migratedDishes,
          tags: migratedTags,
          ingredients: migratedIngredients,
        };
      },
    }
  )
);
