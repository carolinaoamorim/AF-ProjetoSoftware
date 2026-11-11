package br.edu.insper.avaliacao.avaliacao;

import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

// Quem pode chamar cada rota está em WebSecurityConfig
@RestController
@RequestMapping("/avaliacoes")
public class AvaliacaoController {

    @Autowired
    private AvaliacaoService avaliacaoService;

    // ADMIN e USER: /avaliacoes, /avaliacoes?emailAvaliado=x, /avaliacoes?notaMin=7 (filtros opcionais)
    @GetMapping
    public List<Avaliacao> listar(@RequestParam(required = false) String emailAvaliado,
                                  @RequestParam(required = false) Double notaMin) {
        return avaliacaoService.listar(emailAvaliado, notaMin);
    }

    // ADMIN e USER: /avaliacoes/media?email=x
    // (fica antes do /{id} só por leitura; o Spring sempre prefere a rota fixa)
    @GetMapping("/media")
    public MediaResponse media(@RequestParam String email) {
        return avaliacaoService.media(email);
    }

    // ADMIN e USER: 404 se não existir
    @GetMapping("/{id}")
    public Avaliacao buscar(@PathVariable Integer id) {
        return avaliacaoService.buscar(id);
    }

    // Somente ADMIN
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Avaliacao cadastrar(@Valid @RequestBody Avaliacao avaliacao) {
        return avaliacaoService.criar(avaliacao);
    }

    // Somente ADMIN: 404 se não existir
    @PutMapping("/{id}")
    public Avaliacao atualizar(@PathVariable Integer id, @Valid @RequestBody Avaliacao avaliacao) {
        return avaliacaoService.atualizar(id, avaliacao);
    }

    // Somente ADMIN: 404 se não existir, 204 se excluiu
    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void excluir(@PathVariable Integer id) {
        avaliacaoService.excluir(id);
    }
}
