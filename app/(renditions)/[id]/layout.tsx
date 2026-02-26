import { notFound } from "next/navigation";
import { VALID_IDS } from "@/lib/renditions";

export default async function RenditionLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  if (!VALID_IDS.includes(id as typeof VALID_IDS[number])) notFound();
  return <>{children}</>;
}
