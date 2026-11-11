// =====================================================================
// PERFIL: dados do usuário logado e o token (para testar o back com curl
// ou colar em jwt.io e ver as roles).
// =====================================================================
export default function Perfil({ user, token, roles }) {
  return (
    <section className="card">
      <h2>{user.name}</h2>
      <p>Email: {user.email}</p>
      <p>Roles: {roles.length > 0 ? roles.join(', ') : 'nenhuma (atribua no Auth0)'}</p>

      <h2>Token</h2>
      <code className="token">{token}</code>
    </section>
  )
}
