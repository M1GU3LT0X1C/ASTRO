"use client";

import { useEffect, useState, type ChangeEvent } from "react";
import Link from "next/link";
import { Camera, CheckCircle2, LockKeyhole, ShieldCheck, UserRound } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { alerta } from "@/lib/alerta";
import styles from "./Configuracoes.module.css";

const CHAVE_FOTO = "astro_explorador_foto_perfil";

export default function ConfiguracoesExplorador() {
  const [foto, setFoto] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [salvo, setSalvo] = useState(false);

  useEffect(() => {
    setFoto(localStorage.getItem(CHAVE_FOTO) || "");
  }, []);

  async function alterarFoto(event: ChangeEvent<HTMLInputElement>) {
    const arquivo = event.target.files?.[0];
    if (!arquivo) return;
    if (!arquivo.type.startsWith("image/")) {
      alerta.aviso("Arquivo inválido", "Selecione uma imagem.");
      return;
    }
    if (arquivo.size > 5 * 1024 * 1024) {
      alerta.aviso("Imagem muito grande", "Escolha uma imagem de até 5 MB.");
      return;
    }
    setEnviando(true);
    setSalvo(false);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const nomeSeguro = arquivo.name.replace(/[^a-zA-Z0-9._-]/g, "-");
        const caminho = `exploradores/${user.id}/${Date.now()}-${nomeSeguro}`;
        const { error } = await supabase.storage.from("animais-fotos").upload(caminho, arquivo, { contentType: arquivo.type });
        if (error) throw error;
        const url = supabase.storage.from("animais-fotos").getPublicUrl(caminho).data.publicUrl;
        localStorage.setItem(CHAVE_FOTO, url);
        setFoto(url);
      } else {
        // Permite testar a interface sem login, sem criar uma foto fictícia no servidor.
        const leitor = new FileReader();
        const imagem = await new Promise<string>((resolve, reject) => {
          leitor.onload = () => resolve(String(leitor.result || ""));
          leitor.onerror = () => reject(new Error("Não foi possível ler a imagem."));
          leitor.readAsDataURL(arquivo);
        });
        setFoto(imagem);
        // Não persiste imagens grandes em localStorage no modo de teste.
      }
      setSalvo(true);
    } catch (erro) {
      alerta.erro("Não foi possível atualizar a foto", erro instanceof Error ? erro.message : undefined);
    } finally {
      setEnviando(false);
      event.target.value = "";
    }
  }

  return (
    <div className={styles.pagina}>
      <header className={styles.cabecalho}>
        <h1>Configurações</h1>
        <p>Gerencie seu perfil e suas preferências.</p>
      </header>
      <div className={styles.grade}>
        <section className={styles.cartao}>
          <div className={styles.titulo}><UserRound size={21} /><h2>Perfil do Explorador</h2></div>
          <div className={styles.fotoArea}>
            <div className={styles.avatar}>
              {foto ? <img src={foto} alt="Foto do perfil" /> : <UserRound size={36} aria-hidden="true" />}
            </div>
            <div>
              <strong>Foto de perfil</strong>
              <p>JPG, PNG ou outra imagem de até 5 MB.</p>
              <label className={styles.botaoArquivo}>
                <Camera size={16} /> {enviando ? "Enviando..." : "Alterar foto"}
                <input type="file" accept="image/*" onChange={alterarFoto} disabled={enviando} />
              </label>
              {salvo && <span className={styles.sucesso} role="status"><CheckCircle2 size={15} /> Foto atualizada</span>}
            </div>
          </div>
          <div className={styles.divisor} />
          <h3>Dados pessoais e questionário</h3>
          <p>Atualize seus dados de contato, endereço e respostas sobre adoção.</p>
          <Link href="/perfil-explorador" className={styles.botao}>Editar meu perfil</Link>
        </section>
        <section className={styles.cartao}>
          <div className={styles.titulo}><ShieldCheck size={21} /><h2>Privacidade e segurança</h2></div>
          <div className={styles.opcao}>
            <LockKeyhole size={22} />
            <div><strong>Segurança da conta</strong><p>Proteja seus dados e mantenha suas informações atualizadas.</p></div>
          </div>
          <Link href="/perfil-explorador" className={styles.botaoSecundario}>Ver dados da conta</Link>
        </section>
      </div>
    </div>
  );
}
