"use client";
import {useEffect,useState} from "react";
import {carregar,salvar,vazio,type DadosClinica} from "./dados";
export function useClinica(){
 const [dados,setDados]=useState<DadosClinica>(vazio);
 const [pronto,setPronto]=useState(false);
 useEffect(()=>{const sync=()=>setDados(carregar());sync();setPronto(true);window.addEventListener("astro-clinica-atualizada",sync);return()=>window.removeEventListener("astro-clinica-atualizada",sync);},[]);
 const atualizar=(fn:(d:DadosClinica)=>DadosClinica)=>{const novo=fn(carregar());salvar(novo);setDados(novo);};
 return {dados,pronto,atualizar};
}
