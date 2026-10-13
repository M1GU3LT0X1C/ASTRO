import Link from "next/link";
import styles from "./Footer.module.css";

export function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.content}>
        <nav className={styles.columns} aria-label="Links do rodapé">
          <div className={styles.column}>
            <h2>Institucional</h2>
            <Link href="/sobre-nos">Sobre a Astro</Link>
            <a href="mailto:contato@astropets.com.br">Contato</a>
          </div>

          <div className={styles.column}>
            <h2>Suporte</h2>
            <Link href="/ajuda">Central de Ajuda</Link>
            <Link href="/ajuda">Perguntas Frequentes</Link>
          </div>

          <div className={styles.column}>
            <h2>Legal</h2>
            <Link href="/termos-de-uso">Termos de Uso</Link>
            <Link href="/politica-de-privacidade">
              Política de Privacidade
            </Link>
          </div>

          <div className={styles.column}>
            <h2>Nos acompanhe</h2>

            <div className={styles.socials} aria-label="Redes sociais da Astro">
              <a
                className={styles.socialIcon}
                href="https://www.instagram.com/astropetsoficial/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram da Astro (abre em nova aba)"
              >
                <svg viewBox="0 0 32 32" fill="none" aria-hidden="true">
                  <rect
                    x="4"
                    y="4"
                    width="24"
                    height="24"
                    rx="7"
                    stroke="currentColor"
                    strokeWidth="2.5"
                  />
                  <circle
                    cx="16"
                    cy="16"
                    r="5.5"
                    stroke="currentColor"
                    strokeWidth="2.5"
                  />
                  <circle cx="23.2" cy="8.8" r="1.5" fill="currentColor" />
                </svg>
              </a>

              <a
                className={styles.socialIcon}
                href="https://www.linkedin.com/company/astropetsoficial"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn da Astro (abre em nova aba)"
              >
                <svg viewBox="0 0 32 32" fill="currentColor" aria-hidden="true">
                  <circle cx="8" cy="9" r="2.4" />
                  <path d="M6 13h4v13H6zm7 0h4v1.8c.7-1.2 2-2.1 4-2.1 3.5 0 5 2.2 5 6V26h-4v-6.5c0-2-.6-3.1-2.3-3.1-1.8 0-2.7 1.3-2.7 3.1V26h-4z" />
                </svg>
              </a>
            </div>
          </div>
        </nav>

        <div className={styles.bottom}>
          <span className={styles.star} aria-hidden="true">✦</span>
          <p>© {new Date().getFullYear()} Astro. Todos os direitos reservados.</p>
          <span className={styles.star} aria-hidden="true">✦</span>
        </div>
      </div>
    </footer>
  );
}