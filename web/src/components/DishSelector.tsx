import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useMenuStore } from "@/store/menuStore";
import { cn } from "@/lib/utils";
import { RefreshCw } from "lucide-react";
import { useState } from "react";

interface DishSelectorProps {
  category: string;
  currentDish: string;
  onSelect: (dish: string) => void;
  trigger?: React.ReactNode;
}

export function DishSelector({ category, currentDish, onSelect, trigger }: DishSelectorProps) {
  const [open, setOpen] = useState(false);
  const storeDishes = useMenuStore((state) => state.dishes);
  const dishes = storeDishes[category] || [];

  const handleSelect = (dish: string) => {
    onSelect(dish);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <button className="text-3xl text-gray-900 font-bold hover:text-[#ff7043] hover:underline cursor-pointer transition-colors text-left w-full py-1 leading-tight">
            {currentDish}
          </button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            替换 {category}
            <span className="text-sm font-normal text-gray-500">({dishes.length} 种选择)</span>
          </DialogTitle>
        </DialogHeader>
        <ScrollArea className="h-[300px] w-full rounded-md border p-4">
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant={currentDish === "无" ? "secondary" : "ghost"}
              className={cn(
                "justify-start h-auto py-3 px-4",
                currentDish === "无" && "bg-[#ffcc80]/20 text-[#ff7043] hover:bg-[#ffcc80]/30"
              )}
              onClick={() => handleSelect("无")}
            >
              无
            </Button>
            {dishes.map((dish) => (
              <Button
                key={dish}
                variant={currentDish === dish ? "secondary" : "ghost"}
                className={cn(
                  "justify-start h-auto py-3 px-4",
                  currentDish === dish && "bg-[#ffcc80]/20 text-[#ff7043] hover:bg-[#ffcc80]/30"
                )}
                onClick={() => handleSelect(dish)}
              >
                {dish}
              </Button>
            ))}
          </div>
        </ScrollArea>
        <div className="flex justify-end pt-4 border-t">
            <Button variant="outline" size="sm" onClick={() => {
                if (dishes.length > 0) {
                  const random = dishes[Math.floor(Math.random() * dishes.length)];
                  handleSelect(random);
                }
            }}>
                <RefreshCw className="w-4 h-4 mr-2" />
                随机换一个
            </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
