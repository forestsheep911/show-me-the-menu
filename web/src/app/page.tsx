import { WeekView } from "@/components/WeekView";
import { SideMenu } from "@/components/SideMenu";

export default function Home() {
  return (
    <main className="flex flex-col items-center w-full min-h-screen p-4 bg-gray-50/50 relative">
      <WeekView />
      <SideMenu />
    </main>
  );
}
