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

/** Converte e redimensiona a imagem para Data URL como fallback caso o bucket bloqueie o upload. */
function comprimirParaDataUrl(arquivo: File, maxDim = 480): Promise<string> {
  return new Promise((resolve, reject) => {
    const leitor = new FileReader();
    leitor.onerror = () => reject(new Error("Não foi possível ler a imagem selecionada."));
    leitor.onload = () => {
      const resultado = typeof leitor.result === "string" ? leitor.result : "";
      if (typeof window === "undefined") {
        resolve(resultado);
        return;
      }
      const img = new Image();
      img.onerror = () => resolve(resultado);
      img.onload = () => {
        const escala = Math.min(1, maxDim / Math.max(img.width || 1, img.height || 1));
        const largura = Math.max(1, Math.round(img.width * escala));
        const altura = Math.max(1, Math.round(img.height * escala));
        const canvas = document.createElement("canvas");
        canvas.width = largura;
        canvas.height = altura;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve(resultado);
          return;
        }
        ctx.drawImage(img, 0, 0, largura, altura);
        resolve(canvas.toDataURL("image/jpeg", 0.84));
      };
      img.src = resultado;
    };
    leitor.readAsDataURL(arquivo);
  });
}

/** Envia uma imagem para o bucket publico e devolve a URL publica. pasta: "logos", "capas", "explorador", "pets"... */
export async function enviarImagemPublica(arquivo: File, pasta: string, opcoes: { permitirDataUrl?: boolean } = {}): Promise<string> {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      if (opcoes.permitirDataUrl === false) throw new Error("Sua sessão expirou. Entre novamente para enviar a foto.");
      return await comprimirParaDataUrl(arquivo);
    }
    const caminho = `${pasta}/${user.id}-${Date.now()}.${extensao(arquivo)}`;
    const armazenamento = supabase.storage.from(BUCKET_PUBLICO);
    const { error } = await armazenamento.upload(caminho, arquivo, {
      contentType: arquivo.type,
      upsert: true,
    });
    if (error) {
      if (opcoes.permitirDataUrl === false) throw new Error(error.message);
      return await comprimirParaDataUrl(arquivo);
    }
    return armazenamento.getPublicUrl(caminho).data.publicUrl;
  } catch (error) {
    if (opcoes.permitirDataUrl === false) throw error;
    return await comprimirParaDataUrl(arquivo);
  }
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
