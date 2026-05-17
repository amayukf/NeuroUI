import { DEMO_PROMPTS } from "@/lib/demo-prompts";
import { DashboardClient } from "@/components/DashboardClient";

export const metadata = {
  title: "Dashboard · NeuroUI",
};

export default function DashboardPage() {
  const demos = DEMO_PROMPTS.map(({ label, icon, prompt }) => ({
    label,
    icon,
    prompt,
  }));
  return <DashboardClient demos={demos} />;
}
