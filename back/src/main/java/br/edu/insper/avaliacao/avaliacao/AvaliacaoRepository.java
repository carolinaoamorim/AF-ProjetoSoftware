package br.edu.insper.avaliacao.avaliacao;

import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AvaliacaoRepository extends JpaRepository<Avaliacao, Integer> {

    // O Spring monta o SQL pelo nome do método (findBy + Campo + Condição).
    // Exemplos de condição: GreaterThan, LessThan, Between, Containing, IgnoreCase, OrderBy...Desc

    // GET /avaliacoes?emailAvaliado=x  (também usado no cálculo da média)
    List<Avaliacao> findByEmailAvaliado(String emailAvaliado, Sort sort);

    // GET /avaliacoes?notaMin=7
    List<Avaliacao> findByNotaGreaterThanEqual(Double nota, Sort sort);

    // GET /avaliacoes?emailAvaliado=x&notaMin=7
    List<Avaliacao> findByEmailAvaliadoAndNotaGreaterThanEqual(String emailAvaliado, Double nota, Sort sort);
}
