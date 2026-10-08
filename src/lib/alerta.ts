import Swal, { type SweetAlertIcon } from "sweetalert2";

// Todos os alertas do app passam por aqui, com o visual da paleta Astro (estilos em globals.css, prefixo .astro-swal).
const AstroSwal = Swal.mixin({
  buttonsStyling: false,
  reverseButtons: true, // botao principal a direita
  customClass: {
    popup: "astro-swal",
    title: "astro-swal-titulo",
    htmlContainer: "astro-swal-texto",
    confirmButton: "astro-swal-confirmar",
    cancelButton: "astro-swal-cancelar",
    actions: "astro-swal-acoes",
  },
});

// cores dos icones dentro da paleta (verde suave so para sucesso, para nao confundir com erro)
const COR_ICONE: Record<SweetAlertIcon, string> = {
  success: "#3fae7a",
  error: "#e63d68",
  warning: "#f5a524",
  info: "#201a4a",
  question: "#201a4a",
};

function mostrar(icon: SweetAlertIcon, title: string, text?: string) {
  return AstroSwal.fire({ icon, iconColor: COR_ICONE[icon], title, text, confirmButtonText: "OK" });
}

export const alerta = {
  sucesso: (title: string, text?: string) => mostrar("success", title, text),
  erro: (title: string, text?: string) => mostrar("error", title, text),
  aviso: (title: string, text?: string) => mostrar("warning", title, text),
  info: (title: string, text?: string) => mostrar("info", title, text),

  /** Retorna true se a pessoa clicou no botao principal. */
  async confirmar(opcoes: { title: string; text?: string; confirmText?: string; cancelText?: string; icon?: SweetAlertIcon }) {
    const icon = opcoes.icon ?? "question";
    const { isConfirmed } = await AstroSwal.fire({
      icon,
      iconColor: COR_ICONE[icon],
      title: opcoes.title,
      text: opcoes.text,
      showCancelButton: true,
      confirmButtonText: opcoes.confirmText ?? "Confirmar",
      cancelButtonText: opcoes.cancelText ?? "Cancelar",
    });
    return isConfirmed;
  },
};
