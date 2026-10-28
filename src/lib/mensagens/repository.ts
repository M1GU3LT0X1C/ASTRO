/** Contrato único de dados para ONG e Explorador. Substituir o adaptador vazio por Supabase/API. */
export type TipoConta = "ong" | "explorador";
export type Mensagem = { id: string; texto: string; minha: boolean; hora: string };
export type Conversa = { id: string; nome: string; descricao: string; hora: string; arquivada: boolean; mensagens: Mensagem[] };
export type Contato = { id: string; nome: string; descricao: string };
export interface MensagensRepository {
  listarConversas(tipo: TipoConta): Promise<Conversa[]>;
  buscarContatos(termo: string, tipo: TipoConta): Promise<Contato[]>;
  iniciarConversa(destinatarioId: string, tipo: TipoConta): Promise<Conversa | null>;
  enviarMensagem(conversaId: string, texto: string): Promise<Mensagem>;
  listarMensagens(conversaId: string): Promise<Mensagem[]>;
  arquivarConversa(conversaId: string, arquivar: boolean): Promise<void>;
}
/** Sem dados falsos: até conectar backend, listas ficam vazias e envio é indisponível. */
export const mensagensRepository: MensagensRepository = {
  async listarConversas() { return []; },
  async buscarContatos() { return []; },
  async iniciarConversa() { return null; },
  async enviarMensagem() { throw new Error("Mensagens ainda não integradas"); },
  async listarMensagens() { return []; },
  async arquivarConversa() { throw new Error("Arquivamento ainda não integrado"); },
};
