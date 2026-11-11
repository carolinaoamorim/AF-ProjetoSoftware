// =====================================================================
// API: a ÚNICA função que fala com o back.
//
// Uso:
//   await chamar(token, '')                                  GET    /avaliacoes
//   await chamar(token, '?emailAvaliado=x')                  GET    /avaliacoes?emailAvaliado=x
//   await chamar(token, '/5')                                GET    /avaliacoes/5
//   await chamar(token, '', 'POST', { ...dados })            POST   /avaliacoes
//   await chamar(token, '/5', 'PUT', { ...dados })           PUT    /avaliacoes/5
//   await chamar(token, '/5', 'DELETE')                      DELETE /avaliacoes/5
//
// Se o back responder erro, lança um Error com a mensagem dele
// (ex.: "Não pode avaliar a si mesmo", "nota deve ser no máximo 10").
// =====================================================================
import { API } from './config'

export async function chamar(token, caminho, metodo = 'GET', corpo) {
  const resposta = await fetch(API + caminho, {
    method: metodo,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: corpo ? JSON.stringify(corpo) : undefined,
  })

  if (!resposta.ok) {
    throw new Error(await mensagemDeErro(resposta))
  }

  // DELETE responde 204 (sem corpo): não dá para ler JSON
  if (resposta.status === 204) return null
  return resposta.json()
}

async function mensagemDeErro(resposta) {
  if (resposta.status === 401) return 'Sessão inválida. Saia e entre de novo.'
  if (resposta.status === 403) return 'Você não tem permissão para isso.'
  if (resposta.status === 502) return 'Back fora do ar (EC2).'
  try {
    const corpo = await resposta.json()
    // Erro de validação (@NotBlank, @Size...): lista dos campos que falharam
    if (corpo.errors?.length) return corpo.errors.map((e) => e.defaultMessage).join(' / ')
    // ResponseStatusException do service (404, regra de negócio...)
    return corpo.message || `Erro ${resposta.status}`
  } catch {
    return `Erro ${resposta.status}`
  }
}
