package br.edu.insper.partida.partida;

import br.edu.insper.partida.time.TimeResponseDTO;
import br.edu.insper.partida.time.TimeService;
import br.edu.insper.partida.time.TimeCacheService;
import br.edu.insper.partida.time.RedisTimeCacheService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpClientErrorException;

import java.util.List;

@Service
public class PartidaService {

    @Autowired
    private PartidaRepository partidaRepository;

    @Autowired
    private TimeService timeService;

    @Autowired
    private TimeCacheService timeCacheService;

    @Autowired
    private RedisTimeCacheService redisTimeCacheService;

    @Autowired
    private PartidaProducer partidaProducer;

    public List<Partida> listarTodas() {
       // return partidaRepository
       //         .findAll();


         return partidaRepository
               .findAll()
                .stream()
                .map(p -> defineTime(p))
                .toList();
    }

    private Partida defineTime(Partida p) {
        TimeResponseDTO mandante = obterTime(p.getIdMandante());
        TimeResponseDTO visitante = obterTime(p.getIdVisitante());

        p.setNomeMandate(mandante.getNome());
        p.setNomeVisitate(visitante.getNome());
        return p;

    }

    public Partida criar(Partida partida) {
        try {

            TimeResponseDTO mandante = obterTime(partida.getIdMandante());
            TimeResponseDTO visitante = obterTime(partida.getIdVisitante());

            partida.setEstadio(mandante.getEstadio());
            partida.setNomeMandate(mandante.getNome());
            partida.setNomeVisitate(visitante.getNome());

            Partida partidaSalva = partidaRepository.save(partida);

            // Enviar resultado ao Redis automaticamente
            if (partidaSalva.getGolsMandante() != null && partidaSalva.getGolsVisitante() != null) {
                enviarResultadoAoRedis(partidaSalva);
            }

            return partidaSalva;
        } catch (HttpClientErrorException e) {
            throw new RuntimeException("Erro ao buscar dados do time no serviço externo", e);
        }
    }

    public Partida buscarPorId(Integer id) {
        return partidaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException());
    }

    public void registrarResultado(Integer partidaId, PartidaResultadoDTO resultado) {
        Partida partida = buscarPorId(partidaId);
        partida.setGolsMandante(resultado.getGolsMandante());
        partida.setGolsVisitante(resultado.getGolsVisitante());
        partidaRepository.save(partida);
        enviarResultadoAoRedis(partida);
    }

    private void enviarResultadoAoRedis(Partida partida) {
        Integer golsMandante = partida.getGolsMandante();
        Integer golsVisitante = partida.getGolsVisitante();

        // Calcular pontos para mandante
        Integer pontosMandante = calcularPontos(golsMandante, golsVisitante);
        // Calcular pontos para visitante
        Integer pontosVisitante = calcularPontos(golsVisitante, golsMandante);

        // Enviar para fila Redis
        partidaProducer.enviarPartida(
                partida.getIdMandante(),
                pontosMandante,
                golsMandante,
                golsVisitante
        );

        partidaProducer.enviarPartida(
                partida.getIdVisitante(),
                pontosVisitante,
                golsVisitante,
                golsMandante
        );
    }

    private Integer calcularPontos(Integer golsFeitos, Integer golsLevados) {
        if (golsFeitos > golsLevados) {
            return 3; // Vitória
        } else if (golsFeitos.equals(golsLevados)) {
            return 1; // Empate
        } else {
            return 0; // Derrota
        }
    }

    private TimeResponseDTO obterTime(String idTime) {
        // Usando cache em memória (HashMap)
        if (timeCacheService.contemNoCache(idTime)) {
            return timeCacheService.obterDoCache(idTime);
        }

        TimeResponseDTO timeData = timeService.getTime(idTime);
        timeCacheService.armazenarNoCache(idTime, timeData);
        return timeData;
    }
}
