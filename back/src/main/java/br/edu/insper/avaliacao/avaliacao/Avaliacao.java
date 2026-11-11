package br.edu.insper.avaliacao.avaliacao;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Getter
@Setter
public class Avaliacao {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @NotBlank(message = "email do avaliador é obrigatório")
    @Email(message = "email do avaliador inválido")
    private String emailAvaliador;

    @NotBlank(message = "email do avaliado é obrigatório")
    @Email(message = "email do avaliado inválido")
    private String emailAvaliado;

    @Column(length = 2000)
    private String comentarios;

    @NotNull(message = "nota é obrigatória")
    @DecimalMin(value = "0.0", message = "nota deve ser no mínimo 0")
    @DecimalMax(value = "10.0", message = "nota deve ser no máximo 10")
    private Double nota;

    private LocalDateTime dataAvaliacao;
}
