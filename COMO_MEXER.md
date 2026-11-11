# Como mexer (receitas para a prova)

O checklist de "trocar a entidade" está no [README.md](README.md). Aqui estão os "a mais" que já estão **implementados** em `avaliacao/`, e como adaptar cada um.

Push na `main`: o back publica sozinho na EC2 (aba Actions) e o front na Vercel.

## Mapa

| Arquivo | O que tem |
|---|---|
| `back/.../avaliacao/Avaliacao.java` | campos e validações (`@NotBlank`, `@Email`, `@Size`, `@PastOrPresent`...) |
| `back/.../avaliacao/AvaliacaoController.java` | rotas (`@GetMapping`, `@RequestParam`, `@PathVariable`) |
| `back/.../avaliacao/AvaliacaoService.java` | regras: data, 404, "não pode avaliar a si mesmo", média |
| `back/.../avaliacao/AvaliacaoRepository.java` | consultas por nome de método (`findBy...`) |
| `back/.../avaliacao/MediaResponse.java` | formato do JSON da média |
| `back/.../config/WebSecurityConfig.java` | quem pode chamar cada rota (tabela de receitas no comentário) |
| `back/src/main/resources/application.properties` | banco, Auth0, mensagens de erro legíveis |
| `front/src/config.js` | rota do back (`API`), Auth0, claim das roles |
| `front/src/api.js` | `chamar(token, caminho, metodo, corpo)`: toda chamada ao back + mensagens de erro |
| `front/src/Avaliacoes.jsx` | form, tabela, editar, excluir, filtros, média (seções `[1]`...`[4]`) |
| `front/vercel.json` | `/api/avaliacoes/:path*` já cobre `/1`, `/media?...` |

## Rotas

| Rota | Quem pode | O que faz |
|---|---|---|
| `GET /avaliacoes` | ADMIN e USER | lista tudo (mais recentes primeiro) |
| `GET /avaliacoes?emailAvaliado=x&notaMin=7` | ADMIN e USER | filtros, os dois opcionais |
| `GET /avaliacoes/media?email=x` | ADMIN e USER | média das notas que `x` recebeu |
| `GET /avaliacoes/{id}` | ADMIN e USER | busca uma, **404** se não existir |
| `POST /avaliacoes` | ADMIN | cadastra; data preenchida pelo back |
| `PUT /avaliacoes/{id}` | ADMIN | edita, **404** se não existir (data não muda) |
| `DELETE /avaliacoes/{id}` | ADMIN | exclui, **404** se não existir, **204** se excluiu |

**Se o enunciado não pedir uma rota, apague o método do controller antes de entregar** (e a linha no `WebSecurityConfig`, se for PUT/DELETE).

## 1. DELETE e PUT com 404

```java
// Service
public Avaliacao buscar(Integer id) {
    return avaliacaoRepository.findById(id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Avaliação " + id + " não encontrada"));
}

public void excluir(Integer id) {
    buscar(id);                        // 404 se não existir
    avaliacaoRepository.deleteById(id);
}

public Avaliacao atualizar(Integer id, Avaliacao dados) {
    Avaliacao existente = buscar(id);  // 404 se não existir
    existente.setNota(dados.getNota()); // copia só os campos editáveis
    ...
    return avaliacaoRepository.save(existente);
}

// Controller
@DeleteMapping("/{id}")
@ResponseStatus(HttpStatus.NO_CONTENT)
public void excluir(@PathVariable Integer id) { avaliacaoService.excluir(id); }

@PutMapping("/{id}")
public Avaliacao atualizar(@PathVariable Integer id, @Valid @RequestBody Avaliacao avaliacao) { ... }
```

No PUT, **não salve o objeto do body direto**: ele vem sem `id` e sem data. Busque o existente e copie os campos.

Permissão (`WebSecurityConfig`), com `/**` para pegar o `{id}`:

```java
.requestMatchers(HttpMethod.PUT, "/avaliacoes/**").hasAuthority("ADMIN")
.requestMatchers(HttpMethod.DELETE, "/avaliacoes/**").hasAuthority("ADMIN")
```

