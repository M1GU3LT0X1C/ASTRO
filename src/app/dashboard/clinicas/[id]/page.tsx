import { PerfilClinicaView } from "@/components/clinicas-compra/PerfilClinicaView";

export default async function PerfilClinicaOngPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <PerfilClinicaView clinicaId={id} basePath="/dashboard" />;
}
