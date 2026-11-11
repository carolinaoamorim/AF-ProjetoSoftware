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
