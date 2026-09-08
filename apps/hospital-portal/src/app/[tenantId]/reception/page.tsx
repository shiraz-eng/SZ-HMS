import { notFound } from "next/navigation";
import { getTenantBySlug } from "@/lib/tenant";
import { getReceptionBoard } from "@/lib/reception";
import { MasterCalendar } from "@/components/reception/master-calendar";
import { WaitingRoomBoard } from "@/components/reception/waiting-room-board";

export default async function ReceptionDashboard({
  params,
}: {
  params: Promise<{ tenantId: string }>;
}) {
  const { tenantId } = await params;
  const tenant = await getTenantBySlug(tenantId);
  if (!tenant) notFound();

  const board = await getReceptionBoard(tenant.id);

  return (
    <div className="grid gap-4 xl:grid-cols-[1fr_320px]">
      <MasterCalendar tenantSlug={tenantId} board={board} />
      <WaitingRoomBoard tenantSlug={tenantId} appointments={board.appointments} />
    </div>
  );
}
