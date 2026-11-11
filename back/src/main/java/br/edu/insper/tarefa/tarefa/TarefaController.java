package br.edu.insper.tarefa.tarefa;

import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

// Quem pode chamar cada rota está em WebSecurityConfig
@RestController
@RequestMapping("/tarefa")
public class TarefaController {

    @Autowired
    private TarefaService tarefaService;

    // ADMIN e USER: /tarefa/media?email=x
    // (fica antes do /{id} só por leitura; o Spring sempre prefere a rota fixa)

    // ADMIN e USER: 404 se não existir
    @GetMapping
    public List<Tarefa> buscar() {
        return tarefaService.listar();
    }

    // Somente ADMIN
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Tarefa cadastrar(@Valid @RequestBody Tarefa tarefa) {
        return tarefaService.criar(tarefa);
    }

    // Somente ADMIN: 404 se não existir, 204 se excluiu
    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void excluir(@PathVariable Integer id) {
        tarefaService.excluir(id);
    }
}
