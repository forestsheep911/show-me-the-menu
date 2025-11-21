export interface DayMenuItems {
  "大荤"?: string;
  "小荤"?: string;
  "蔬菜"?: string;
  "汤"?: string;
  "主食"?: string;
  "点心"?: string;
  [key: string]: string | undefined;
}

export interface DayMenu {
  day: string;
  theme: string;
  color: string;
  items: DayMenuItems;
}

export type WeeklyMenu = DayMenu[];


