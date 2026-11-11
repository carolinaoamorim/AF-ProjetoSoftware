package br.edu.insper.avaliacao.avaliacao;

import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/avaliacoes")
public class AvaliacaoController {

    @Autowired
    private AvaliacaoService avaliacaoService;

    // ADMIN e USER (regra definida em WebSecurityConfig)
    @GetMapping
    public List<Avaliacao> listar() {
        return avaliacaoService.listarTodas();
    }

    // Somente ADMIN (regra definida em WebSecurityConfig)
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Avaliacao cadastrar(@Valid @RequestBody Avaliacao avaliacao) {
        return avaliacaoService.criar(avaliacao);
    }
}
