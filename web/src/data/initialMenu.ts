import { MenuEntry, WeeklyMenu } from "@/types/menu";

let entryCounter = 0;
const createEntry = (dishName: string, tags: string[]): MenuEntry => ({
  id: `entry-${entryCounter++}`,
  dishName,
  tags,
});

export const initialWeeklyMenu: WeeklyMenu = [
  {
    day: "周一",
    theme: "😋 开胃周一",
    color: "#FF9A9E", // 柔和粉
    entries: [
      createEntry("糖醋排骨", ["大荤"]),
      createEntry("虾仁炒蛋", ["小荤", "海鲜"]),
      createEntry("清炒小青菜", ["蔬菜", "素菜"]),
      createEntry("菌菇豆腐汤", ["汤"]),
      createEntry("白米饭", ["主食"]),
    ],
  },
  {
    day: "周二",
    theme: "🧠 补脑周二",
    color: "#A18CD1", // 柔和紫
    entries: [
      createEntry("清蒸鲈鱼", ["大荤", "海鲜"]),
      createEntry("肉末茄子", ["小荤"]),
      createEntry("西兰花炒胡萝卜", ["蔬菜", "素菜"]),
      createEntry("番茄鸡蛋汤", ["汤"]),
      createEntry("杂粮饭", ["主食"]),
      createEntry("水果沙拉", ["点心", "素菜"]),
    ],
  },
  {
    day: "周三",
    theme: "💪 能量周三",
    color: "#FBC2EB", // 淡紫粉
    entries: [
      createEntry("土豆炖牛肉", ["大荤"]),
      createEntry("西葫芦炒蛋", ["小荤"]),
      createEntry("耗油生菜", ["蔬菜"]),
      createEntry("紫菜蛋花汤", ["汤", "海鲜"]),
      createEntry("白米饭", ["主食"]),
      createEntry("南瓜饼", ["点心"]),
    ],
  },
  {
    day: "周四",
    theme: "✨ 特色周四",
    color: "#84FAB0", // 清新绿
    entries: [
      createEntry("照烧鸡腿", ["大荤"]),
      createEntry("烂糊肉丝", ["小荤"]),
      createEntry("醋溜绿豆芽", ["蔬菜"]),
      createEntry("萝卜小排汤", ["汤"]),
      createEntry("上海炒饭", ["主食"]),
    ],
  },
  {
    day: "周五",
    theme: "🎉 快乐周五",
    color: "#FFD1FF", // 亮粉
    entries: [
      createEntry("油焖大虾", ["大荤", "海鲜"]),
      createEntry("百叶包肉", ["小荤"]),
      createEntry("荷塘小炒", ["蔬菜"]),
      createEntry("罗宋汤", ["汤"]),
      createEntry("意大利肉酱面", ["主食"]),
      createEntry("自制蛋挞", ["点心"]),
    ],
  },
];

