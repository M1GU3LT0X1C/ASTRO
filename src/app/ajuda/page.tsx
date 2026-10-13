"use client";
import { useState, useMemo } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import styles from "./Ajuda.module.css";

type FAQ = { id: string; categoria: "adocao" | "ongs" | "consultas" | "conta"; pergunta: string; resposta: string; };

const faqs: FAQ[] = [
  { id:"1", categoria:"adocao", pergunta:"O Astro realiza adoções diretamente?", resposta:"Não, O Astro funciona como um hub de conexão entre tutores, abrigos e protetores. Nós facilitamos o encontro e a divulgação dos animais, mas todo o processo de entrevista, triagem e assinatura do termo de responsabilidade é feito diretamente com a Base Estelar (ONG) ou Guardião de Órbita responsável." },
  { id:"2", categoria:"adocao", pergunta:"Quais são os requisitos para adotar um pet pelo site?", resposta:"Os requisitos padrão incluem: ser maior de 18 anos, apresentar documento com foto, comprovante de residência e passar pela entrevista de avaliação da ONG parceira para garantir um lar seguro e compatível." },
  { id:"3", categoria:"consultas", pergunta:"Como funcionam os cupons de desconto nas clínicas parceiras?", resposta:"Ao navegar pelas Estações de Cuidado da sua região, você pode resgatar cupons promocionais. Basta apresentar o código gerado no site na recepção da clínica parceira." },
  { id:"4", categoria:"consultas", pergunta:"Como funciona o sistema de pontos e avaliações?", resposta:"Após cada atendimento em uma clínica parceira, você avalia a experiência na plataforma. Essa avaliação gera pontos no seu perfil, que podem ser trocados por novos descontos." },
  { id:"5", categoria:"ongs", pergunta:"Minha ONG está superlotada. Como acionar a tag de urgência?", resposta:"Dentro do seu painel administrativo, você pode atualizar o status de capacidade. Ao atingir o limite crítico, o selo 'Lotado / Urgente' é ativado automaticamente e ganha prioridade na sua região." },
  { id:"6", categoria:"ongs", pergunta:"Sou uma ONG ou Protetor Independente. Como cadastro meus resgatados?", resposta:"O cadastro é 100% gratuito. Acesse 'Cadastrar Parceiro', escolha Base Estelar para ONGs ou Guardião de Órbita para protetores, envie os dados de verificação e comece a cadastrar." },
  { id:"7", categoria:"conta", pergunta:"Como altero meus dados e privacidade?", resposta:"Em 'Minha Conta' você pode editar nome, e-mail, senha, CEP e gerenciar suas permissões de dados conforme a LGPD." },
];

const topicos = [
  { id:"adocao", label:"Adoção e Acompanhamento", cor: "azul" },
  { id:"ongs", label:"Para ONGs e Protetores", cor: "rosa" },
  { id:"consultas", label:"Consultas e Cupons", cor: "azul" },
  { id:"conta", label:"Minha conta e privacidade", cor: "rosa" },
];

export default function AjudaPage(){
  const [busca,setBusca]=useState(""); // o que a pessoa digita
  const [topicoAtivo,setTopicoAtivo]=useState<string|null>(null); // qual pill clicado
  const [aberto,setAberto]=useState<string|null>("1"); // qual pergunta do FAQ tá aberta

  const filtradas = useMemo(()=>{
    const b = busca.toLowerCase().trim();
    return faqs.filter(f=>{
      const matchBusca =!b || f.pergunta.toLowerCase().includes(b) || f.resposta.toLowerCase().includes(b);
      const matchTopico =!topicoAtivo || f.categoria===topicoAtivo;
      return matchBusca && matchTopico;
    });
  },[busca,topicoAtivo]);

  // Quando digita, sugere tópicos relacionados
  const topicosSugeridos = useMemo(()=>{
    if(!busca) return topicos;
    const b = busca.toLowerCase();
    return topicos.filter(t => t.label.toLowerCase().includes(b) || t.id.includes(b));
  },[busca]);

  const porCat = (cat:string)=> filtradas.filter(f=>f.categoria===cat);

  return(
    <>
      <Header/>
      <main className={styles.ajuda}>
        <div className={styles.topo}>
          <h1>Como podemos ajudar você e seu pet hoje?</h1>
          <div className={styles.buscaWrap}>
            <input value={busca} onChange={e=>setBusca(e.target.value)} placeholder="Digite sua dúvida ou palavra chave" className={styles.busca}/>
          </div>

          <div className={styles.topicosHeader}>
            <p>{busca? `Resultados para "${busca}" - tópicos relacionados:` : "Tópicos mais procurados"}</p>
            <div className={styles.pills}>
              {(busca? topicosSugeridos : topicos).map(t=>(
                <button key={t.id} onClick={()=>setTopicoAtivo(topicoAtivo===t.id?null:t.id)} className={`${styles.pill} ${t.cor=== 'azul'?styles.pillAzul:styles.pillRosa} ${topicoAtivo===t.id?styles.pillAtivo:''}`}>{t.label}</button>
              ))}
            </div>
          </div>
        </div>

        <section className={styles.conteudo}>
          <h2 className={styles.tituloFAQ}>Perguntas Frequentes (FAQ)</h2>
          <h3 className={styles.categoria}>Adoção e Acompanhamento</h3>
          <div className={styles.cardFAQ}>{porCat("adocao").map(f=><div key={f.id} className={styles.item}><button className={styles.pergunta} onClick={()=>setAberto(aberto===f.id?null:f.id)}>{f.pergunta}<span>{aberto===f.id?"−":"+"}</span></button>{aberto===f.id&&<p className={styles.resposta}>{f.resposta}</p>}</div>)}</div>

          <h3 className={styles.categoria}>Consultas e Cupons</h3>
          <div className={styles.cardFAQ}>{porCat("consultas").map(f=><div key={f.id} className={styles.item}><button className={styles.pergunta} onClick={()=>setAberto(aberto===f.id?null:f.id)}>{f.pergunta}<span>{aberto===f.id?"−":"+"}</span></button>{aberto===f.id&&<p className={styles.resposta}>{f.resposta}</p>}</div>)}</div>

          <h3 className={styles.categoria}>ONGs e Protetores</h3>
          <div className={styles.cardFAQ}>{porCat("ongs").map(f=><div key={f.id} className={styles.item}><button className={styles.pergunta} onClick={()=>setAberto(aberto===f.id?null:f.id)}>{f.pergunta}<span>{aberto===f.id?"−":"+"}</span></button>{aberto===f.id&&<p className={styles.resposta}>{f.resposta}</p>}</div>)}</div>
        </section>
      </main>
      <Footer/>
    </>
  )
}