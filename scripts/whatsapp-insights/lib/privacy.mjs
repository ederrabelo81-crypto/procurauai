/**
 * Redação de números de telefone digitados dentro do texto de uma mensagem
 * (ex.: "me chama nesse número 35 992171867") antes de qualquer texto virar
 * `exemplos_pedido` num arquivo versionado.
 *
 * O guardrail de privacidade da tarefa proíbe gravar telefone de pessoa
 * física que só fez uma pergunta no grupo — isso vale tanto para o campo
 * `sender` (nunca gravado) quanto para números que a própria pessoa colou no
 * corpo da mensagem. Como gente digita telefone de formas bem irregulares em
 * chat (com/sem DDD, com espaço partido no lugar errado, com ponto, com
 * traço, colado), o padrão é deliberadamente permissivo: qualquer sequência
 * de 8+ dígitos com no máximo um separador entre cada um. Prefere
 * falso-positivo (redigir um número de 8 dígitos que não era telefone) a
 * falso-negativo (deixar vazar um telefone real).
 */
const PHONE_LIKE_RUN = /(?:\d[\s.-]?){8,}/g;

export function redactPhoneNumbers(text) {
  return String(text ?? "").replace(PHONE_LIKE_RUN, "[número removido]");
}
