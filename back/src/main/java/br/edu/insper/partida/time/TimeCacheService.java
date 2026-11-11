package br.edu.insper.partida.time;

import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

@Service
public class TimeCacheService {

    private final Map<String, TimeResponseDTO> cache = new HashMap<>();

    public TimeResponseDTO obterDoCache(String idTime) {
        return cache.get(idTime);
    }

    public void armazenarNoCache(String idTime, TimeResponseDTO timeData) {
        cache.put(idTime, timeData);
    }

    public boolean contemNoCache(String idTime) {
        return cache.containsKey(idTime);
    }

    public void limparCache() {
        cache.clear();
    }
}
