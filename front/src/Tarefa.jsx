import { useCallback, useEffect, useState } from 'react'

const API_URL = '/api'

const emptyForm = (emailAvaliador = '') => ({
  emailAvaliador,
  emailAvaliado: '',
  nota: '',
  comentarios: '',
})

async function mensagemDeErro(response, padrao) {
  if (response.status === 401) return 'Sessão inválida. Faça login novamente.'
  if (response.status === 403) return 'Você não tem permissão para esta ação.'
  try {
    const body = await response.json()
    return body.message || body.detail || padrao
  } catch {
    return padrao
  }
}

export default function Tarefa({ user, token, isAdmin }) {
  const [tarefas, setTarefas] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [formData, setFormData] = useState(emptyForm(user.email))
  const [submitting, setSubmitting] = useState(false)

  const fetchTarefa = useCallback(async () => {
    try {
      setLoading(true)
      setError('')
      const response = await fetch(`${API_URL}/tarefa`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!response.ok) {
        throw new Error(await mensagemDeErro(response, 'Erro ao buscar tarefas'))
      }
      setAvaliacoes(await response.json())
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [token])

  useEffect(() => {
    if (token) fetchTarefa()
  }, [token, fetchTarefa])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSuccess('')

    if (!formData.emailCriador || !formData.titulo || !formData.descricao || !formData.prioridade) {
      setError('Preencha os dados')
      return
    }

    try {
      setSubmitting(true)
      setError('')
      const response = await fetch(`${API_URL}/tarefas`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ ...formData }),
      })
      if (!response.ok) {
        throw new Error(await mensagemDeErro(response, 'Erro ao cadastrar tarefa'))
      }
      const nova = await response.json()
      setAvaliacoes((prev) => [nova, ...prev])
      setFormData(emptyForm(user.email))
      setSuccess('Tarefa cadastrada com sucesso.')
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      {isAdmin ? (
        <section className="card">
          <h2>Cadastrar tarefa</h2>
          <form onSubmit={handleSubmit} className="form">
            <label>
              Email do criador
              <input
                type="email"
                name="emailCriador"
                value={formData.emailCriador}
                onChange={handleInputChange}
                required
              />
            </label>
            <label>
              Titulo
              <input
                name="titulo"
                value={formData.titulo}
                onChange={handleInputChange}
                required
              />
            </label>
            <label>
              Descricao
              <input
                name="descricao"
                value={formData.descricao}
                onChange={handleInputChange}
                required
              />
            </label>
            <label className="full">
              Prioridade
              <textarea
                name="prioridade"
                value={formData.prioridade}
                onChange={handleInputChange}
              />
            </label>
            <button type="submit" className="btn btn-primary full" disabled={submitting || !token}>
              {submitting ? 'Cadastrando...' : 'Cadastrar tarefa'}
            </button>
          </form>
        </section>
      ) : (
        <p className="muted note">Somente administradores podem cadastrar tarefas.</p>
      )}

      <section className="card">
        <div className="section-title">
          <h2>Tarefas cadastradas</h2>
          <button className="btn" onClick={fetchAvaliacoes} disabled={loading || !token}>
            Atualizar
          </button>
        </div>

        {loading ? (
          <p className="muted">Carregando tarefas...</p>
        ) : tarefa.length === 0 ? (
          <p className="muted">Nenhuma tarefa cadastrada ainda.</p>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Criador</th>
                  <th>Título</th>
                  <th>Descrição</th>
                  <th>Prioridade</th>
                </tr>
              </thead>
              <tbody>
                {tarefa.map((a) => (
                  <tr key={a.id}>
                    <td>{a.id}</td>
                    <td>{a.emailCriador}</td>
                    <td>{a.titulo}</td>
                    <td>{a.descricao || '-'}</td>
                    <td>{a.prioridade}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </>
  )
}