Front (`Avaliacoes.jsx`): botões **Editar** e **Excluir** na última coluna, só para ADMIN (`{admin && ...}`).
- Editar joga a linha no formulário (`editandoId`) e o submit vira `PUT`.
- Excluir: ``chamar(token, `/${id}`, 'DELETE')``. O `api.js` já sabe que o 204 vem sem corpo.

## 2. GET por id com 404

```java
@GetMapping("/{id}")
public Avaliacao buscar(@PathVariable Integer id) {
    return avaliacaoService.buscar(id);   // o mesmo buscar() do item 1
}
```

Já coberto pelo `GET "/avaliacoes/**"` no `WebSecurityConfig`.

## 3. Filtro por parâmetro

```java
// Repository
List<Avaliacao> findByEmailAvaliado(String emailAvaliado, Sort sort);

// Controller: o mesmo GET /avaliacoes, com parâmetro opcional
@GetMapping
public List<Avaliacao> listar(@RequestParam(required = false) String emailAvaliado,
                              @RequestParam(required = false) Double notaMin) {
    return avaliacaoService.listar(emailAvaliado, notaMin);
}

// Service: escolhe o método do repository conforme o que veio
if (emailAvaliado != null && !emailAvaliado.isBlank()) return repository.findByEmailAvaliado(emailAvaliado, sort);
return repository.findAll(sort);
```

Front: campos "Email do avaliado" e "Nota mínima" acima da tabela, que viram `?emailAvaliado=x&notaMin=7`.

Palavras que dá para combinar no nome do método: `GreaterThan`, `GreaterThanEqual`, `LessThan`, `Between`, `Containing` (busca parcial), `IgnoreCase`, `And`, `Or`, `OrderByNotaDesc`. Datas: `findByDataAvaliacaoAfter(LocalDateTime d)`.

Se o parâmetro for obrigatório, tire o `required = false`: sem ele o back responde 400.

## 4. Validação a mais

Na entidade (`Avaliacao.java`), já aplicadas:

```java
@Size(max = 500, message = "comentários devem ter no máximo 500 caracteres")
private String comentarios;

@PastOrPresent(message = "data da avaliação não pode estar no futuro")
private LocalDateTime dataAvaliacao;
```

Só funcionam porque o controller tem `@Valid` antes do `@RequestBody`. Outras:

| Pedido | Anotação |
|---|---|
| Texto obrigatório | `@NotBlank` |
| Número obrigatório | `@NotNull` |
| Tamanho mínimo/máximo | `@Size(min = 3, max = 100)` |
| Faixa de número | `@Min(0) @Max(10)` (inteiro) ou `@DecimalMin("0.0") @DecimalMax("10.0")` |
| Número positivo | `@Positive` / `@PositiveOrZero` |
| Email | `@Email` |
| Data no passado / futuro | `@Past`, `@PastOrPresent`, `@Future`, `@FutureOrPresent` |
| Formato | `@Pattern(regexp = "[A-Z]{3}-\\d{4}")` |

Sempre com `message = "..."`: é o texto que aparece no 400.

Se a data vier do usuário (ex.: `LocalDate dataEntrega`), o front manda `"2026-11-11"` (o `<input type="date">` já entrega nesse formato).

## 5. Regra de negócio com 400

Em `AvaliacaoService.validarRegras` (roda no POST e no PUT):

```java
if (a.getEmailAvaliador().equalsIgnoreCase(a.getEmailAvaliado())) {
    throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Não pode avaliar a si mesmo");
}
```

Outras no mesmo molde:

| Regra | Código |
|---|---|
| Não avaliar a mesma pessoa duas vezes | `if (repository.existsByEmailAvaliadorAndEmailAvaliado(a, b)) throw ... CONFLICT` (declare o `existsBy...` no repository) |
| Nota baixa exige comentário | `if (nota < 5 && (comentarios == null \|\| comentarios.isBlank())) throw ... BAD_REQUEST` |
| Email de domínio específico | `if (!email.endsWith("@insper.edu.br")) throw ... BAD_REQUEST` |

