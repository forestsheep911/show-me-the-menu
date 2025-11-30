import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { WeeklyMenu, MenuEntry, Dish } from "@/types/menu";
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
  tags: string[];
  ingredients: string[];

  setWeeklyMenu: (menu: WeeklyMenu) => void;
  generateNewMenu: () => void;
  updateEntryDish: (dayIndex: number, entryId: string, dishName: string) => void;
  addMenuEntry: (dayIndex: number, tags?: string[]) => void;
  removeMenuEntry: (dayIndex: number, entryId: string) => void;

  addDish: (dishName: string, tags: string[]) => void;
  removeDish: (dishName: string) => void;
  updateDish: (oldName: string, updates: Partial<Dish>) => void;

  addTag: (tag: string) => void;
  removeTag: (tag: string) => void;

  addIngredient: (name: string) => void;
  removeIngredient: (name: string) => void;
  updateIngredient: (oldName: string, newName: string) => void;
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

      addTag: (tag) =>
        set((state) => {
          const trimmed = tag.trim();
          if (!trimmed || state.tags.includes(trimmed)) return state;
          return { tags: [...state.tags, trimmed] };
        }),

      removeTag: (tag) =>
        set((state) => {
          const updatedTags = state.tags.filter((t) => t !== tag);
          const cleanedDishes = state.dishes.map((dish) => ({
            ...dish,
            tags: dish.tags.filter((t) => t !== tag),
          }));
          const cleanedMenu = state.weeklyMenu.map((day) => ({
            ...day,
            entries: day.entries.map((entry) => ({
              ...entry,
              tags: entry.tags.filter((t) => t !== tag),
            })),
          }));
          return { tags: updatedTags, dishes: cleanedDishes, weeklyMenu: cleanedMenu };
        }),

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
    }
  )
);
