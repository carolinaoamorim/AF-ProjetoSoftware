package br.edu.insper.tarefa.tarefa;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Entity
@Getter
@Setter
public class Tarefa {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @NotNull(message = "título é obrigatório")
    private String titulo;

    @NotNull(message = "descrição é obrigatória")
    private String descricao;

    @NotNull(message = "prioridade é obrigatória")
    private String prioridade;

    @NotBlank(message = "email é obrigatório")
    @Email(message = "email inválido")
    private String emailCriador;

}
