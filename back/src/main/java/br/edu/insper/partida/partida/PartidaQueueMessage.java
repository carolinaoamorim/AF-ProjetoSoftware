package br.edu.insper.partida.partida;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class PartidaQueueMessage {
    private String time_id;
    private Integer pontos;
    private Integer gols_feitos;
    private Integer gols_levados;
}
