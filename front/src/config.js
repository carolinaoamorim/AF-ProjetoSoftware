// =====================================================================
// CONFIG: tudo que muda entre projetos fica aqui.
// =====================================================================

// Rota do back. O "/api" é trocado pelo endereço da EC2:
//   - local (npm run dev): proxy em vite.config.js
//   - Vercel: rewrites em vercel.json
// Entidade nova? Troque aqui (ex.: '/api/tarefas') e no vercel.json.
export const API = '/api/tarefa'

// Auth0 (Applications > sua SPA > Settings / APIs > Identifier)
export const AUTH0_DOMAIN = 'dev-a3l68wtd82inod7x.us.auth0.com'
export const AUTH0_CLIENT_ID = 'SvHLrX1a3GBKVCfryDxR0CJ662Td1YWJ'
export const AUTH0_AUDIENCE = 'https://af-api'

// Claim onde a Action do Auth0 coloca as roles (tem que ser igual à do back)
export const ROLES_CLAIM = 'https://social-insper.com/roles'
