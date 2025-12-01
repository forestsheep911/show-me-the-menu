import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { WeeklyMenu, MenuEntry, Dish, Tag, Ingredient, IngredientColorName } from "@/types/menu";
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
  ingredients: Ingredient[];

  setWeeklyMenu: (menu: WeeklyMenu) => void;
  generateNewMenu: () => void;
  updateEntryDish: (dayIndex: number, entryId: string, dishName: string) => void;
  addMenuEntry: (dayIndex: number, tags?: string[]) => void;
  removeMenuEntry: (dayIndex: number, entryId: string) => void;

  addDish: (dishName: string, tags?: string[], mainIngredients?: string[], subIngredients?: string[], steps?: string) => void;
  removeDish: (dishName: string) => void;
  updateDish: (oldName: string, updates: Partial<Dish>) => void;

  addTag: (name: string, color?: string) => void;
  removeTag: (tagName: string) => void;
  updateTag: (tagName: string, updates: Partial<Tag>) => void;

  addIngredient: (name: string, color?: IngredientColorName) => void;
  removeIngredient: (name: string) => void;
  updateIngredient: (oldName: string, updates: Partial<Ingredient>) => void;
  reorderIngredients: (ingredients: Ingredient[]) => void;

  getTagColor: (tagName: string) => string;
  getIngredientColor: (name: string) => IngredientColorName;
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

      addIngredient: (name, color = "default") =>
        set((state) => {
          const trimmedName = name.trim();
          if (!trimmedName || state.ingredients.some((i) => i.name === trimmedName)) return state;
          return { ingredients: [...state.ingredients, { name: trimmedName, color }] };
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

      getIngredientColor: (name) => {
        // This will be resolved at runtime after store is created
        return "default" as IngredientColorName;
      },
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
                color: defaultIng?.color ?? "default",
              };
            });
          } else {
            migratedIngredients = persistedIngredients as Ingredient[];
          }
        }

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
