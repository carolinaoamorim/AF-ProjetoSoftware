import { useAuth0 } from "@auth0/auth0-react";
import React, { useEffect, useState } from "react";
import LogoutButton from "./LogoutButton";

const FLASK_API_URL = "/api";
const SPRING_API_URL = "/api";

export default function Partidas({ onNavigate }) {
  const [partidas, setPartidas] = useState([]);
  const [times, setTimes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [token, setToken] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [formData, setFormData] = useState({
    idMandante: "",
    idVisitante: "",
    dataPartida: "",
  });
  const [submitting, setSubmitting] = useState(false);

  // Fetch times e partidas ao carregar a página
  useEffect(() => {
    fetchTimesAndPartidas();
  }, [token]);


  const {
    user,
    isAuthenticated,
    getAccessTokenSilently
  } = useAuth0();

  useEffect(() => {
    const fetchTokenAndRoles = async () => {
      try {
        const accessToken = await getAccessTokenSilently();
        setToken(accessToken);

        const payload = JSON.parse(atob(accessToken.split(".")[1]));
        const roles = payload["https://social-insper.com/roles"] || [];
        setIsAdmin(roles.includes("ADMIN"));
      } catch (e) {
        console.error("Erro ao buscar token:", e);
      }
    };

    if (isAuthenticated) {
      fetchTokenAndRoles();
    }
  }, [isAuthenticated, getAccessTokenSilently]);

  const fetchTimesAndPartidas = async () => {
    try {
      setLoading(true);
      setError("");

      // Buscar times
      const timesResponse = await fetch(`${FLASK_API_URL}/times`);
      if (!timesResponse.ok) {
        throw new Error("Erro ao buscar times");
      }
      const timesData = await timesResponse.json();
      setTimes(timesData);

      // Buscar partidas
      const partidasResponse = await fetch(`${SPRING_API_URL}/partidas`, {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      if (!partidasResponse.ok) {
        throw new Error("Erro ao buscar partidas");
      }
      const partidasData = await partidasResponse.json();
      setPartidas(partidasData);
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

    if (!formData.idMandante || !formData.idVisitante || !formData.dataPartida) {
      setError("Todos os campos são obrigatórios");
      return;
    }

    if (formData.idMandante === formData.idVisitante) {
      setError("O time mandante e visitante não podem ser o mesmo");
      return;
    }

    try {
      setSubmitting(true);
      setError("");

      // Converter data para formato ISO 8601 com hora
      const dataPartida = new Date(formData.dataPartida).toISOString();

      const response = await fetch(`${SPRING_API_URL}/partidas`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          idMandante: formData.idMandante,
          idVisitante: formData.idVisitante,
          dataPartida: dataPartida,
        }),
      });

      if (!response.ok) {
        throw new Error("Erro ao criar partida");
      }

      const newPartida = await response.json();
      setPartidas((prev) => [...prev, newPartida]);
      setFormData({ idMandante: "", idVisitante: "", dataPartida: "" });
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const getTimeNome = (timeId) => {
    const time = times.find((t) => t.id === timeId);
    return time ? time.nome : "Time não encontrado";
  };

  const formatarData = (dataString) => {
    try {
      const data = new Date(dataString);
      return data.toLocaleString("pt-BR");
    } catch {
      return dataString;
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
              onClick={() => onNavigate("home")}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 font-medium"
            >
              Home
            </button>
            <button
              onClick={() => onNavigate("times")}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 font-medium"
            >
              Times
            </button>
            <button
              onClick={() => onNavigate("partidas")}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-medium"
            >
              Partidas
            </button>
          </nav>
        </div>

        {/* Header */}
        <div className="bg-white rounded-2xl shadow p-6 mb-6 flex justify-between items-center">
          <h1 className="text-3xl font-bold">Gerenciar Partidas</h1>
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
          <h2 className="text-xl font-bold mb-4">Criar Nova Partida</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="idMandante" className="block text-sm font-medium text-gray-700 mb-1">
                Time Mandante
              </label>
              <select
                id="idMandante"
                name="idMandante"
                value={formData.idMandante}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Selecione um time</option>
                {times.map((time) => (
                  <option key={time.id} value={time.id}>
                    {time.nome}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="idVisitante" className="block text-sm font-medium text-gray-700 mb-1">
                Time Visitante
              </label>
              <select
                id="idVisitante"
                name="idVisitante"
                value={formData.idVisitante}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Selecione um time</option>
                {times.map((time) => (
                  <option key={time.id} value={time.id}>
                    {time.nome}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="dataPartida" className="block text-sm font-medium text-gray-700 mb-1">
                Data e Hora da Partida
              </label>
              <input
                type="datetime-local"
                id="dataPartida"
                name="dataPartida"
                value={formData.dataPartida}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <button
              type="submit"
              disabled={submitting || times.length === 0}
              className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 disabled:bg-gray-400 font-medium"
            >
              {submitting ? "Criando..." : "Criar Partida"}
            </button>
          </form>
        </div>

        {/* Partidas List Section */}
        <div className="bg-white rounded-2xl shadow p-6">
          <h2 className="text-xl font-bold mb-4">Partidas Cadastradas</h2>

          {loading ? (
            <p className="text-gray-600">Carregando partidas...</p>
          ) : partidas.length === 0 ? (
            <p className="text-gray-600">Nenhuma partida cadastrada ainda.</p>
          ) : (
            <div className="grid gap-4">
              {partidas.map((partida) => (
                <div
                  key={partida.id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {getTimeNome(partida.idMandante)} vs{" "}
                      {getTimeNome(partida.idVisitante)}
                    </h3>
                  </div>
                  <p className="text-gray-600">
                    <span className="font-medium">Data e Hora:</span>{" "}
                    {formatarData(partida.dataPartida)}
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
