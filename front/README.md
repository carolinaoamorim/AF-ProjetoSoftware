# Front-end de Avaliações (React + Vite + Auth0)

```bash
npm install
npm run dev     # http://localhost:5173 (o /api vai para a EC2 pelo proxy do vite.config.js)
```

Push na `main` publica sozinho na Vercel.

## Mapa

| Arquivo | Mexer quando |
|---|---|
| `src/config.js` | rota do back (`API`), dados do Auth0, claim das roles |
| `src/api.js` | quase nunca: `chamar(token, caminho, metodo, corpo)` faz toda chamada ao back e trata os erros |
| `src/App.jsx` | login, cabeçalho, menu de páginas, `admin` (quem tem a role ADMIN) |
| `src/Avaliacoes.jsx` | a tela: form, média, filtros, tabela, editar, excluir |
| `src/Perfil.jsx` | mostra email, roles e o token (para curl / jwt.io) |
| `src/App.css` | estilos (poucas classes: `card`, `linha`, `form`, `primario`, `erro`) |
| `vercel.json` / `vite.config.js` | só se a rota ou o IP da EC2 mudar |

Cada arquivo tem um índice no topo com seções numeradas (`[1]`, `[2]`...): use Ctrl+F pelo número.

## Trocar a entidade (ex.: Tarefa em /tarefas)

1. `config.js`: `API = '/api/tarefas'`.
2. `vercel.json`: trocar `avaliacoes` por `tarefas` nas duas regras.
3. `Avaliacoes.jsx`:
   - `[1] VAZIO`: os campos novos (mesmo nome da entidade no back).
   - `[3] editar()`: os mesmos campos.
   - `[4.1]`: um `<input name="campo">` por campo (número: `type="number"`, data: `type="date"`, texto longo: `<textarea>`). Campo numérico também no `Number(...)` do `salvar()`.
   - `[4.3]`: um `<th>` e um `<td>` por campo.
   - Apague a seção `[4.2]` (média) e os filtros se o enunciado não pedir.

## Receitas

| Pedido | Onde |
|---|---|
| Só ADMIN vê | `{admin && (...)}` |
| Só USER vê | em `App.jsx`, `const user_ = roles.includes('USER')`, passe para a tela como `admin` |
| Botão para outra rota do back | uma função em `[3]` com `tentar(async () => { ... await chamar(token, '/rota') ... })` |
| Campo calculado na tabela | `<td>{item.nota >= 7 ? 'Aprovado' : 'Reprovado'}</td>` |
| Página nova | copie `Perfil.jsx`, importe em `App.jsx`, botão no `<nav>` e uma linha `{pagina === 'x' && <X />}` |
