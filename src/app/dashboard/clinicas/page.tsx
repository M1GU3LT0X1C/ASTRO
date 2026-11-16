import { Suspense } from "react";
import { ProcurarClinicasView } from "@/components/clinicas-compra/ProcurarClinicasView";

export default function ProcurarClinicasOngPage() {
  return (
    <Suspense fallback={<p>Carregando clínicas...</p>}>
      <ProcurarClinicasView basePath="/dashboard" />
    </Suspense>
  );
}
