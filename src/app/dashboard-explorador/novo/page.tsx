"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import NovoPetForm from "@/components/novo-pet/NovoPetForm";

// ?id= abre o formulario em modo de edicao (ver /dashboard/novo).
function Conteudo() {
  const id = useSearchParams().get("id");
  return <NovoPetForm key={id || "novo"} modo="explorador" id={id} />;
}

export default function NovoPetExplorador() {
  return <Suspense fallback={<div style={{ padding: 24 }}>Carregando...</div>}><Conteudo /></Suspense>;
}
