import { api } from "@/lib/api";

export type FiltroClinica =
  | "Clínicas com cupons de vacinação"
  | "Atendimento social"
  | "Mais perto de mim"
  | "Aberto em Fins de Semana"
  | "Atendimento 24 Horas"
  | "Internação"
  | "Raio X"
  | "Taxi Dog / Transporte";

export const FILTROS_CLINICAS: FiltroClinica[] = [
  "Clínicas com cupons de vacinação",
  "Atendimento social",
  "Mais perto de mim",
  "Aberto em Fins de Semana",
  "Atendimento 24 Horas",
  "Internação",
  "Raio X",
  "Taxi Dog / Transporte",
];

export type AdicionalServico = {
  id: string;
  titulo: string;
  descricao: string;
  preco: number;
};

export type ServicoClinica = {
  id: string;
  clinicaId: string;
  clinicaNome: string;
  categoria?: string;
  titulo: string;
  descricao: string;
  precoBase: number;
  tipoPrecificacao?: "fixo" | "a_partir_de";
  bannerUrl?: string | null;
  adicionais: AdicionalServico[];
};

export type CupomClinica = {
  id?: string;
  codigo: string;
  titulo: string;
  subtitulo: string;
  percentual?: number;
  descontoValor?: number;
};

export type ItemCarrinho = {
  id: string;
  clinicaId: string;
  clinicaNome: string;
  titulo: string;
  preco: number;
  quantidade: number;
  tipo: "servico" | "adicional";
  imagemUrl?: string | null;
};

export type PedidoConfirmado = {
  numeroPedido: string;
  clinicaId: string;
  clinicaNome: string;
  petNome: string;
  dataAtendimento: string; // YYYY-MM-DD
  horarioAtendimento: string; // HH:mm
  localAtendimento: "Na clínica" | "Em casa";
  formaPagamento: "Pix" | "Cartão de Débito" | "Crédito" | "Dinheiro";
  itens: ItemCarrinho[];
  subtotal: number;
  servicosAdicionais: number;
  desconto: number;
  frete: number;
  total: number;
};

const CHAVE_SERVICOS_POR_CLINICA = "astro_servicos_clinica_v1";
const CHAVE_CUPONS_POR_CLINICA = "astro_cupons_clinica_v1";
const CHAVE_CARRINHO = "astro_carrinho_servicos_v1";
const CHAVE_CUPOM = "astro_carrinho_cupom_v1";
const CHAVE_PEDIDO = "astro_ultimo_pedido_v1";
const CHAVE_FAVS_CLINICAS = "astro_clinicas_favoritas_v1";

function lerServicosLocais(clinicaId: string): ServicoClinica[] {
  if (typeof window === "undefined") return [];
  try {
    const bruto = localStorage.getItem(CHAVE_SERVICOS_POR_CLINICA);
    if (!bruto) return [];
    const todos = JSON.parse(bruto) as ServicoClinica[];
    if (!Array.isArray(todos)) return [];
    return todos.filter((s) => s.clinicaId === clinicaId);
  } catch {
    return [];
  }
}

export async function listarServicosClinica(clinicaId: string): Promise<ServicoClinica[]> {
  try {
    const remotos = await api<ServicoClinica[]>(
      `/api/ongs/${encodeURIComponent(clinicaId)}/servicos`
    );
    if (Array.isArray(remotos)) return remotos;
  } catch {
    // Caso a rota ainda não exista no back, usa os serviços salvos localmente
  }
  return lerServicosLocais(clinicaId);
}

export async function buscarServicoClinica(
  clinicaId: string,
  servicoId: string
): Promise<ServicoClinica | null> {
  const lista = await listarServicosClinica(clinicaId);
  return lista.find((s) => s.id === servicoId) || null;
}

