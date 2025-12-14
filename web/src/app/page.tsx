import { WeekView } from "@/components/WeekView";
import { SideMenu } from "@/components/SideMenu";

export default function Home() {
  return (
    <main className="flex flex-row items-start w-full min-h-screen bg-gray-50/50 relative">
      <SideMenu />
      <div className="flex-1 w-full p-6">
        <WeekView />
      </div>
    </main>
  );
}

