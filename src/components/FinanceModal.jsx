import { useEffect, useState } from "react";
import { useFinance } from "../context/FinanceContext";

const categoriasPorTipo = {
  Receita: [
    "Salário",
    "Freelance",
    "Vendas",
    "Rendimentos",
    "Presente",
    "Reembolso",
    "Outros",
  ],

  Despesa: [
    "Alimentação",
    "Transporte",
    "Moradia",
    "Saúde",
    "Educação",
    "Lazer",
    "Compras",
    "Contas",
    "Assinaturas",
    "Outros",
  ],

  Investimento: [
    "Renda Fixa",
    "Ações",
    "Fundos",
    "Criptomoedas",
    "Reserva de Emergência",
    "Previdência",
    "Outros",
  ],
};

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
  const [categoria, setCategoria] = useState("Salário");
  const [valor, setValor] = useState("");

  useEffect(() => {
    if (transacaoEditando) {
      const tipoDaTransacao =
        transacaoEditando.tipo || "Receita";

      setTipo(tipoDaTransacao);
      setDescricao(
        transacaoEditando.descricao || ""
      );
      setValor(
        transacaoEditando.valor || ""
      );

      setCategoria(
        transacaoEditando.categoria ||
          categoriasPorTipo[tipoDaTransacao]?.[0] ||
          "Outros"
      );
    } else {
      limparFormulario();
    }
  }, [transacaoEditando, aberto]);

  function limparFormulario() {
    setTipo("Receita");
    setDescricao("");
    setCategoria("Salário");
    setValor("");
  }

  function mudarTipo(novoTipo) {
    setTipo(novoTipo);

    const primeiraCategoria =
      categoriasPorTipo[novoTipo]?.[0] ||
      "Outros";

    setCategoria(primeiraCategoria);
  }

  function fecharModal() {
    limparFormulario();
    fechar();
  }

  if (!aberto) return null;

  function salvar() {
    const descricaoFormatada =
      descricao.trim();

    const valorNumerico =
      Number(valor);

    if (!descricaoFormatada) {
      alert("Digite uma descrição.");
      return;
    }

    if (!categoria) {
      alert("Selecione uma categoria.");
      return;
    }

    if (
      !valor ||
      Number.isNaN(valorNumerico) ||
      valorNumerico <= 0
    ) {
      alert("Digite um valor válido.");
      return;
    }

    const dados = {
      descricao: descricaoFormatada,
      categoria,
      valor: valorNumerico,
    };

    if (transacaoEditando) {
      switch (transacaoEditando.tipo) {
        case "Receita":
          editarReceita(
            transacaoEditando.id,
            dados
          );
          break;

        case "Despesa":
          editarDespesa(
            transacaoEditando.id,
            dados
          );
          break;

        case "Investimento":
          editarInvestimento(
            transacaoEditando.id,
            dados
          );
          break;

        default:
          alert(
            "Tipo de transação inválido."
          );
          return;
      }

      fecharModal();
      return;
    }

    switch (tipo) {
      case "Receita":
        adicionarReceita(
          descricaoFormatada,
          valorNumerico,
          categoria
        );
        break;

      case "Despesa":
        adicionarDespesa(
          descricaoFormatada,
          valorNumerico,
          categoria
        );
        break;

      case "Investimento":
        adicionarInvestimento(
          descricaoFormatada,
          valorNumerico,
          categoria
        );
        break;

      default:
        alert("Tipo de transação inválido.");
        return;
    }

    fecharModal();
  }

  return (
    <div
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          fecharModal();
        }
      }}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0, 0, 0, 0.68)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
        zIndex: 999,
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 420,
          background: "#1E293B",
          borderRadius: 14,
          padding: 24,
          border: "1px solid #334155",
          boxShadow:
            "0 20px 50px rgba(0, 0, 0, 0.4)",
        }}
      >
        <h2
          style={{
            color: "white",
            marginTop: 0,
            marginBottom: 6,
          }}
        >
          {transacaoEditando
            ? "Editar transação"
            : "Nova transação"}
        </h2>

        <p
          style={{
            color: "#94A3B8",
            marginTop: 0,
            marginBottom: 18,
            fontSize: 14,
          }}
        >
          Informe os dados da movimentação.
        </p>

        <label style={label}>
          Tipo
        </label>

        <select
          value={tipo}
          disabled={!!transacaoEditando}
          onChange={(event) =>
            mudarTipo(event.target.value)
          }
          style={{
            ...input,
            opacity: transacaoEditando
              ? 0.65
              : 1,
            cursor: transacaoEditando
              ? "not-allowed"
              : "pointer",
          }}
        >
          <option value="Receita">
            Receita
          </option>

          <option value="Despesa">
            Despesa
          </option>

          <option value="Investimento">
            Investimento
          </option>
        </select>

        <label style={label}>
          Descrição
        </label>

        <input
          style={input}
          type="text"
          placeholder="Ex.: Salário de julho"
          value={descricao}
          onChange={(event) =>
            setDescricao(event.target.value)
          }
          maxLength={60}
        />

        <label style={label}>
          Categoria
        </label>

        <select
          value={categoria}
          onChange={(event) =>
            setCategoria(event.target.value)
          }
          style={{
            ...input,
            cursor: "pointer",
          }}
        >
          {categoriasPorTipo[tipo].map(
            (item) => (
              <option
                key={item}
                value={item}
              >
                {item}
              </option>
            )
          )}
        </select>

        <label style={label}>
          Valor
        </label>

        <input
          style={input}
          type="number"
          placeholder="0,00"
          value={valor}
          min="0"
          step="0.01"
          onChange={(event) =>
            setValor(event.target.value)
          }
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              salvar();
            }
          }}
        />

        <div
          style={{
            display: "flex",
            gap: 10,
            marginTop: 22,
          }}
        >
          <button
            type="button"
            onClick={salvar}
            style={{
              ...button,
              background: "#22C55E",
            }}
          >
            {transacaoEditando
              ? "Salvar alterações"
              : "Adicionar"}
          </button>

          <button
            type="button"
            onClick={fecharModal}
            style={{
              ...button,
              background: "#EF4444",
            }}
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}

const label = {
  display: "block",
  color: "#CBD5E1",
  fontSize: 14,
  fontWeight: 600,
  marginTop: 14,
  marginBottom: 6,
};

const input = {
  width: "100%",
  padding: "12px",
  borderRadius: "8px",
  border: "1px solid #334155",
  background: "#0F172A",
  color: "white",
  fontSize: "15px",
  outline: "none",
  boxSizing: "border-box",
};

const button = {
  flex: 1,
  padding: 12,
  color: "white",
  border: "none",
  borderRadius: 8,
  cursor: "pointer",
  fontWeight: "bold",
  fontSize: 15,
};

export default FinanceModal;