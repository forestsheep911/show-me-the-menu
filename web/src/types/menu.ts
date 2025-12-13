export interface Tag {
  name: string;
  color: string;
}

export interface Ingredient {
  name: string;
  bgColor: string;    // Hex color for background, e.g. "#FADEC9"
  textColor: string;  // Hex color for text, e.g. "#D9730D"
  type: 'main' | 'sub';  // 主料 or 辅料
}

export interface Dish {
  name: string;
  tags: string[];
  mainIngredients: string[];  // 主料
  subIngredients: string[];   // 辅料
  steps: string;              // 做法步骤
}

// Notion 10 色
export const INGREDIENT_COLORS = {
  default: { bg: '#E3E2E080', text: '#37352F' },
  gray: { bg: '#E3E2E0', text: '#787774' },
  brown: { bg: '#EEE0DA', text: '#64473A' },
  orange: { bg: '#FADEC9', text: '#D9730D' },
  yellow: { bg: '#FDECC8', text: '#CB912F' },
  green: { bg: '#DBEDDB', text: '#448361' },
  blue: { bg: '#D3E5EF', text: '#2E7AB8' },
  purple: { bg: '#E8DEEE', text: '#9065B0' },
  pink: { bg: '#F5E0E9', text: '#C14C8A' },
  red: { bg: '#FFE2DD', text: '#E03E3E' },
} as const;

export type IngredientColorName = keyof typeof INGREDIENT_COLORS;

export interface MenuEntry {
  id: string;
  dishName: string;
  tags: string[];
}

export interface DayMenu {
  day: string;
  theme: string;
  color: string;
  locked?: boolean;
  entries: MenuEntry[];
}

export type WeeklyMenu = DayMenu[];

