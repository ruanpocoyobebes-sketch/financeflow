import { FaTrash, FaEdit } from "react-icons/fa";
import { useFinance } from "../context/FinanceContext";
import { useSettings } from "../context/SettingsContext";

function TransactionList({
  transacoes,
  abrirEdicao,
  dataInicial,
  dataFinal,
}) {
  const {
    removerReceita,
    removerDespesa,
    removerInvestimento,
  } = useFinance();

  const { formatarMoeda } = useSettings();

  function converterData(data) {
    if (!data) return null;

    if (data.includes("/")) {
      const [dia, mes, ano] = data.split("/");

      return new Date(
        Number(ano),
        Number(mes) - 1,
        Number(dia)
      );
    }

    return new Date(data);
  }

  const transacoesFiltradas = transacoes.filter(
    (item) => {
      if (!dataInicial && !dataFinal) {
        return true;
      }

      const dataTransacao = converterData(item.data);

      if (!dataTransacao) {
        return false;
      }

      if (dataInicial) {
        const inicio = new Date(
          `${dataInicial}T00:00:00`
        );

        if (dataTransacao < inicio) {
          return false;
        }
      }

      if (dataFinal) {
        const fim = new Date(
          `${dataFinal}T23:59:59`
        );

        if (dataTransacao > fim) {
          return false;
        }
      }

      return true;
    }
  );

  function excluir(item) {
    const confirmou = window.confirm(
      `Deseja excluir "${item.descricao}"?`
    );

    if (!confirmou) return;

    switch (item.tipo) {
      case "Receita":
        removerReceita(item.id);
        break;

      case "Despesa":
        removerDespesa(item.id);
        break;

      case "Investimento":
        removerInvestimento(item.id);
        break;

      default:
        alert("Tipo de transação inválido.");
        break;
    }
  }

  function obterCorTipo(tipo) {
    switch (tipo) {
      case "Receita":
        return "#22C55E";

      case "Despesa":
        return "#EF4444";

      case "Investimento":
        return "#3B82F6";

      default:
        return "#CBD5E1";
    }
  }

  function obterCorCategoria(tipo) {
    switch (tipo) {
      case "Receita":
        return {
          background: "rgba(34, 197, 94, 0.12)",
          color: "#86EFAC",
          border: "1px solid rgba(34, 197, 94, 0.28)",
        };

      case "Despesa":
        return {
          background: "rgba(239, 68, 68, 0.12)",
          color: "#FCA5A5",
          border: "1px solid rgba(239, 68, 68, 0.28)",
        };

      case "Investimento":
        return {
          background: "rgba(59, 130, 246, 0.12)",
          color: "#93C5FD",
          border: "1px solid rgba(59, 130, 246, 0.28)",
        };

      default:
        return {
          background: "rgba(148, 163, 184, 0.12)",
          color: "#CBD5E1",
          border: "1px solid rgba(148, 163, 184, 0.28)",
        };
    }
  }

  return (
    <div
      style={{
        background: "#1E293B",
        borderRadius: 14,
        padding: 20,
        border: "1px solid #334155",
        overflowX: "auto",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
          marginBottom: 16,
        }}
      >
        <div>
          <h2
            style={{
              color: "white",
              marginTop: 0,
              marginBottom: 4,
            }}
          >
            Últimas transações
          </h2>

          <p
            style={{
              color: "#94A3B8",
              margin: 0,
              fontSize: 14,
            }}
          >
            {transacoesFiltradas.length} movimentação
            {transacoesFiltradas.length === 1 ? "" : "ões"}
          </p>
        </div>
      </div>

      {transacoesFiltradas.length === 0 ? (
        <div
          style={{
            minHeight: 150,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            border: "1px dashed #475569",
            borderRadius: 10,
            padding: 20,
          }}
        >
          <p
            style={{
              color: "#94A3B8",
              margin: 0,
              textAlign: "center",
            }}
          >
            Nenhuma transação encontrada.
          </p>
        </div>
      ) : (
        <table
          style={{
            width: "100%",
            minWidth: 820,
            borderCollapse: "collapse",
            color: "white",
          }}
        >
          <thead>
            <tr>
              <th style={th}>Tipo</th>
              <th style={th}>Descrição</th>
              <th style={th}>Categoria</th>
              <th style={th}>Data</th>
              <th style={th}>Valor</th>
              <th style={th}>Ações</th>
            </tr>
          </thead>

          <tbody>
            {transacoesFiltradas.map((item) => {
              const corTipo = obterCorTipo(item.tipo);
              const estiloCategoria =
                obterCorCategoria(item.tipo);

              return (
                <tr
                  key={item.id}
                  style={{
                    borderTop: "1px solid #334155",
                  }}
                >
                  <td style={td}>
                    <span
                      style={{
                        color: corTipo,
                        fontWeight: 700,
                      }}
                    >
                      {item.tipo}
                    </span>
                  </td>

                  <td style={td}>
                    <div
                      style={{
                        color: "#F8FAFC",
                        fontWeight: 600,
                      }}
                    >
                      {item.descricao}
                    </div>
                  </td>

                  <td style={td}>
                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        padding: "6px 10px",
                        borderRadius: 999,
                        fontSize: 13,
                        fontWeight: 600,
                        whiteSpace: "nowrap",
                        ...estiloCategoria,
                      }}
                    >
                      {item.categoria || "Outros"}
                    </span>
                  </td>

                  <td
                    style={{
                      ...td,
                      color: "#CBD5E1",
                    }}
                  >
                    {item.data}
                  </td>

                  <td
                    style={{
                      ...td,
                      fontWeight: "bold",
                      color: corTipo,
                      whiteSpace: "nowrap",
                    }}
                  >
                    {item.tipo === "Receita" ? "+" : "-"}{" "}
                    {formatarMoeda(item.valor)}
                  </td>

                  <td style={td}>
                    <div
                      style={{
                        display: "flex",
                        gap: 8,
                      }}
                    >
                      <button
                        type="button"
                        onClick={() => abrirEdicao(item)}
                        style={botaoEditar}
                        title="Editar transação"
                        aria-label={`Editar ${item.descricao}`}
                      >
                        <FaEdit />
                      </button>

                      <button
                        type="button"
                        onClick={() => excluir(item)}
                        style={botaoExcluir}
                        title="Excluir transação"
                        aria-label={`Excluir ${item.descricao}`}
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
}

const th = {
  textAlign: "left",
  padding: "0 14px 12px 0",
  color: "#94A3B8",
  fontSize: 13,
  fontWeight: 700,
  whiteSpace: "nowrap",
};

const td = {
  padding: "15px 14px 15px 0",
  verticalAlign: "middle",
};

const botaoBase = {
  width: 36,
  height: 36,
  border: "none",
  borderRadius: 8,
  color: "white",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: 14,
};

const botaoEditar = {
  ...botaoBase,
  background: "#3B82F6",
};

const botaoExcluir = {
  ...botaoBase,
  background: "#EF4444",
};

export default TransactionList;