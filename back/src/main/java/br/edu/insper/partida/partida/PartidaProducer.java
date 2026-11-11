package br.edu.insper.partida.partida;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

@Service
public class PartidaProducer {

    private static final Logger logger = LoggerFactory.getLogger(PartidaProducer.class);
    private static final String QUEUE_NAME = "partidas";
    private static final Integer[] VALID_PONTOS = {0, 1, 3};

    @Autowired
    private org.springframework.data.redis.core.StringRedisTemplate stringRedisTemplate;

    @Autowired
    private ObjectMapper objectMapper;

    public void enviarPartida(String timeId, Integer pontos, Integer golsFeitos, Integer golsLevados) {
        try {
            validar(timeId, pontos, golsFeitos, golsLevados);

            PartidaQueueMessage mensagem = new PartidaQueueMessage(
                    timeId,
                    pontos,
                    golsFeitos,
                    golsLevados
            );

            String json = objectMapper.writeValueAsString(mensagem);
            stringRedisTemplate.opsForList().rightPush(QUEUE_NAME, json);

            logger.info("Partida enviada para fila: {} -> {}", QUEUE_NAME, json);
        } catch (IllegalArgumentException e) {
            logger.error("Validação falhou: {}", e.getMessage());
            throw e;
        } catch (Exception e) {
            logger.error("Erro ao enviar partida para Redis", e);
            throw new RuntimeException("Erro ao enviar partida para fila Redis", e);
        }
    }

    private void validar(String timeId, Integer pontos, Integer golsFeitos, Integer golsLevados) {
        if (timeId == null || timeId.trim().isEmpty()) {
            throw new IllegalArgumentException("time_id não pode ser nulo ou vazio");
        }

        if (!isValidObjectId(timeId)) {
            throw new IllegalArgumentException("time_id deve ser um ObjectId válido de MongoDB");
        }

        if (pontos == null || !isPontosValido(pontos)) {
            throw new IllegalArgumentException("pontos deve ser 0, 1 ou 3");
        }

        if (golsFeitos == null || golsFeitos < 0) {
            throw new IllegalArgumentException("gols_feitos deve ser um número inteiro >= 0");
        }

        if (golsLevados == null || golsLevados < 0) {
            throw new IllegalArgumentException("gols_levados deve ser um número inteiro >= 0");
        }
    }

    private boolean isValidObjectId(String objectId) {
        return objectId.matches("^[0-9a-f]{24}$");
    }

    private boolean isPontosValido(Integer pontos) {
        for (Integer p : VALID_PONTOS) {
            if (p.equals(pontos)) {
                return true;
            }
        }
        return false;
    }
}
