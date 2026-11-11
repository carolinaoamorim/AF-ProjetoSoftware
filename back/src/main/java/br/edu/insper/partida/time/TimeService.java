package br.edu.insper.partida.time;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.math.BigDecimal;
import java.time.LocalDate;

@Service
public class TimeService {

    @Value("${time.app.url}")
    private String timeUrl;

    public TimeResponseDTO getTime(String idTime) {
        RestClient restClient = RestClient.builder().build();

        return restClient.get()
                .uri(timeUrl + "/times/" + idTime)
                .retrieve()
                .body(TimeResponseDTO.class);

    }
}
