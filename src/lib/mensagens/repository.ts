import { api } from "@/lib/api";

/** Contrato único de dados para ONG e Explorador, ligado a /api/conversas no back-end. */
export type TipoConta = "ong" | "explorador";
export type Mensagem = { id: string; texto: string; minha: boolean; hora: string };
export type Conversa = {
  id: string; contatoId: string; nome: string; descricao: string; hora: string; arquivada: boolean;
  naoLidas: number; ultimaMensagem: string; mensagens: Mensagem[];
};
export type Contato = { id: string; nome: string; descricao: string };

export interface MensagensRepository {
  listarConversas(tipo: TipoConta): Promise<Conversa[]>;
  buscarContatos(termo: string, tipo: TipoConta): Promise<Contato[]>;
  iniciarConversa(destinatarioId: string, tipo: TipoConta): Promise<Conversa | null>;
  enviarMensagem(conversaId: string, texto: string): Promise<Mensagem>;
  listarMensagens(conversaId: string): Promise<Mensagem[]>;
  arquivarConversa(conversaId: string, arquivar: boolean): Promise<void>;
}

type ConversaApi = {
  id: string; contatoId: string; nome: string; descricao: string; arquivada: boolean;
  ultimaMensagem: string | null; atualizadaEm: string; naoLidas: number;
};
type MensagemApi = { id: string; texto: string; minha: boolean; criadoEm: string };

/** Hora para mensagens de hoje; data curta para as mais antigas. */
export function formatarHora(iso: string) {
  const data = new Date(iso);
  const hoje = new Date();
  return data.toDateString() === hoje.toDateString()
    ? data.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })
    : data.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
}

const paraConversa = (c: ConversaApi): Conversa => ({
  id: c.id, contatoId: c.contatoId, nome: c.nome, descricao: c.descricao, hora: formatarHora(c.atualizadaEm),
  arquivada: c.arquivada, naoLidas: c.naoLidas, ultimaMensagem: c.ultimaMensagem || "", mensagens: [],
});

const paraMensagem = (m: MensagemApi): Mensagem => ({
  id: m.id, texto: m.texto, minha: m.minha,
  hora: new Date(m.criadoEm).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
});

export const mensagensRepository: MensagensRepository = {
  async listarConversas() {
    return (await api<ConversaApi[]>("/api/conversas")).map(paraConversa);
  },
  async buscarContatos(termo) {
    if (termo.trim().length < 2) return [];
    return api<Contato[]>(`/api/conversas/contatos?termo=${encodeURIComponent(termo.trim())}`);
  },
  async iniciarConversa(destinatarioId) {
    return paraConversa(await api<ConversaApi>("/api/conversas", { method: "POST", body: { destinatarioId } }));
  },
  async enviarMensagem(conversaId, texto) {
    return paraMensagem(await api<MensagemApi>(`/api/conversas/${encodeURIComponent(conversaId)}/mensagens`, { method: "POST", body: { texto } }));
  },
  async listarMensagens(conversaId) {
    return (await api<MensagemApi[]>(`/api/conversas/${encodeURIComponent(conversaId)}/mensagens`)).map(paraMensagem);
  },
  async arquivarConversa(conversaId, arquivar) {
    await api<void>(`/api/conversas/${encodeURIComponent(conversaId)}/arquivar?arquivar=${arquivar}`, { method: "PATCH" });
  },
};
