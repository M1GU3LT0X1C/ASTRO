// Mensagens do Supabase Auth (em ingles) -> texto para a pessoa usuaria.
const TRADUCOES: [RegExp, string][] = [
  [/invalid login credentials/i, "E-mail ou senha incorretos."],
  [/email not confirmed/i, "Confirme seu e-mail pelo link que enviamos antes de entrar."],
  [/email rate limit exceeded|over_email_send_rate_limit/i, "Muitas tentativas em pouco tempo. Aguarde alguns minutos e tente novamente."],
  [/for security purposes, you can only request this after/i, "Por segurança, aguarde alguns segundos antes de solicitar um novo envio."],
  [/rate limit|too many requests/i, "Muitas tentativas em pouco tempo. Aguarde alguns minutos e tente novamente."],
  [/user already registered/i, "Este e-mail já está cadastrado."],
  [/password should be at least/i, "A senha precisa ter pelo menos 8 caracteres."],
  [/new password should be different from the old password|same_password/i, "A nova senha deve ser diferente da senha atual."],
  [/token has expired or is invalid|otp_expired|flow_state_not_found|flow_state_expired/i, "O código ou link de recuperação expirou ou é inválido. Solicite um novo envio."],
  [/unable to validate email address|invalid email/i, "E-mail inválido."],
  [/network|failed to fetch/i, "Sem conexão com o servidor. Verifique sua internet."],
];

export function traduzirErroAuth(mensagem: string): string {
  return TRADUCOES.find(([padrao]) => padrao.test(mensagem))?.[1] ?? mensagem;
}
