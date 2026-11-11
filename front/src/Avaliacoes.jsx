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

export default function Avaliacoes({ user, token, isAdmin }) {
  const [avaliacoes, setAvaliacoes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [formData, setFormData] = useState(emptyForm(user.email))
  const [submitting, setSubmitting] = useState(false)

  const fetchAvaliacoes = useCallback(async () => {
    try {
      setLoading(true)
      setError('')
      const response = await fetch(`${API_URL}/avaliacoes`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!response.ok) {
        throw new Error(await mensagemDeErro(response, 'Erro ao buscar avaliações'))
      }
      setAvaliacoes(await response.json())
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [token])

  useEffect(() => {
    if (token) fetchAvaliacoes()
  }, [token, fetchAvaliacoes])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSuccess('')

    const nota = Number(formData.nota)
    if (!formData.emailAvaliador || !formData.emailAvaliado || formData.nota === '') {
      setError('Preencha o email do avaliador, o email do avaliado e a nota.')
      return
    }
    if (Number.isNaN(nota) || nota < 0 || nota > 10) {
      setError('A nota deve estar entre 0 e 10.')
      return
    }

    try {
      setSubmitting(true)
      setError('')
      const response = await fetch(`${API_URL}/avaliacoes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ ...formData, nota }),
      })
      if (!response.ok) {
        throw new Error(await mensagemDeErro(response, 'Erro ao cadastrar avaliação'))
      }
      const nova = await response.json()
      setAvaliacoes((prev) => [nova, ...prev])
      setFormData(emptyForm(user.email))
      setSuccess('Avaliação cadastrada com sucesso.')
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  const formatarData = (dataString) => {
    if (!dataString) return '-'
    const data = new Date(dataString)
    return Number.isNaN(data.getTime()) ? dataString : data.toLocaleString('pt-BR')
  }

  return (
    <>
      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      {isAdmin ? (
        <section className="card">
          <h2>Cadastrar avaliação</h2>
          <form onSubmit={handleSubmit} className="form">
            <label>
              Email do avaliador
              <input
                type="email"
                name="emailAvaliador"
                value={formData.emailAvaliador}
                onChange={handleInputChange}
                required
              />
            </label>
            <label>
              Email do avaliado
              <input
                type="email"
                name="emailAvaliado"
                value={formData.emailAvaliado}
                onChange={handleInputChange}
                placeholder="aluno@al.insper.edu.br"
                required
              />
            </label>
            <label>
              Nota (0 a 10)
              <input
                type="number"
                name="nota"
                min="0"
                max="10"
                step="0.1"
                value={formData.nota}
                onChange={handleInputChange}
                required
              />
            </label>
            <label className="full">
              Comentários
              <textarea
                name="comentarios"
                rows="3"
                maxLength="2000"
                value={formData.comentarios}
                onChange={handleInputChange}
              />
            </label>
            <button type="submit" className="btn btn-primary full" disabled={submitting || !token}>
              {submitting ? 'Cadastrando...' : 'Cadastrar avaliação'}
            </button>
          </form>
        </section>
      ) : (
        <p className="muted note">Somente administradores podem cadastrar avaliações.</p>
      )}

      <section className="card">
        <div className="section-title">
          <h2>Avaliações cadastradas</h2>
          <button className="btn" onClick={fetchAvaliacoes} disabled={loading || !token}>
            Atualizar
          </button>
        </div>

        {loading ? (
          <p className="muted">Carregando avaliações...</p>
        ) : avaliacoes.length === 0 ? (
          <p className="muted">Nenhuma avaliação cadastrada ainda.</p>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Avaliador</th>
                  <th>Avaliado</th>
                  <th>Nota</th>
                  <th>Comentários</th>
                  <th>Data</th>
                </tr>
              </thead>
              <tbody>
                {avaliacoes.map((a) => (
                  <tr key={a.id}>
                    <td>{a.id}</td>
                    <td>{a.emailAvaliador}</td>
                    <td>{a.emailAvaliado}</td>
                    <td className="nota">{a.nota}</td>
                    <td>{a.comentarios || '-'}</td>
                    <td>{formatarData(a.dataAvaliacao)}</td>
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
