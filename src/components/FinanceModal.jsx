import { useEffect, useState } from "react";
import { useFinance } from "../context/FinanceContext";

function FinanceModal({
  aberto,
  fechar,
  transacaoEditando,
}) {
  const {
    adicionarReceita,
    adicionarDespesa,
    adicionarInvestimento,
    editarReceita,
    editarDespesa,
    editarInvestimento,
  } = useFinance();

  const [tipo, setTipo] = useState("Receita");
  const [descricao, setDescricao] = useState("");
  const [valor, setValor] = useState("");

  useEffect(() => {
    if (transacaoEditando) {
      setTipo(transacaoEditando.tipo);
      setDescricao(transacaoEditando.descricao);
      setValor(transacaoEditando.valor);
    } else {
      setTipo("Receita");
      setDescricao("");
      setValor("");
    }
  }, [transacaoEditando]);

  if (!aberto) return null;

  function salvar() {
    if (!descricao.trim()) {
      alert("Digite uma descrição.");
      return;
    }

    if (!valor || Number(valor) <= 0) {
      alert("Digite um valor válido.");
      return;
    }

    if (transacaoEditando) {
      const dados = {
        descricao,
        valor: Number(valor),
      };

      switch (transacaoEditando.tipo) {
        case "Receita":
          editarReceita(transacaoEditando.id, dados);
          break;

        case "Despesa":
          editarDespesa(transacaoEditando.id, dados);
          break;

        case "Investimento":
          editarInvestimento(
            transacaoEditando.id,
            dados
          );
          break;

        default:
          break;
      }

      fechar();
      return;
    }

    switch (tipo) {
      case "Receita":
        adicionarReceita(
          descricao,
          Number(valor)
        );
        break;

      case "Despesa":
        adicionarDespesa(
          descricao,
          Number(valor)
        );
        break;

      case "Investimento":
        adicionarInvestimento(
          descricao,
          Number(valor)
        );
        break;

      default:
        break;
    }

    setDescricao("");
    setValor("");
    setTipo("Receita");

    fechar();
  }

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,.65)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 999,
      }}
    >
      <div
        style={{
          width: 420,
          background: "#1E293B",
          borderRadius: 14,
          padding: 24,
        }}
      >
        <h2
          style={{
            color: "white",
            marginTop: 0,
          }}
        >
          {transacaoEditando
            ? "Editar Transação"
            : "Nova Transação"}
        </h2>

        <select
          value={tipo}
          disabled={!!transacaoEditando}
          onChange={(e) =>
            setTipo(e.target.value)
          }
          style={input}
        >
          <option>Receita</option>
          <option>Despesa</option>
          <option>Investimento</option>
        </select>

        <input
          style={input}
          placeholder="Descrição"
          value={descricao}
          onChange={(e) =>
            setDescricao(e.target.value)
          }
        />

        <input
          style={input}
          type="number"
          placeholder="Valor"
          value={valor}
          onChange={(e) =>
            setValor(e.target.value)
          }
        />        <div
          style={{
            display: "flex",
            gap: 10,
            marginTop: 20,
          }}
        >
          <button
            onClick={salvar}
            style={{
              flex: 1,
              padding: 12,
              background: "#22C55E",
              color: "white",
              border: "none",
              borderRadius: 8,
              cursor: "pointer",
              fontWeight: "bold",
              fontSize: 15,
            }}
          >
            {transacaoEditando
              ? "Salvar Alterações"
              : "Adicionar"}
          </button>

          <button
            onClick={fechar}
            style={{
              flex: 1,
              padding: 12,
              background: "#EF4444",
              color: "white",
              border: "none",
              borderRadius: 8,
              cursor: "pointer",
              fontWeight: "bold",
              fontSize: 15,
            }}
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}

const input = {
  width: "100%",
  padding: "12px",
  marginTop: "12px",
  borderRadius: "8px",
  border: "1px solid #334155",
  background: "#0F172A",
  color: "white",
  fontSize: "15px",
  outline: "none",
  boxSizing: "border-box",
};

export default FinanceModal;