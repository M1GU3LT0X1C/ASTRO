export type Servico = {id:string; nome:string; categoria:string; descricao:string; tipo:"fixo"|"adicionais"; preco:number; adicionais:string; ativo:boolean; criadoEm:string};
export type Cupom = {id:string; codigo:string; nome:string; categoria:string; beneficio:string; custo:number; limite:number; publico:string; inicio:string; fim:string; status:"ativo"|"pausado"; criadoEm:string};
export type Resgate = {id:string; cupomId:string; codigo:string; criadoEm:string};
export type DadosClinica = {servicos:Servico[]; cupons:Cupom[]; resgates:Resgate[]};
export const CHAVE="astro_clinica_dados_v1";
export const vazio:DadosClinica={servicos:[],cupons:[],resgates:[]};
export function carregar():DadosClinica {
 if(typeof window==="undefined") return vazio;
 try { const d=JSON.parse(localStorage.getItem(CHAVE)||"{}"); return {servicos:Array.isArray(d.servicos)?d.servicos:[],cupons:Array.isArray(d.cupons)?d.cupons:[],resgates:Array.isArray(d.resgates)?d.resgates:[]}; }
 catch {return vazio;}
}
export function salvar(d:DadosClinica) {localStorage.setItem(CHAVE,JSON.stringify(d));window.dispatchEvent(new Event("astro-clinica-atualizada"));}
export function codigoNovo(){return crypto.randomUUID().slice(0,8).toUpperCase();}
export function cupomValido(c:Cupom, d:DadosClinica) {
 const hoje=new Date().toISOString().slice(0,10);
 return c.status==="ativo" && (!c.inicio || c.inicio<=hoje) && (!c.fim || c.fim>=hoje) && (c.limite<=0 || d.resgates.filter(r=>r.cupomId===c.id).length<c.limite);
}