export async function listarCuponsClinica(clinicaId: string): Promise<CupomClinica[]> {
  try {
    const remotos = await api<CupomClinica[]>(
      `/api/ongs/${encodeURIComponent(clinicaId)}/cupons`
    );
    if (Array.isArray(remotos)) return remotos;
  } catch {
    // Fallback local
  }
  if (typeof window === "undefined") return [];
  try {
    const bruto = localStorage.getItem(CHAVE_CUPONS_POR_CLINICA);
    if (!bruto) return [];
    const mapa = JSON.parse(bruto) as Record<string, CupomClinica[]>;
    return Array.isArray(mapa[clinicaId]) ? mapa[clinicaId] : [];
  } catch {
    return [];
  }
}

export function lerCarrinho(): ItemCarrinho[] {
  if (typeof window === "undefined") return [];
  try {
    const salvo = localStorage.getItem(CHAVE_CARRINHO);
    if (!salvo) return [];
    const parsed = JSON.parse(salvo);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function salvarCarrinho(itens: ItemCarrinho[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(CHAVE_CARRINHO, JSON.stringify(itens));
    window.dispatchEvent(new Event("astro-carrinho-atualizado"));
  } catch {
    // ignora
  }
}

export function limparCarrinho() {
  salvarCarrinho([]);
  salvarCupomCarrinho(null);
}

export function adicionarOuIncrementarCarrinho(novo: Omit<ItemCarrinho, "quantidade">) {
  const atual = lerCarrinho();
  const existente = atual.find((i) => i.id === novo.id && i.clinicaId === novo.clinicaId);
  let proximo: ItemCarrinho[];
  if (existente) {
    proximo = atual.map((i) =>
      i.id === novo.id && i.clinicaId === novo.clinicaId
        ? { ...i, quantidade: i.quantidade + 1 }
        : i
    );
  } else {
    proximo = [...atual, { ...novo, quantidade: 1 }];
  }
  salvarCarrinho(proximo);
  return proximo;
}

export function lerCupomCarrinho(): {
  codigo: string;
  descontoValor?: number;
  percentual?: number;
} | null {
  if (typeof window === "undefined") return null;
  try {
    const salvo = localStorage.getItem(CHAVE_CUPOM);
    return salvo ? JSON.parse(salvo) : null;
  } catch {
    return null;
  }
}

export function salvarCupomCarrinho(
  cupom: { codigo: string; descontoValor?: number; percentual?: number } | null
) {
  if (typeof window === "undefined") return;
  try {
    if (!cupom) localStorage.removeItem(CHAVE_CUPOM);
    else localStorage.setItem(CHAVE_CUPOM, JSON.stringify(cupom));
  } catch {
    // ignora
  }
}

export function calcularDescontoCupom(
  subtotal: number,
  cupom: { codigo: string; descontoValor?: number; percentual?: number } | null
): number {
  if (!cupom || subtotal <= 0) return 0;
  if (cupom.percentual && cupom.percentual > 0) {
    return Math.min(subtotal, (subtotal * cupom.percentual) / 100);
  }
  if (cupom.descontoValor && cupom.descontoValor > 0) {
    return Math.min(subtotal, cupom.descontoValor);
  }
  return 0;
}

export function salvarUltimoPedido(pedido: PedidoConfirmado) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(CHAVE_PEDIDO, JSON.stringify(pedido));
  } catch {
    // ignora
  }
}

export function lerUltimoPedido(): PedidoConfirmado | null {
  if (typeof window === "undefined") return null;
  try {
    const salvo = localStorage.getItem(CHAVE_PEDIDO);
    if (!salvo) return null;
    return JSON.parse(salvo) as PedidoConfirmado;
  } catch {
    return null;
  }
}

export function lerClinicasFavoritas(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const salvo = localStorage.getItem(CHAVE_FAVS_CLINICAS);
    return salvo ? JSON.parse(salvo) : [];
  } catch {
    return [];
  }
}

export function alternarClinicaFavorita(id: string): string[] {
  const atuais = lerClinicasFavoritas();
  const proximo = atuais.includes(id)
    ? atuais.filter((item) => item !== id)
    : [...atuais, id];
  try {
    localStorage.setItem(CHAVE_FAVS_CLINICAS, JSON.stringify(proximo));
  } catch {
    // ignora
  }
  return proximo;
}

export function formatarMoeda(valor: number): string {
  return valor.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}
