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
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const dishes = useMenuStore((state: { dishes: Dish[] }) => state.dishes);
  const availableTags = useMenuStore((state: { tags: Tag[] }) => state.tags);
  const addDish = useMenuStore((state: { addDish: (name: string, tags?: string[], mainIngredients?: string[], subIngredients?: string[], steps?: string) => void }) => state.addDish);

  const normalizedQuery = searchQuery.trim().toLowerCase();
  const filteredDishes = useMemo(() => {
    if (!normalizedQuery) return dishes;
    return dishes.filter((dish: Dish) => matchesSearch(dish.name, normalizedQuery));
  }, [dishes, normalizedQuery]);

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
    setSelectedTags([]);
    setOpen(false);
  };

  const handleAddDish = () => {
    if (!trimmedQuery || hasExactMatch) return;
    // 使用用户选择的标签，如果没有选择则创建空标签菜品
    addDish(trimmedQuery, selectedTags);
    // 创建后不关闭对话框，清空输入让用户可以继续创建
    setSearchQuery("");
    setSelectedTags([]);
  };

  const handleDialogChange = (nextOpen: boolean) => {
    setOpen(nextOpen);
    if (nextOpen) {
      setSearchQuery("");
      setSelectedTags([]);
    }
  };

  const toggleTag = (tagName: string) => {
    setSelectedTags(prev =>
      prev.includes(tagName)
        ? prev.filter(t => t !== tagName)
        : [...prev, tagName]
    );
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
          <DialogTitle>替换菜品</DialogTitle>
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
          </div>
        </div>
        <ScrollArea className="mt-4 h-[420px] w-full rounded-md border p-4">
          <div className="grid grid-cols-3 gap-3">
            {/* 创建新菜品选项 - Notion 风格，带标签选择 */}
            {showCreateOption && (
              <div className="col-span-3 rounded-lg border-2 border-dashed border-[#ff7043]/30 bg-[#ff7043]/5 p-4 space-y-3">
                <button
                  onClick={handleAddDish}
                  className="w-full flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#ff7043]/10 hover:bg-[#ff7043]/20 transition-all"
                >
                  <Plus className="w-4 h-4 text-[#ff7043]" />
                  <span className="text-sm text-gray-600">创建</span>
                  <span className="px-2 py-0.5 text-sm font-medium bg-[#ff7043] text-white rounded">
                    {trimmedQuery}
                  </span>
                  {selectedTags.length > 0 && (
                    <span className="ml-auto text-xs text-gray-400">
                      {selectedTags.join(" / ")}
                    </span>
                  )}
                </button>
                {/* 可选标签 */}
                <div className="flex flex-wrap gap-1.5">
                  <span className="text-xs text-gray-400 mr-1">选择类型（可选）：</span>
                  {availableTags.map((tag: Tag) => {
                    const isSelected = selectedTags.includes(tag.name);
                    return (
                      <button
                        key={tag.name}
                        onClick={() => toggleTag(tag.name)}
                        className={cn(
                          "px-2 py-0.5 text-xs rounded-full border transition-all",
                          isSelected
                            ? "border-transparent text-white"
                            : "border-gray-200 text-gray-500 hover:border-gray-300"
                        )}
                        style={isSelected ? { backgroundColor: tag.color } : undefined}
                      >
                        {tag.name}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

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
                {dish.tags.length > 0 && (
                  <span className="text-xs text-gray-400">
                    {dish.tags.join(" / ")}
                  </span>
                )}
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

