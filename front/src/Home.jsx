export default function Home({ user, token, roles }) {
  return (
    <>
      <section className="card profile">
        {user.picture && <img src={user.picture} alt={user.name} className="avatar" />}
        <div>
          <h1>{user.name}</h1>
          <p className="muted">{user.email}</p>
          <p className="muted">
            Papéis: {roles.length > 0 ? roles.join(', ') : 'nenhum papel atribuído'}
          </p>
        </div>
      </section>

      <section className="card">
        <h2>Token JWT</h2>
        <code className="token">{token || 'Carregando...'}</code>
      </section>
    </>
  )
}
