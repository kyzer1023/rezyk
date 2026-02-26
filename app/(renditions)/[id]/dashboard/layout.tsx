import Shell1 from "@/components/renditions/r1/Shell";
import Shell2 from "@/components/renditions/r2/Shell";
import Shell3 from "@/components/renditions/r3/Shell";
import Shell4 from "@/components/renditions/r4/Shell";
import Shell5 from "@/components/renditions/r5/Shell";

const shells: Record<string, React.ComponentType<{ children: React.ReactNode }>> = {
  "1": Shell1, "2": Shell2, "3": Shell3, "4": Shell4, "5": Shell5,
};

export default async function DashLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const Shell = shells[id];
  return Shell ? <Shell>{children}</Shell> : <>{children}</>;
}
