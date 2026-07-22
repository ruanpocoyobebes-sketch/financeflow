import { useState } from "react";
import { useFinance } from "../context/FinanceContext";
import Navbar from "../components/Navbar";

function Metas() {
  const {
    metas,
    adicionarMeta,
    adicionarValorMeta,
    removerMeta,
  } = useFinance();

  const [nome, setNome] = useState("");
  const [valorAlvo, setValorAlvo] = useState("");
  const [valorAtual, setValorAtual] = useState("");
  const [prazo, setPrazo] = useState("");

  function criarMeta() {
    if (!nome || !valorAlvo) return;

    adicionarMeta(
      nome,
      valorAlvo,
      valorAtual || 0,
      prazo
    );

    setNome("");
    setValorAlvo("");
    setValorAtual("");
    setPrazo("");
  }

  return (
    <div>
      <Navbar />

      <div
        style={{
          maxWidth: 1000,
          margin: "30px auto",
          color: "white",
        }}
      >
        <h1>Metas Financeiras</h1>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2,1fr)",
            gap: 15,
            marginTop: 25,
          }}
        >
          <input
            placeholder="Nome da meta"
            value={nome}
            onChange={(e) =>
              setNome(e.target.value)
            }
          />

          <input
            type="number"
            placeholder="Valor alvo"
            value={valorAlvo}
            onChange={(e) =>
              setValorAlvo(e.target.value)
            }
          />

          <input
            type="number"
            placeholder="Valor guardado"
            value={valorAtual}
            onChange={(e) =>
              setValorAtual(e.target.value)
            }
          />

          <input
            type="date"
            value={prazo}
            onChange={(e) =>
              setPrazo(e.target.value)
            }
          />
        </div>

        <button
          onClick={criarMeta}
          style={{
            marginTop: 20,
            background: "#22C55E",
            color: "white",
            border: "none",
            padding: "14px 24px",
            borderRadius: 10,
            cursor: "pointer",
            fontWeight: "bold",
          }}
        >
          Criar Meta
        </button>
        <div
          style={{
            marginTop: 40,
            display: "grid",
            gap: 20,
          }}
        >
                  {metas.length === 0 && (
            <div
              style={{
                background: "#1E293B",
                padding: 24,
                borderRadius: 14,
                color: "#94A3B8",
                textAlign: "center",
              }}
            >
              Nenhuma meta criada ainda.
            </div>
          )}

          {metas.map((meta) => {
            const progressoBruto =
              (Number(meta.valorAtual) /
                Number(meta.valorAlvo)) *
              100;

            const progresso = Math.min(
              progressoBruto || 0,
              100
            );

            return (
              <div
                key={meta.id}
                style={{
                  background: "#1E293B",
                  padding: 22,
                  borderRadius: 14,
                  border: "1px solid #334155",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: 15,
                  }}
                >
                  <div>
                    <h2
                      style={{
                        margin: 0,
                        marginBottom: 6,
                      }}
                    >
                      {meta.nome}
                    </h2>

                    <p
                      style={{
                        margin: 0,
                        color: "#94A3B8",
                      }}
                    >
                      R$ {Number(meta.valorAtual).toFixed(2)}
                      {" de "}
                      R$ {Number(meta.valorAlvo).toFixed(2)}
                    </p>
                  </div>

                  <button
                    onClick={() =>
                      removerMeta(meta.id)
                    }
                    style={{
                      background: "#EF4444",
                      color: "white",
                      border: "none",
                      borderRadius: 8,
                      padding: "10px 14px",
                      cursor: "pointer",
                    }}
                  >
                    Excluir
                  </button>
                </div>

                <div
                  style={{
                    width: "100%",
                    height: 14,
                    background: "#334155",
                    borderRadius: 999,
                    overflow: "hidden",
                    marginTop: 20,
                  }}
                >
                  <div
                    style={{
                      width: `${progresso}%`,
                      height: "100%",
                      background: "#22C55E",
                      transition: "0.3s",
                    }}
                  />
                </div>

                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginTop: 10,
                    color: "#CBD5E1",
                  }}
                >
                  <span>
                    {progresso.toFixed(1)}%
                  </span>

                  <span>
                    {meta.prazo
                      ? `Prazo: ${new Date(
                          `${meta.prazo}T00:00:00`
                        ).toLocaleDateString("pt-BR")}`
                      : "Sem prazo"}
                  </span>
                </div>

                <button
                  onClick={() => {
                    const valor = prompt(
                      "Quanto você quer adicionar?"
                    );

                    if (!valor) return;

                    adicionarValorMeta(
                      meta.id,
                      Number(valor)
                    );
                  }}
                  style={{
                    marginTop: 18,
                    background: "#3B82F6",
                    color: "white",
                    border: "none",
                    borderRadius: 8,
                    padding: "10px 16px",
                    cursor: "pointer",
                    fontWeight: "bold",
                  }}
                >
                  + Adicionar valor
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default Metas;