// Mensagens do Supabase Auth (em ingles) -> texto para a pessoa usuaria.
const TRADUCOES: [RegExp, string][] = [
  [/invalid login credentials/i, "E-mail ou senha incorretos."],
  [/email not confirmed/i, "Confirme seu e-mail pelo link que enviamos antes de entrar."],
  [/email rate limit exceeded|over_email_send_rate_limit/i, "Muitas tentativas em pouco tempo. Aguarde alguns minutos e tente novamente."],
  [/rate limit|too many requests/i, "Muitas tentativas em pouco tempo. Aguarde alguns minutos e tente novamente."],
  [/user already registered/i, "Este e-mail já está cadastrado."],
  [/password should be at least/i, "A senha é muito curta."],
  [/unable to validate email address|invalid email/i, "E-mail inválido."],
  [/network|failed to fetch/i, "Sem conexão com o servidor. Verifique sua internet."],
];

export function traduzirErroAuth(mensagem: string): string {
  return TRADUCOES.find(([padrao]) => padrao.test(mensagem))?.[1] ?? mensagem;
}
