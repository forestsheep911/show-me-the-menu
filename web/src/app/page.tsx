import { Header } from "@/components/Header";
import { WeekView } from "@/components/WeekView";

export default function Home() {
  return (
    <main className="flex flex-col items-center w-full pb-20">
      <Header />
      <WeekView />
    </main>
  );
}
