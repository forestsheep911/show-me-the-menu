import { Ingredient, INGREDIENT_COLORS } from "@/types/menu";

// 初始食材数据（带颜色和类型）
export const initialIngredients: Ingredient[] = [
  // 肉类 - 红/棕色系 (主料)
  { name: "猪肉", bgColor: INGREDIENT_COLORS.red.bg, textColor: INGREDIENT_COLORS.red.text, type: "main" },
  { name: "排骨", bgColor: INGREDIENT_COLORS.red.bg, textColor: INGREDIENT_COLORS.red.text, type: "main" },
  { name: "牛肉", bgColor: INGREDIENT_COLORS.brown.bg, textColor: INGREDIENT_COLORS.brown.text, type: "main" },
  { name: "鸡腿", bgColor: INGREDIENT_COLORS.orange.bg, textColor: INGREDIENT_COLORS.orange.text, type: "main" },
  { name: "鸡翅", bgColor: INGREDIENT_COLORS.orange.bg, textColor: INGREDIENT_COLORS.orange.text, type: "main" },
  { name: "鸭肉", bgColor: INGREDIENT_COLORS.brown.bg, textColor: INGREDIENT_COLORS.brown.text, type: "main" },
  // 海鲜 - 蓝色系 (主料)
  { name: "鱼", bgColor: INGREDIENT_COLORS.blue.bg, textColor: INGREDIENT_COLORS.blue.text, type: "main" },
  { name: "虾", bgColor: INGREDIENT_COLORS.pink.bg, textColor: INGREDIENT_COLORS.pink.text, type: "main" },
  // 蛋豆 - 黄色系 (主料)
  { name: "鸡蛋", bgColor: INGREDIENT_COLORS.yellow.bg, textColor: INGREDIENT_COLORS.yellow.text, type: "main" },
  { name: "豆腐", bgColor: INGREDIENT_COLORS.default.bg, textColor: INGREDIENT_COLORS.default.text, type: "main" },
  // 蔬菜 - 绿色系 (辅料)
  { name: "土豆", bgColor: INGREDIENT_COLORS.yellow.bg, textColor: INGREDIENT_COLORS.yellow.text, type: "sub" },
  { name: "番茄", bgColor: INGREDIENT_COLORS.red.bg, textColor: INGREDIENT_COLORS.red.text, type: "sub" },
  { name: "青菜", bgColor: INGREDIENT_COLORS.green.bg, textColor: INGREDIENT_COLORS.green.text, type: "sub" },
  { name: "白菜", bgColor: INGREDIENT_COLORS.green.bg, textColor: INGREDIENT_COLORS.green.text, type: "sub" },
  { name: "萝卜", bgColor: INGREDIENT_COLORS.default.bg, textColor: INGREDIENT_COLORS.default.text, type: "sub" },
  { name: "西兰花", bgColor: INGREDIENT_COLORS.green.bg, textColor: INGREDIENT_COLORS.green.text, type: "sub" },
  { name: "茄子", bgColor: INGREDIENT_COLORS.purple.bg, textColor: INGREDIENT_COLORS.purple.text, type: "sub" },
  { name: "青椒", bgColor: INGREDIENT_COLORS.green.bg, textColor: INGREDIENT_COLORS.green.text, type: "sub" },
  { name: "洋葱", bgColor: INGREDIENT_COLORS.default.bg, textColor: INGREDIENT_COLORS.default.text, type: "sub" },
  { name: "胡萝卜", bgColor: INGREDIENT_COLORS.orange.bg, textColor: INGREDIENT_COLORS.orange.text, type: "sub" },
  { name: "黄瓜", bgColor: INGREDIENT_COLORS.green.bg, textColor: INGREDIENT_COLORS.green.text, type: "sub" },
  { name: "豆角", bgColor: INGREDIENT_COLORS.green.bg, textColor: INGREDIENT_COLORS.green.text, type: "sub" },
  { name: "菌菇", bgColor: INGREDIENT_COLORS.brown.bg, textColor: INGREDIENT_COLORS.brown.text, type: "sub" },
  { name: "木耳", bgColor: INGREDIENT_COLORS.gray.bg, textColor: INGREDIENT_COLORS.gray.text, type: "sub" },
  // 主食类 (辅料)
  { name: "粉丝", bgColor: INGREDIENT_COLORS.default.bg, textColor: INGREDIENT_COLORS.default.text, type: "sub" },
  { name: "面条", bgColor: INGREDIENT_COLORS.yellow.bg, textColor: INGREDIENT_COLORS.yellow.text, type: "sub" },
  { name: "大米", bgColor: INGREDIENT_COLORS.default.bg, textColor: INGREDIENT_COLORS.default.text, type: "sub" },
];
