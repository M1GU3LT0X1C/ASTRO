"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import NovoPetForm from "@/components/novo-pet/NovoPetForm";

// ?id= abre o formulario em modo de edicao. A key recria o formulario quando o id muda
// (ex.: clicar em "Novo Pet" durante uma edicao), para nao continuar editando o pet anterior.
function Conteudo() {
  const id = useSearchParams().get("id");
  return <NovoPetForm key={id || "novo"} modo="ong" id={id} />;
}

export default function NovoPage() {
  return <Suspense fallback={<div style={{ padding: 24 }}>Carregando...</div>}><Conteudo /></Suspense>;
}
