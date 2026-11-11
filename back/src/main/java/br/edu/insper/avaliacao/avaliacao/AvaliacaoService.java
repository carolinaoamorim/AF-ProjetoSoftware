package br.edu.insper.avaliacao.avaliacao;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class AvaliacaoService {

    private static final Sort MAIS_RECENTES = Sort.by(Sort.Direction.DESC, "dataAvaliacao");

    @Autowired
    private AvaliacaoRepository avaliacaoRepository;

    // Filtros opcionais: sem nenhum, lista tudo
    public List<Avaliacao> listar(String emailAvaliado, Double notaMin) {
        boolean temEmail = emailAvaliado != null && !emailAvaliado.isBlank();
        boolean temNota = notaMin != null;
        if (temEmail && temNota) {
            return avaliacaoRepository.findByEmailAvaliadoAndNotaGreaterThanEqual(emailAvaliado, notaMin, MAIS_RECENTES);
        }
        if (temEmail) return avaliacaoRepository.findByEmailAvaliado(emailAvaliado, MAIS_RECENTES);
        if (temNota) return avaliacaoRepository.findByNotaGreaterThanEqual(notaMin, MAIS_RECENTES);
        return avaliacaoRepository.findAll(MAIS_RECENTES);
    }

    // Cálculo: média das notas recebidas por uma pessoa (media = null se não tiver nenhuma)
    public MediaResponse media(String email) {
        List<Avaliacao> recebidas = avaliacaoRepository.findByEmailAvaliado(email, MAIS_RECENTES);
        Double media = recebidas.isEmpty() ? null
                : recebidas.stream().mapToDouble(Avaliacao::getNota).average().orElse(0);
        return new MediaResponse(email, recebidas.size(), media);
    }

    // 404 se não existir
    public Avaliacao buscar(Integer id) {
        return avaliacaoRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Avaliação " + id + " não encontrada"));
    }

    public Avaliacao criar(Avaliacao avaliacao) {
        avaliacao.setId(null);
        validarRegras(avaliacao);
        // A data da avaliação é sempre definida pelo servidor no momento do cadastro
        avaliacao.setDataAvaliacao(LocalDateTime.now());
        return avaliacaoRepository.save(avaliacao);
    }

    // 404 se não existir. Data não muda na edição.
    public Avaliacao atualizar(Integer id, Avaliacao dados) {
        Avaliacao existente = buscar(id);
        existente.setEmailAvaliador(dados.getEmailAvaliador());
        existente.setEmailAvaliado(dados.getEmailAvaliado());
        existente.setNota(dados.getNota());
        existente.setComentarios(dados.getComentarios());
        validarRegras(existente);
        return avaliacaoRepository.save(existente);
    }

    // 404 se não existir
    public void excluir(Integer id) {
        buscar(id);
        avaliacaoRepository.deleteById(id);
    }

    // Regras de negócio: ResponseStatusException vira 400 com a mensagem no corpo
    private void validarRegras(Avaliacao a) {
        if (a.getEmailAvaliador().equalsIgnoreCase(a.getEmailAvaliado())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Não pode avaliar a si mesmo");
        }
    }
}
