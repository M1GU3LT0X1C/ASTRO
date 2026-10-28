// Armazenamento provisório no navegador, até integrar os endpoints do Explorador.
export type PetExplorador = { id:string; nome:string; microchip:string; peso:string; castrado:string; alergias:string; condicao:string; foto:string; vacinas:string[]; exames:string[] };
export type Compromisso = { id:string; pet:string; descricao:string; local:string; data:string; hora:string };
export type Favorito = { id:string; tipo:"pet"|"clinica"; nome:string; descricao:string; foto?:string };
export type Adocao = { id:string; nomePet:string; status:string; data:string };
export function lerLocal<T>(chave:string, padrao:T):T { if(typeof window==="undefined")return padrao;try {const dado=localStorage.getItem(chave);return dado?JSON.parse(dado) as T:padrao;}catch{return padrao;} }
export function gravarLocal<T>(chave:string,valor:T){if(typeof window!=="undefined")localStorage.setItem(chave,JSON.stringify(valor));}
export const CHAVES={pets:"astro_explorador_pets",agenda:"astro_explorador_agenda",favoritos:"astro_explorador_favoritos",adocoes:"astro_explorador_adocoes"} as const;
