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
  titulo: '',
  descricao: '',
  prioridade: '',
  emailCriador: '',
}

export default function Tarefa({ token, admin }) {
  // ---------------------------------------------------------------
  // [2] ESTADO
  // ---------------------------------------------------------------
  const [itens, setItens] = useState([])                // linhas da tabela
  const [form, setForm] = useState(VAZIO)               // o que está digitado no form
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

  // GET /tarefa
  function listar() {
    tentar(async () => {
      setItens(await chamar(token))
    })
  }

  //   function listar() {
  //   tentar(async () => {
  //     const params = new URLSearchParams()
  //     if (filtro.emailAvaliado) params.set('emailAvaliado', filtro.emailAvaliado)
  //     if (filtro.notaMin !== '') params.set('notaMin', filtro.notaMin)
  //     const query = params.toString() ? `?${params}` : ''
  //     setItens(await chamar(token, query))
  //   })
  // }


  // POST /tarefa
  function salvar(e) {
    e.preventDefault()
    tentar(async () => {
      const dados = { ...form} // nota: Number(form.nota)
      chamar(token, '', 'POST', dados)

      listar()
    })
  }

  // DELETE /tarefa/{id}
  function excluir(id) {
    if (!confirm(`Excluir a tarefa ${id}?`)) return
    tentar(async () => {
      await chamar(token, `/${id}`, 'DELETE')
      listar()
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
          <h2>{'Cadastrar tarefa'}</h2>
          <form onSubmit={salvar} className="form">
            <label>
              Email do criador
              <input type="email" name="emailCriador" value={form.emailCriador} required />
            </label>
            <label>
              Título
              <input name="titulo" value={form.titulo} required />
            </label>
            <label>
              Descrição
              <input name="descricao" value={form.descricao} required />
            </label>
            <label>
              Prioridade
              <textarea name="prioridade" value={form.prioridade} />
            </label>

            <div className="linha">
              <button type="submit" className="primario">
                'Cadastrar'
              </button>
            </div>
          </form>
        </section>
      )}
    </>
  )
}
