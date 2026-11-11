package br.edu.insper.tarefa.tarefa;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class TarefaService {

    @Autowired
    private TarefaRepository tarefaRepository;


    // 404 se não existir
    public List<Tarefa> listar() {
        return tarefaRepository.findAll();
    }

    public Tarefa criar(Tarefa tarefa) {
        tarefa.setId(null);
        // tarefa.setTitulo(null);
        // tarefa.setDescricao(null);
        // tarefa.setPrioridade(null);
        // tarefa.setEmailCriador(null);
        
        return tarefaRepository.save(tarefa);
    }

    // 404 se não existir
    public void excluir(Integer id) {
        tarefaRepository.deleteById(id);
    }
}
