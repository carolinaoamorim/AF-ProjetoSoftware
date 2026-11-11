import { useAuth0 } from "@auth0/auth0-react";
import React, { useEffect, useState } from "react";
import LogoutButton from "./LogoutButton";

const API_URL = "/api";

export default function Times({ onNavigate }) {
  const { user, isAuthenticated } = useAuth0();
  const [times, setTimes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    nome: "",
    estadio: "",
    cidade: "",
  });
  const [submitting, setSubmitting] = useState(false);

  // Fetch times ao carregar a página
  useEffect(() => {
    fetchTimes();
  }, []);

  const fetchTimes = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await fetch(`${API_URL}/times`);
      if (!response.ok) {
        throw new Error("Erro ao buscar times");
      }
      const data = await response.json();
      setTimes(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.nome || !formData.estadio || !formData.cidade) {
      setError("Todos os campos são obrigatórios");
      return;
    }

    try {
      setSubmitting(true);
      setError("");

      const response = await fetch(`${API_URL}/times`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error("Erro ao criar time");
      }

      const newTime = await response.json();
      setTimes((prev) => [...prev, newTime]);
      setFormData({ nome: "", estadio: "", cidade: "" });
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (!isAuthenticated) {
    return <div>Não autenticado</div>;
  }

  return (
    <div className="min-h-screen p-6 bg-gray-50 font-sans">
      <div className="max-w-4xl mx-auto">
        {/* Navigation Menu */}
        <div className="bg-white rounded-2xl shadow p-4 mb-6">
          <nav className="flex gap-4">
            <button
              onClick={() => onNavigate('home')}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 font-medium"
            >
              Home
            </button>
            <button
              onClick={() => onNavigate('times')}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-medium"
            >
              Times
            </button>
            <button
              onClick={() => onNavigate('partidas')}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 font-medium"
            >
              Partidas
            </button>
          </nav>
        </div>

        {/* Header */}
        <div className="bg-white rounded-2xl shadow p-6 mb-6 flex justify-between items-center">
          <h1 className="text-3xl font-bold">Gerenciar Times</h1>
          <LogoutButton />
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {/* Form Section */}
        <div className="bg-white rounded-2xl shadow p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">Adicionar Novo Time</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="nome" className="block text-sm font-medium text-gray-700 mb-1">
                Nome do Time
              </label>
              <input
                type="text"
                id="nome"
                name="nome"
                value={formData.nome}
                onChange={handleInputChange}
                placeholder="Ex: São Paulo FC"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label htmlFor="estadio" className="block text-sm font-medium text-gray-700 mb-1">
                Estádio
              </label>
              <input
                type="text"
                id="estadio"
                name="estadio"
                value={formData.estadio}
                onChange={handleInputChange}
                placeholder="Ex: Morumbi"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label htmlFor="cidade" className="block text-sm font-medium text-gray-700 mb-1">
                Cidade
              </label>
              <input
                type="text"
                id="cidade"
                name="cidade"
                value={formData.cidade}
                onChange={handleInputChange}
                placeholder="Ex: São Paulo"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 disabled:bg-gray-400 font-medium"
            >
              {submitting ? "Adicionando..." : "Adicionar Time"}
            </button>
          </form>
        </div>

        {/* Times List Section */}
        <div className="bg-white rounded-2xl shadow p-6">
          <h2 className="text-xl font-bold mb-4">Times Cadastrados</h2>

          {loading ? (
            <p className="text-gray-600">Carregando times...</p>
          ) : times.length === 0 ? (
            <p className="text-gray-600">Nenhum time cadastrado ainda.</p>
          ) : (
            <div className="grid gap-4">
              {times.map((time) => (
                <div
                  key={time.id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition"
                >
                  <h3 className="text-lg font-semibold text-gray-900">{time.nome}</h3>
                  <p className="text-gray-600">
                    <span className="font-medium">Estádio:</span> {time.estadio}
                  </p>
                  <p className="text-gray-600">
                    <span className="font-medium">Cidade:</span> {time.cidade}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
