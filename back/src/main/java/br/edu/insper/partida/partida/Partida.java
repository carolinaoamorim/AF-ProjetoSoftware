package br.edu.insper.partida.partida;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Getter
@Setter
public class Partida {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;
    private String estadio;
    private String idMandante;
    private String idVisitante;
    private LocalDateTime dataPartida;
    private String nomeMandate;
    private String nomeVisitate;
    private Integer golsMandante;
    private Integer golsVisitante;
}
