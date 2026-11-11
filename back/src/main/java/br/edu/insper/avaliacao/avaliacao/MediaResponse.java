package br.edu.insper.avaliacao.avaliacao;

// Resposta do GET /avaliacoes/media?email=x
// Vira JSON: { "email": "...", "quantidade": 3, "media": 8.5 }
public record MediaResponse(String email, long quantidade, Double media) {
}
