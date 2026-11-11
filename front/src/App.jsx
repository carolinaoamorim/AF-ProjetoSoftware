import './App.css'
import { useEffect, useState } from 'react'
import { useAuth0 } from '@auth0/auth0-react'
import Home from './Home'
import Avaliacoes from './Avaliacoes'
import LoginButton from './LoginButton'
import LogoutButton from './LogoutButton'

const ROLES_CLAIM = 'https://social-insper.com/roles'

function decodeToken(token) {
  try {
    const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')
    return JSON.parse(atob(base64))
  } catch {
    return {}
  }
}

function App() {
  const [currentPage, setCurrentPage] = useState('avaliacoes')
  const [token, setToken] = useState('')
  const [roles, setRoles] = useState([])
  const { user, isAuthenticated, isLoading, getAccessTokenSilently } = useAuth0()

  useEffect(() => {
    if (!isAuthenticated) return
    getAccessTokenSilently()
      .then((accessToken) => {
        setToken(accessToken)
        setRoles(decodeToken(accessToken)[ROLES_CLAIM] || [])
      })
      .catch((e) => console.error('Erro ao buscar token:', e))
  }, [isAuthenticated, getAccessTokenSilently])

  if (isLoading) {
    return <div className="centered">Carregando...</div>
  }

  if (!isAuthenticated) {
    return (
      <div className="centered">
        <div className="card login-card">
          <h1>Avaliações</h1>
          <p className="muted">Entre com sua conta para listar e cadastrar avaliações.</p>
          <LoginButton />
        </div>
      </div>
    )
  }

  const isAdmin = roles.includes('ADMIN')

  return (
    <div className="page">
      <header className="card header">
        <nav className="nav">
          <button
            className={currentPage === 'avaliacoes' ? 'btn btn-primary' : 'btn'}
            onClick={() => setCurrentPage('avaliacoes')}
          >
            Avaliações
          </button>
          <button
            className={currentPage === 'home' ? 'btn btn-primary' : 'btn'}
            onClick={() => setCurrentPage('home')}
          >
            Perfil
          </button>
        </nav>
        <div className="header-user">
          <span className="muted">{user.email}</span>
          {roles.map((r) => (
            <span key={r} className="badge">{r}</span>
          ))}
          <LogoutButton />
        </div>
      </header>

      {currentPage === 'home' && <Home user={user} token={token} roles={roles} />}
      {currentPage === 'avaliacoes' && <Avaliacoes user={user} token={token} isAdmin={isAdmin} />}
    </div>
  )
}

export default App
