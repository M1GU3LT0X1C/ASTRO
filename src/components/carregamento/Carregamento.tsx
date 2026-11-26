import styles from "./Carregamento.module.css";

export default function Carregamento({ titulo = "Preparando seu painel...", descricao = "Estamos consultando suas informações. Isso pode levar alguns instantes.", pagina = false }: { titulo?: string; descricao?: string; pagina?: boolean }) {
  return (
    <div className={pagina ? styles.pagina : styles.aviso} role="status" aria-live="polite">
      <span className={styles.spinner} aria-hidden="true" />
      <div><strong>{titulo}</strong><p>{descricao}</p></div>
    </div>
  );
}
