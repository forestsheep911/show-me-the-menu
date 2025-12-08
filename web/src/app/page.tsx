import Link from "next/link";
import { Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { WeekView } from "@/components/WeekView";

export default function Home() {
  return (
    <main className="flex flex-col items-center w-full min-h-screen p-4 bg-gray-50/50 relative">
      <div className="w-full max-w-[1600px] flex justify-end mb-4 px-4">
        <Button variant="outline" asChild className="bg-white/80 backdrop-blur shadow-sm hover:bg-white">
          <Link href="/edit" className="flex items-center gap-2">
            <Settings className="size-4" />
            <span>后台管理</span>
          </Link>
        </Button>
      </div>
      <WeekView />
    </main>
  );
}
