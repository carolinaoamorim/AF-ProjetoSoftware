// =====================================================================
// TELA DE AVALIAÇÕES
//
// Índice (procure pelo número com Ctrl+F):
//   [1] CAMPOS     os campos do formulário  <- trocar na prova
//   [2] ESTADO     o que a tela guarda (lista, form, erro...)
//   [3] AÇÕES      listar, salvar, editar, excluir, calcularMedia
//   [4] TELA       formulário, média, filtros, tabela  <- trocar na prova
//
// Trocar a entidade (ex.: Tarefa):
//   - config.js: API = '/api/tarefas'
//   - [1] VAZIO com os campos novos
//   - [4] um <input name="campo"> por campo no form
//   - [4] um <th> e um <td> por campo na tabela
//
// Quem vê o quê:  só ADMIN -> {admin && (...)}   qualquer logado -> sem condição
// =====================================================================
import { useEffect, useState } from 'react'
import { chamar } from './api'

// ---------------------------------------------------------------
// [1] CAMPOS: o formulário começa assim (o nome tem que ser igual ao da entidade no back)
// ---------------------------------------------------------------
const VAZIO = {
  emailAvaliador: '',
  emailAvaliado: '',
  nota: '',
  comentarios: '',
}

export default function Avaliacoes({ token, admin }) {
  // ---------------------------------------------------------------
  // [2] ESTADO
  // ---------------------------------------------------------------
  const [itens, setItens] = useState([])                // linhas da tabela
  const [form, setForm] = useState(VAZIO)               // o que está digitado no form
  const [editandoId, setEditandoId] = useState(null)    // null = cadastrando, número = editando
  const [filtro, setFiltro] = useState({ emailAvaliado: '', notaMin: '' })
  const [emailMedia, setEmailMedia] = useState('')
  const [media, setMedia] = useState(null)
  const [erro, setErro] = useState('')

  // Carrega a lista quando a tela abre
  useEffect(() => {
    listar()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Atualiza um campo do form. Funciona para qualquer <input name="...">
  function mudar(e) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  // Roda uma ação mostrando o erro do back na tela, se der erro
  async function tentar(acao) {
    setErro('')
    try {
      await acao()
    } catch (e) {
      setErro(e.message)
    }
  }

  // ---------------------------------------------------------------
  // [3] AÇÕES
  // ---------------------------------------------------------------

  // GET /avaliacoes  (com ?emailAvaliado=x&notaMin=7 se tiver filtro)
  function listar() {
    tentar(async () => {
      const params = new URLSearchParams()
      if (filtro.emailAvaliado) params.set('emailAvaliado', filtro.emailAvaliado)
      if (filtro.notaMin !== '') params.set('notaMin', filtro.notaMin)
      const query = params.toString() ? `?${params}` : ''
      setItens(await chamar(token, query))
    })
  }

  // POST /avaliacoes  ou  PUT /avaliacoes/{id}
  function salvar(e) {
    e.preventDefault()
    tentar(async () => {
      const dados = { ...form, nota: Number(form.nota) } // campos numéricos: Number(...)
      if (editandoId === null) {
        await chamar(token, '', 'POST', dados)
      } else {
        await chamar(token, `/${editandoId}`, 'PUT', dados)
      }
      cancelar()
      listar()
    })
  }

  // Joga a linha da tabela no formulário (o botão Salvar vira PUT)
  function editar(item) {
    setEditandoId(item.id)
    setForm({
      emailAvaliador: item.emailAvaliador,
      emailAvaliado: item.emailAvaliado,
      nota: item.nota,
      comentarios: item.comentarios || '',
    })
  }

  function cancelar() {
    setEditandoId(null)
    setForm(VAZIO)
  }

  // DELETE /avaliacoes/{id}
  function excluir(id) {
    if (!confirm(`Excluir a avaliação ${id}?`)) return
    tentar(async () => {
      await chamar(token, `/${id}`, 'DELETE')
      listar()
    })
  }

  // GET /avaliacoes/media?email=x
  function calcularMedia(e) {
    e.preventDefault()
    tentar(async () => {
      setMedia(await chamar(token, `/media?email=${encodeURIComponent(emailMedia)}`))
    })
  }

  // ---------------------------------------------------------------
  // [4] TELA
  // ---------------------------------------------------------------
  return (
    <>
      {erro && <p className="erro">{erro}</p>}

      {/* ----- [4.1] FORMULÁRIO (só ADMIN) ----- */}
      {admin && (
        <section className="card">
          <h2>{editandoId === null ? 'Cadastrar avaliação' : `Editar avaliação ${editandoId}`}</h2>
          <form onSubmit={salvar} className="form">
            <label>
              Email do avaliador
              <input type="email" name="emailAvaliador" value={form.emailAvaliador} onChange={mudar} required />
            </label>
            <label>
              Email do avaliado
              <input type="email" name="emailAvaliado" value={form.emailAvaliado} onChange={mudar} required />
            </label>
            <label>
              Nota (0 a 10)
              <input type="number" name="nota" min="0" max="10" step="0.1" value={form.nota} onChange={mudar} required />
            </label>
            <label>
              Comentários
              <textarea name="comentarios" maxLength="500" value={form.comentarios} onChange={mudar} />
            </label>

            <div className="linha">
              <button type="submit" className="primario">
                {editandoId === null ? 'Cadastrar' : 'Salvar'}
              </button>
              {editandoId !== null && (
                <button type="button" onClick={cancelar}>Cancelar</button>
              )}
            </div>
          </form>
        </section>
      )}

      {/* ----- [4.2] MÉDIA DE UMA PESSOA ----- */}
      <section className="card">
        <h2>Média de uma pessoa</h2>
        <form onSubmit={calcularMedia} className="linha">
          <input type="email" placeholder="email do avaliado" value={emailMedia} onChange={(e) => setEmailMedia(e.target.value)} required />
          <button type="submit">Calcular</button>
          {media && (
            <span>
              {media.quantidade === 0
                ? 'Nenhuma avaliação.'
                : `Média ${media.media.toFixed(2)} em ${media.quantidade} avaliação(ões)`}
            </span>
          )}
        </form>
      </section>

      {/* ----- [4.3] FILTROS + TABELA ----- */}
      <section className="card">
        <h2>Avaliações</h2>

        <div className="linha">
          <input placeholder="email do avaliado" value={filtro.emailAvaliado} onChange={(e) => setFiltro({ ...filtro, emailAvaliado: e.target.value })} />
          <input type="number" placeholder="nota mínima" value={filtro.notaMin} onChange={(e) => setFiltro({ ...filtro, notaMin: e.target.value })} />
          <button onClick={listar}>Filtrar</button>
        </div>

        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Avaliador</th>
              <th>Avaliado</th>
              <th>Nota</th>
              <th>Comentários</th>
              <th>Data</th>
              {admin && <th></th>}
            </tr>
          </thead>
          <tbody>
            {itens.map((item) => (
              <tr key={item.id}>
                <td>{item.id}</td>
                <td>{item.emailAvaliador}</td>
                <td>{item.emailAvaliado}</td>
                <td>{item.nota}</td>
                <td>{item.comentarios}</td>
                <td>{new Date(item.dataAvaliacao).toLocaleString('pt-BR')}</td>
                {/* Botões só para ADMIN */}
                {admin && (
                  <td className="linha">
                    <button onClick={() => editar(item)}>Editar</button>
                    <button onClick={() => excluir(item.id)}>Excluir</button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>

        {itens.length === 0 && <p>Nenhuma avaliação.</p>}
      </section>
    </>
  )
}
