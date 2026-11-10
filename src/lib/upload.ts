import { supabase } from "@/lib/supabase";

// Arquivos vao direto do navegador para o Supabase Storage; o back so guarda a URL/caminho.

const BUCKET_PUBLICO = "animais-fotos"; // fotos de pets, logos, capas e fotos de perfil
const BUCKET_DOCUMENTOS = "documentos"; // privado: documentos de verificacao (sql/004)

function extensao(arquivo: File) {
  return arquivo.name.split(".").pop()?.toLowerCase().replace(/[^a-z0-9]/g, "") || "bin";
}

export function validarImagem(arquivo: File, limiteMb = 5): string | null {
  if (!arquivo.type.startsWith("image/")) return "Selecione um arquivo de imagem.";
  if (arquivo.size > limiteMb * 1024 * 1024) return `Escolha uma imagem de até ${limiteMb} MB.`;
  return null;
}

/** Envia uma imagem para o bucket publico e devolve a URL publica. pasta: "logos", "capas", "explorador", "pets"... */
export async function enviarImagemPublica(arquivo: File, pasta: string): Promise<string> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Entre na sua conta para enviar imagens.");
  const caminho = `${pasta}/${user.id}-${Date.now()}.${extensao(arquivo)}`;
  const armazenamento = supabase.storage.from(BUCKET_PUBLICO);
  const { error } = await armazenamento.upload(caminho, arquivo, { contentType: arquivo.type });
  if (error) throw new Error(error.message);
  return armazenamento.getPublicUrl(caminho).data.publicUrl;
}

/** Envia um documento para o bucket privado, na pasta da propria conta, e devolve o caminho. */
export async function enviarDocumentoPrivado(arquivo: File): Promise<string> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Entre na sua conta para enviar documentos.");
  const caminho = `${user.id}/${Date.now()}.${extensao(arquivo)}`;
  const { error } = await supabase.storage.from(BUCKET_DOCUMENTOS).upload(caminho, arquivo, { contentType: arquivo.type });
  if (error) throw new Error(error.message);
  return caminho;
}
