// =====================================================================
// APP: login, cabeçalho e troca de página.
//
//   [1] TOKEN E ROLES   pega o token do Auth0 e lê as roles de dentro dele
//   [2] NÃO LOGADO      tela com o botão de entrar
//   [3] LOGADO          cabeçalho (menu, email, roles, sair) + página atual
//
// Página nova: crie o arquivo (copie Perfil.jsx), importe aqui,
// adicione um botão no <nav> e uma linha no final, como as que já existem.
// =====================================================================
import { useEffect, useState } from 'react'
import { useAuth0 } from '@auth0/auth0-react'
import { ROLES_CLAIM } from './config'
import Tarefa from './Tarefa'
import Perfil from './Perfil'
import './App.css'

export default function App() {
  const { user, isAuthenticated, isLoading, loginWithRedirect, logout, getAccessTokenSilently } =
    useAuth0()
  const [token, setToken] = useState('')
  const [roles, setRoles] = useState([])
  const [pagina, setPagina] = useState('tarefa') // 'tarefa' | 'perfil'

  // ---------------------------------------------------------------
  // [1] TOKEN E ROLES
  // ---------------------------------------------------------------
  useEffect(() => {
    if (!isAuthenticated) return
    getAccessTokenSilently().then((t) => {
      setToken(t)
      // O token é "cabeçalho.CONTEUDO.assinatura": o conteúdo é JSON em base64
      const conteudo = JSON.parse(atob(t.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')))
      setRoles(conteudo[ROLES_CLAIM] || [])
    })
  }, [isAuthenticated, getAccessTokenSilently])

  // Atalhos de permissão (use nas telas com {admin && (...)})
  const admin = roles.includes('ADMIN')

  if (isLoading) return <p className="centro">Carregando...</p>

  // ---------------------------------------------------------------
  // [2] NÃO LOGADO
  // ---------------------------------------------------------------
  if (!isAuthenticated) {
    return (
      <div className="centro">
        <div className="card">
          <h1>Tarefas</h1>
          <p>Entre com sua conta para continuar.</p>
          <button className="primario" onClick={() => loginWithRedirect()}>
            Entrar
          </button>
        </div>
      </div>
    )
  }

  if (!token) return <p className="centro">Carregando token...</p>

  // ---------------------------------------------------------------
  // [3] LOGADO
  // ---------------------------------------------------------------
  return (
    <div className="pagina">
      <header className="card linha">
        <nav className="linha">
          <button onClick={() => setPagina('tarefa')}>Tarefa</button>
          <button onClick={() => setPagina('perfil')}>Perfil</button>
        </nav>
        <div className="linha">
          <span>{user.email}</span>
          {roles.map((r) => (
            <span key={r} className="role">{r}</span>
          ))}
          <button onClick={() => logout({ logoutParams: { returnTo: window.location.origin } })}>
            Sair
          </button>
        </div>
      </header>

      {pagina === 'tarefa' && <Tarefa token={token} admin={admin} />}
      {pagina === 'perfil' && <Perfil user={user} token={token} roles={roles} />}
    </div>
  )
}
