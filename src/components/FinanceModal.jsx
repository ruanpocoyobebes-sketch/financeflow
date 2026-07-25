import { useEffect, useState } from "react";
import { useFinance } from "../context/FinanceContext";
import { useSettings } from "../context/SettingsContext";

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

  const { cores } = useSettings();

  const [tipo, setTipo] = useState("Receita");
  const [descricao, setDescricao] = useState("");
  const [categoria, setCategoria] = useState("Salário");
  const [valor, setValor] = useState("");

  useEffect(() => {
    if (transacaoEditando) {
      const tipoAtual =
        transacaoEditando.tipo || "Receita";

      setTipo(tipoAtual);

      setDescricao(
        transacaoEditando.descricao || ""
      );

      setCategoria(
        transacaoEditando.categoria ||
          categoriasPorTipo[tipoAtual][0]
      );

      setValor(
        transacaoEditando.valor || ""
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

    setCategoria(
      categoriasPorTipo[novoTipo][0]
    );
  }

  function fecharModal() {
    limparFormulario();
    fechar();
  }
    function salvar() {
    const descricaoLimpa = descricao.trim();

    if (!descricaoLimpa) {
      alert("Digite uma descrição.");
      return;
    }

    const valorNumero = Number(valor);

    if (!valorNumero || valorNumero <= 0) {
      alert("Digite um valor válido.");
      return;
    }

    const dados = {
      descricao: descricaoLimpa,
      categoria,
      valor: valorNumero,
      tipo,
    };

    if (transacaoEditando) {
      dados.id = transacaoEditando.id;

      switch (tipo) {
        case "Receita":
          editarReceita(dados);
          break;

        case "Despesa":
          editarDespesa(dados);
          break;

        case "Investimento":
          editarInvestimento(dados);
          break;

        default:
          break;
      }
    } else {
      switch (tipo) {
        case "Receita":
          adicionarReceita(dados);
          break;

        case "Despesa":
          adicionarDespesa(dados);
          break;

        case "Investimento":
          adicionarInvestimento(dados);
          break;

        default:
          break;
      }
    }

    fecharModal();
  }

  if (!aberto) {
    return null;
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
        background: "rgba(15,23,42,.72)",
        backdropFilter: "blur(12px)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: 24,
        zIndex: 9999,
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 500,
          background: cores.painel,
          border: `1px solid ${cores.borda}`,
          borderRadius: 22,
          padding: 30,
          boxShadow: cores.sombra,
        }}
      >
        <div style={{ marginBottom: 25 }}>
          <h2
            style={{
              margin: 0,
              color: cores.texto,
              fontSize: 30,
              fontWeight: 700,
            }}
          >
            {transacaoEditando
              ? "Editar transação"
              : "Nova transação"}
          </h2>

          <p
            style={{
              marginTop: 8,
              marginBottom: 0,
              color: cores.textoSecundario,
              fontSize: 14,
            }}
          >
            Cadastre uma movimentação financeira.
          </p>
        </div>
                <label style={label(cores)}>
          Tipo
        </label>

        <select
          value={tipo}
          disabled={!!transacaoEditando}
          onChange={(e) =>
            mudarTipo(e.target.value)
          }
          style={{
            ...input(cores),
            opacity: transacaoEditando ? 0.65 : 1,
            cursor: transacaoEditando
              ? "not-allowed"
              : "pointer",
          }}
        >
          <option value="Receita">
            💰 Receita
          </option>

          <option value="Despesa">
            💸 Despesa
          </option>

          <option value="Investimento">
            📈 Investimento
          </option>
        </select>

        <label style={label(cores)}>
          Descrição
        </label>

        <input
          type="text"
          value={descricao}
          placeholder="Ex.: Salário de Julho"
          maxLength={60}
          style={input(cores)}
          onChange={(e) =>
            setDescricao(e.target.value)
          }
        />

        <label style={label(cores)}>
          Categoria
        </label>

        <select
          value={categoria}
          style={{
            ...input(cores),
            cursor: "pointer",
          }}
          onChange={(e) =>
            setCategoria(e.target.value)
          }
        >
          {categoriasPorTipo[tipo].map((item) => (
            <option
              key={item}
              value={item}
            >
              {item}
            </option>
          ))}
        </select>

        <label style={label(cores)}>
          Valor
        </label>

        <input
          type="number"
          value={valor}
          min="0"
          step="0.01"
          placeholder="0,00"
          style={input(cores)}
          onChange={(e) =>
            setValor(e.target.value)
          }
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              salvar();
            }
          }}
        />
                <div
          style={{
            display: "flex",
            gap: 14,
            marginTop: 30,
          }}
        >
          <button
            type="button"
            onClick={salvar}
            style={{
              ...button("#22C55E"),
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform =
                "translateY(-2px)";
              e.currentTarget.style.filter =
                "brightness(1.08)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform =
                "translateY(0)";
              e.currentTarget.style.filter =
                "brightness(1)";
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
              ...button("#EF4444"),
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform =
                "translateY(-2px)";
              e.currentTarget.style.filter =
                "brightness(1.08)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform =
                "translateY(0)";
              e.currentTarget.style.filter =
                "brightness(1)";
            }}
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}
const label = (cores) => ({
  display: "block",
  marginTop: 18,
  marginBottom: 8,
  color: cores.texto,
  fontWeight: 600,
  fontSize: 14,
});

const input = (cores) => ({
  width: "100%",
  padding: "14px 16px",
  borderRadius: 14,
  border: `1px solid ${cores.borda}`,
  background: cores.fundoSecundario,
  color: cores.texto,
  fontSize: 15,
  outline: "none",
  boxSizing: "border-box",
  transition: "0.25s",
});

const button = (cor) => ({
  flex: 1,
  padding: "14px",
  background: cor,
  color: "#fff",
  border: "none",
  borderRadius: 14,
  cursor: "pointer",
  fontWeight: 700,
  fontSize: 15,
  transition: "0.25s",
  boxShadow: "0 10px 20px rgba(0,0,0,.18)",
});
export default FinanceModal;