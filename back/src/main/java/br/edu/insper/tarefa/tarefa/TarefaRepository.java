package br.edu.insper.tarefa.tarefa;

import org.springframework.data.jpa.repository.JpaRepository;

public interface TarefaRepository extends JpaRepository<Tarefa, Integer> {

    // O Spring monta o SQL pelo nome do método (findBy + Campo + Condição).
    // Exemplos de condição: GreaterThan, LessThan, Between, Containing, IgnoreCase, OrderBy...Desc

}
