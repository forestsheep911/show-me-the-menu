import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useMenuStore } from "@/store/menuStore";
import { cn } from "@/lib/utils";
import { matchesSearch } from "@/lib/search";
import { Plus, RefreshCw } from "lucide-react";
import { useMemo, useState } from "react";
import { Dish, Tag } from "@/types/menu";

interface DishSelectorProps {
  entryTags: string[];
  currentDish: string;
  onSelect: (dish: string) => void;
  trigger?: React.ReactNode;
}

export function DishSelector({ entryTags, currentDish, onSelect, trigger }: DishSelectorProps) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTags, setActiveTags] = useState<string[]>(entryTags);
  const dishes = useMenuStore((state: { dishes: Dish[] }) => state.dishes);
  const availableTags = useMenuStore((state: { tags: Tag[] }) => state.tags);
  const addDish = useMenuStore((state: { addDish: (name: string, tags?: string[], mainIngredients?: string[], subIngredients?: string[], steps?: string) => void }) => state.addDish);

  const normalizedQuery = searchQuery.trim().toLowerCase();
  const filteredDishes = useMemo(() => {
    const byTag =
      activeTags.length === 0
        ? dishes
        : dishes.filter((dish: Dish) => activeTags.every((tag: string) => dish.tags.includes(tag)));

    if (!normalizedQuery) return byTag;
    return byTag.filter((dish: Dish) => matchesSearch(dish.name, normalizedQuery));
  }, [dishes, activeTags, normalizedQuery]);

  // 检查是否有精确匹配（菜品名称完全相同）
  const trimmedQuery = searchQuery.trim();
  const hasExactMatch = useMemo(() => {
    if (!trimmedQuery) return true; // 空输入不显示创建
    return dishes.some((dish: Dish) => dish.name === trimmedQuery);
  }, [dishes, trimmedQuery]);

  // 是否显示创建选项
  const showCreateOption = trimmedQuery && !hasExactMatch;

  const handleSelect = (dish: string) => {
    onSelect(dish);
    setSearchQuery("");
    setOpen(false);
  };

  const handleAddDish = () => {
    if (!trimmedQuery || hasExactMatch) return;
    addDish(trimmedQuery, activeTags.length ? activeTags : entryTags);
    handleSelect(trimmedQuery);
  };

  const handleDialogChange = (nextOpen: boolean) => {
    setOpen(nextOpen);
    if (nextOpen) {
      setActiveTags(entryTags);
      setSearchQuery("");
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleDialogChange}>
      <DialogTrigger asChild>
        {trigger || (
          <button className="text-2xl font-semibold text-gray-900 hover:text-[#ff7043] hover:underline cursor-pointer transition-colors text-left w-full py-1 leading-tight">
            {currentDish || "点击选择菜品"}
          </button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[820px]">
        <DialogHeader>
          <DialogTitle className="flex flex-col gap-2 text-left">
            <div className="flex items-center gap-2">
              替换菜品
              <span className="text-sm font-normal text-gray-500">{filteredDishes.length} 个结果</span>
            </div>
            <p className="text-xs text-gray-400">
              默认筛选标签（由后台设定）：{entryTags.length ? entryTags.join(" / ") : "未设置"}
            </p>
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <input
              type="text"
              placeholder="搜索菜品或输入新菜品名称..."
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && showCreateOption) {
                  event.preventDefault();
                  handleAddDish();
                }
              }}
              className="w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm focus:border-[#ff7043] focus:outline-none focus:ring-2 focus:ring-[#ffcc80]/50"
            />
            <div className="flex flex-wrap gap-2">
              {availableTags.map((tag: Tag) => {
                const tagName = tag.name;
                const tagColor = tag.color;
                const isActive = activeTags.includes(tagName);
                return (
                  <button
                    key={tagName}
                    onClick={() => {
                      const updated = isActive
                        ? activeTags.filter((t: string) => t !== tagName)
                        : [...activeTags, tagName];
                      setActiveTags(updated);
                    }}
                    className={cn(
                      "px-3 py-1 text-xs rounded-full border transition-colors",
                      isActive
                        ? "border-transparent text-white"
                        : "border-gray-200 text-gray-500 hover:border-gray-300"
                    )}
                    style={isActive ? { backgroundColor: tagColor } : undefined}
                  >
                    {tagName}
                  </button>
                );
              })}
              {availableTags.length === 0 && <span className="text-xs text-gray-400">暂无标签</span>}
            </div>
          </div>
        </div>
        <ScrollArea className="mt-4 h-[420px] w-full rounded-md border p-4">
          <div className="grid grid-cols-3 gap-3">
            {/* 创建新菜品选项 - Notion 风格 */}
            {showCreateOption && (
              <button
                onClick={handleAddDish}
                className="col-span-3 flex items-center gap-2 px-4 py-3 rounded-lg border-2 border-dashed border-[#ff7043]/30 bg-[#ff7043]/5 hover:bg-[#ff7043]/10 hover:border-[#ff7043]/50 transition-all group"
              >
                <Plus className="w-4 h-4 text-[#ff7043]" />
                <span className="text-sm text-gray-600">创建</span>
                <span className="px-2 py-0.5 text-sm font-medium bg-[#ff7043] text-white rounded">
                  {trimmedQuery}
                </span>
              </button>
            )}
            <Button
              variant={currentDish === "" ? "secondary" : "ghost"}
              className={cn(
                "justify-start h-auto py-3 px-4",
                currentDish === "" && "bg-[#ffcc80]/20 text-[#ff7043] hover:bg-[#ffcc80]/30"
              )}
              onClick={() => handleSelect("")}
            >
              清空菜品
            </Button>
            {filteredDishes.map((dish: Dish) => (
              <Button
                key={dish.name}
                variant={currentDish === dish.name ? "secondary" : "ghost"}
                className={cn(
                  "justify-start h-auto py-3 px-4 flex flex-col items-start gap-1",
                  currentDish === dish.name && "bg-[#ffcc80]/20 text-[#ff7043] hover:bg-[#ffcc80]/30"
                )}
                onClick={() => handleSelect(dish.name)}
              >
                <span>{dish.name}</span>
                <span className="text-xs text-gray-400">
                  {dish.tags.length ? dish.tags.join(" / ") : "无标签"}
                </span>
              </Button>
            ))}
          </div>
        </ScrollArea>
        <div className="flex justify-end pt-4 border-t">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              if (filteredDishes.length > 0) {
                const random = filteredDishes[Math.floor(Math.random() * filteredDishes.length)];
                handleSelect(random.name);
              }
            }}
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            随机换一个
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
