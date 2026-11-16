import { ServicoCompraView } from "@/components/clinicas-compra/ServicoCompraView";

export default async function ServicoCompraOngPage({
  params,
}: {
  params: Promise<{ id: string; servicoId: string }>;
}) {
  const { id, servicoId } = await params;
  return (
    <ServicoCompraView
      clinicaId={id}
      servicoId={servicoId}
      basePath="/dashboard"
    />
  );
}
