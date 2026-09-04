"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import styles from "./Novo.module.css";

export default function NovoPetPage() {
  const router = useRouter();
  const [ongId, setOngId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [foto, setFoto] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>("/logo-gato.png");

  const [form, setForm] = useState({
    nome: "",
    especie: "Cachorro",
    idade_meses: "",
    porte: "Médio",
    sexo: "Fêmea",
    descricao: "",
  });

  useEffect(() => {
    async function getOng() {
      const idLocal = localStorage.getItem("ong_id");
      if (idLocal) setOngId(idLocal);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase.from("ongs").select("id").eq("usuario_id", user.id).maybeSingle();
      if (data) {
        setOngId(data.id);
        localStorage.setItem("ong_id", data.id);
      }
    }
    getOng();
  }, []);

  function onFoto(e: any) {
    const file = e.target.files[0];
    if (!file) return;
    setFoto(file);
    setPreview(URL.createObjectURL(file));
  }

  async function salvar(e: any) {
    e.preventDefault();
    if (!ongId) return alert("ONG não encontrada, faça login de novo");
    if (!form.nome) return alert("Coloca o nome do pet");
    setLoading(true);

    let foto_url = "";
    if (foto) {
      const nomeArquivo = `${ongId}/${Date.now()}-${foto.name}`;
      const { error: uploadError } = await supabase.storage.from("animais-fotos").upload(nomeArquivo, foto);
      if (uploadError) {
        setLoading(false);
        return alert("Erro no upload: " + uploadError.message);
      }
      const { data } = supabase.storage.from("animais-fotos").getPublicUrl(nomeArquivo);
      foto_url = data.publicUrl;
    }

    const { error } = await supabase.from("animais").insert({
      ong_id: ongId,
      nome: form.nome,
      especie: form.especie,
      idade_meses: form.idade_meses? Number(form.idade_meses) : null,
      porte: form.porte,
      sexo: form.sexo,
      descricao: form.descricao,
      foto_url: foto_url,
      imagem_url: foto_url,
    });

    setLoading(false);
    if (error) return alert("Erro ao salvar: " + error.message);

    alert("Pet cadastrado! 🐾");
    router.push("/dashboard");
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Cadastrar novo pet</h1>
        <p>Preencha as informações para aparecer no painel</p>
      </div>

      <form onSubmit={salvar} className={styles.form}>
        <div className={styles.fotoArea}>
          <img src={preview} alt="preview" className={styles.preview} />
          <label className={styles.btnFoto}>
            <img src="/mais-novo-pet.png" alt="+" className={styles.iconeMais} />
            Escolher foto
            <input type="file" accept="image/*" onChange={onFoto} hidden />
          </label>
        </div>

        <div className={styles.grid}>
          <div className={styles.campo}><label>Nome do pet *</label><input value={form.nome} onChange={e=>setForm({...form, nome:e.target.value})} placeholder="Ex: Coca-cola" required /></div>
          <div className={styles.campo}><label>Espécie</label><select value={form.especie} onChange={e=>setForm({...form, especie:e.target.value})}><option>Cachorro</option><option>Gato</option><option>Outro</option></select></div>
          <div className={styles.campo}><label>Idade (meses)</label><input type="number" value={form.idade_meses} onChange={e=>setForm({...form, idade_meses:e.target.value})} placeholder="Ex: 24" /></div>
          <div className={styles.campo}><label>Porte</label><select value={form.porte} onChange={e=>setForm({...form, porte:e.target.value})}><option>Pequeno</option><option>Médio</option><option>Grande</option></select></div>
          <div className={styles.campo}><label>Sexo</label><select value={form.sexo} onChange={e=>setForm({...form, sexo:e.target.value})}><option>Fêmea</option><option>Macho</option></select></div>
          <div className={`${styles.campo} ${styles.full}`}><label>Sobre o pet</label><textarea value={form.descricao} onChange={e=>setForm({...form, descricao:e.target.value})} placeholder="Conta a história dele..." rows={4} /></div>
        </div>

        <button type="submit" className={styles.btnSalvar} disabled={loading}>{loading? "Salvando..." : "Salvar pet"}</button>
      </form>
    </div>
  );
}