export interface Tag {
  name: string;
  color: string;
}

export interface Dish {
  name: string;
  tags: string[];
}

export interface MenuEntry {
  id: string;
  dishName: string;
  tags: string[];
}

export interface DayMenu {
  day: string;
  theme: string;
  color: string;
  entries: MenuEntry[];
}

export type WeeklyMenu = DayMenu[];

