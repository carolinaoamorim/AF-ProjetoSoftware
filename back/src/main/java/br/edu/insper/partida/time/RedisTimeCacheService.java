package br.edu.insper.partida.time;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.util.concurrent.TimeUnit;

@Service
public class RedisTimeCacheService {

    @Autowired
    private RedisTemplate<String, Object> redisTemplate;

    private static final String CACHE_PREFIX = "time:";
    private static final long CACHE_TTL = 24; // 24 horas

    public TimeResponseDTO obterDoCache(String idTime) {
        try {
            Object cachedValue = redisTemplate.opsForValue().get(CACHE_PREFIX + idTime);
            if (cachedValue instanceof TimeResponseDTO) {
                return (TimeResponseDTO) cachedValue;
            }
            return null;
        } catch (Exception e) {
            return null;
        }
    }

    public void armazenarNoCache(String idTime, TimeResponseDTO timeData) {
        try {
            redisTemplate.opsForValue().set(
                CACHE_PREFIX + idTime,
                timeData,
                CACHE_TTL,
                TimeUnit.HOURS
            );
        } catch (Exception e) {
            // Log error, but don't break the flow
            System.err.println("Erro ao armazenar no Redis: " + e.getMessage());
        }
    }

    public boolean contemNoCache(String idTime) {
        try {
            return Boolean.TRUE.equals(redisTemplate.hasKey(CACHE_PREFIX + idTime));
        } catch (Exception e) {
            return false;
        }
    }

    public void limparCache() {
        try {
            redisTemplate.keys(CACHE_PREFIX + "*").forEach(key ->
                redisTemplate.delete(key)
            );
        } catch (Exception e) {
            System.err.println("Erro ao limpar cache do Redis: " + e.getMessage());
        }
    }
}