Status úteis: `BAD_REQUEST` (400), `FORBIDDEN` (403), `NOT_FOUND` (404), `CONFLICT` (409).

## 6. Cálculo: média de uma pessoa

```java
// MediaResponse.java: o formato do JSON
public record MediaResponse(String email, long quantidade, Double media) {}

// Service
public MediaResponse media(String email) {
    List<Avaliacao> recebidas = avaliacaoRepository.findByEmailAvaliado(email, MAIS_RECENTES);
    Double media = recebidas.isEmpty() ? null
            : recebidas.stream().mapToDouble(Avaliacao::getNota).average().orElse(0);
    return new MediaResponse(email, recebidas.size(), media);
}

// Controller
@GetMapping("/media")
public MediaResponse media(@RequestParam String email) { return avaliacaoService.media(email); }
```

Resposta: `{"email":"x@x.com","quantidade":3,"media":8.5}`. Sem avaliações: `quantidade: 0`, `media: null`. Se o enunciado pedir 404 nesse caso, troque o `null` por `throw new ResponseStatusException(HttpStatus.NOT_FOUND, ...)`.

Outros cálculos no mesmo molde (troque o `.average()`):

| Pedido | Stream |
|---|---|
| Maior nota | `.mapToDouble(Avaliacao::getNota).max().orElse(0)` |
| Menor nota | `.min().orElse(0)` |
| Soma | `.sum()` |
| Quantas aprovadas (>= 7) | `.filter(a -> a.getNota() >= 7).count()` |

Front: caixa "Média de uma pessoa" acima da tabela.

## Mensagens de erro legíveis

Já no `application.properties`:

```properties
server.error.include-message=always
server.error.include-binding-errors=always
```

- Validação: o 400 traz `errors[].defaultMessage`, ex.: `"nota deve ser no máximo 10"`.
- `ResponseStatusException`: o texto vai em `message`.

O front mostra os dois (função `mensagemDeErro` em `front/src/api.js`).

## Testar com curl

```bash
TOKEN=...   # aba Perfil do front
H="Authorization: Bearer $TOKEN"
URL=http://98.92.208.21:8080/avaliacoes
curl -i $URL/999 -H "$H"                                   # 404
curl -i -X DELETE $URL/999 -H "$H"                         # 404
curl -i "$URL?emailAvaliado=x@x.com" -H "$H"
curl -i "$URL/media?email=x@x.com" -H "$H"
curl -i -X POST $URL -H "$H" -H "Content-Type: application/json" \
  -d '{"emailAvaliador":"a@a.com","emailAvaliado":"a@a.com","nota":8}'   # 400 "Não pode avaliar a si mesmo"
curl -i -X POST $URL -H "$H" -H "Content-Type: application/json" \
  -d '{"emailAvaliador":"a@a.com","emailAvaliado":"b@b.com","nota":11}'  # 400 "nota deve ser no máximo 10"
```

## Erros comuns

| Sintoma | Causa |
|---|---|
| 403 no PUT/DELETE logado como ADMIN | faltou a linha no `WebSecurityConfig`, ou matcher sem `/**` |
| 403 em `/avaliacoes/1` mas não em `/avaliacoes` | matcher só com `"/avaliacoes"`: acrescente `"/avaliacoes/**"` |
| 400 em `/avaliacoes/media` | faltou o `?email=` (parâmetro obrigatório) |
| 400 sem dizer o motivo | faltam `server.error.include-*` no `application.properties`, ou faltou `@Valid` |
| Rota nova dá 404 na Vercel | `vercel.json` sem o `/:path*` para a rota nova |
| Banco reclama de coluna | campo renomeado: `ddl-auto=update` não apaga a coluna antiga. Na EC2, `docker exec -it postgres-aula psql -U usuario auladb` e `DROP TABLE avaliacao;` |
