"use client";

import { useRef } from "react";
import { WeekView } from "@/components/WeekView";
import { SideMenu } from "@/components/SideMenu";
import { DotPattern } from "@/components/ui/dot-pattern";
import { cn } from "@/lib/utils";

export default function Home() {
  const weekViewRef = useRef<HTMLDivElement>(null);

  return (
    <main className="flex flex-row items-start w-full min-h-screen bg-gray-50/50 relative">
      {/* 背景圆点图案 */}
      <DotPattern
        width={24}
        height={24}
        cx={1}
        cy={1}
        cr={1.2}
        className={cn(
          "fixed inset-0 z-0",
          "text-cyan-300/60",
          "[mask-image:radial-gradient(ellipse_at_center,white_20%,transparent_80%)]"
        )}
      />

      <SideMenu weekViewRef={weekViewRef} />
      <div className="flex-1 py-6 pl-4 pr-6 overflow-x-auto relative z-10">
        <div ref={weekViewRef}>
          <WeekView />
        </div>
      </div>
    </main>
  );
}
