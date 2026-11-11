package br.edu.insper.avaliacao.avaliacao;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class AvaliacaoService {

    @Autowired
    private AvaliacaoRepository avaliacaoRepository;

    public List<Avaliacao> listarTodas() {
        return avaliacaoRepository.findAll(Sort.by(Sort.Direction.DESC, "dataAvaliacao"));
    }

    public Avaliacao criar(Avaliacao avaliacao) {
        avaliacao.setId(null);
        // A data da avaliação é sempre definida pelo servidor no momento do cadastro
        avaliacao.setDataAvaliacao(LocalDateTime.now());
        return avaliacaoRepository.save(avaliacao);
    }
}
