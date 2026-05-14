import { EphemeralScanPage } from "@/src/components/report/ephemeral-scan-page";

export default async function ScanReportPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return <EphemeralScanPage scanId={id} />;
}
