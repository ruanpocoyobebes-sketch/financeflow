import { useMemo, useState } from "react";
import { useFinance } from "../context/FinanceContext";
import { useSettings } from "../context/SettingsContext";
import * as ui from "../styles/theme";

function Despesas() {
  const { despesas = [] } = useFinance();
  const { cores } = useSettings();

  const [busca, setBusca] = useState("");
  const [ordenacao, setOrdenacao] = useState("mais-recentes");

  const formatarMoeda = (valor) => {
    const numero = Number(valor) || 0;

    return numero.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  };

  const converterData = (data) => {
    if (!data) {
      return null;
    }

    const dataNormalizada =
      typeof data === "string" && data.length === 10
        ? `${data}T12:00:00`
        : data;

    const dataConvertida = new Date(dataNormalizada);

    if (Number.isNaN(dataConvertida.getTime())) {
      return null;
    }

    return dataConvertida;
  };

  const formatarData = (data) => {
    const dataConvertida = converterData(data);

    if (!dataConvertida) {
      return data || "Data não informada";
    }

    return dataConvertida.toLocaleDateString("pt-BR");
  };

  const despesasNormalizadas = useMemo(() => {
    return despesas.map((despesa) => ({
      ...despesa,
      valorNumerico: Number(despesa.valor) || 0,
      dataConvertida: converterData(despesa.data),
    }));
  }, [despesas]);

  const totalDespesas = useMemo(() => {
    return despesasNormalizadas.reduce(
      (total, despesa) => total + despesa.valorNumerico,
      0
    );
  }, [despesasNormalizadas]);

  const despesaMedia =
    despesasNormalizadas.length > 0
      ? totalDespesas / despesasNormalizadas.length
      : 0;

  const maiorDespesa = useMemo(() => {
    if (despesasNormalizadas.length === 0) {
      return 0;
    }

    return Math.max(
      ...despesasNormalizadas.map((despesa) => despesa.valorNumerico)
    );
  }, [despesasNormalizadas]);

  const despesasDoMesAtual = useMemo(() => {
    const hoje = new Date();
    const mesAtual = hoje.getMonth();
    const anoAtual = hoje.getFullYear();

    return despesasNormalizadas.filter((despesa) => {
      if (!despesa.dataConvertida) {
        return false;
      }

      return (
        despesa.dataConvertida.getMonth() === mesAtual &&
        despesa.dataConvertida.getFullYear() === anoAtual
      );
    });
  }, [despesasNormalizadas]);

  const totalMesAtual = useMemo(() => {
    return despesasDoMesAtual.reduce(
      (total, despesa) => total + despesa.valorNumerico,
      0
    );
  }, [despesasDoMesAtual]);

  const despesasFiltradas = useMemo(() => {
    const termoBusca = busca.trim().toLowerCase();

    const filtradas = despesasNormalizadas.filter((despesa) => {
      const descricao = String(despesa.descricao || "").toLowerCase();

      return descricao.includes(termoBusca);
    });

    return [...filtradas].sort((a, b) => {
      switch (ordenacao) {
        case "mais-antigas":
          return (
            (a.dataConvertida?.getTime() || 0) -
            (b.dataConvertida?.getTime() || 0)
          );

        case "maior-valor":
          return b.valorNumerico - a.valorNumerico;

        case "menor-valor":
          return a.valorNumerico - b.valorNumerico;

        case "descricao":
          return String(a.descricao || "").localeCompare(
            String(b.descricao || ""),
            "pt-BR"
          );

        case "mais-recentes":
        default:
          return (
            (b.dataConvertida?.getTime() || 0) -
            (a.dataConvertida?.getTime() || 0)
          );
      }
    });
  }, [despesasNormalizadas, busca, ordenacao]);

  const percentualMesAtual =
    totalDespesas > 0 ? (totalMesAtual / totalDespesas) * 100 : 0;

  const estilos = {
    pagina: {
      width: "100%",
      display: "flex",
      flexDirection: "column",
      gap: "24px",
    },

    cabecalho: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "flex-start",
      gap: "16px",
      flexWrap: "wrap",
    },

    titulo: {
      margin: 0,
      fontSize: "30px",
      fontWeight: 800,
      color: cores.texto,
    },

    subtitulo: {
      margin: "8px 0 0",
      color: cores.textoSecundario,
      fontSize: "15px",
      lineHeight: 1.5,
    },

    gradeCards: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))",
      gap: "16px",
    },

   card: {
  padding: "20px",
  border: `1px solid ${cores.borda}`,
  borderRadius: "18px",
  background: cores.painel,
  boxShadow: cores.sombra,
},

   cardDestaque: {
  padding: "20px",
  border: "1px solid rgba(239, 68, 68, 0.28)",
  borderRadius: "18px",
  background:
    cores.painel === "#FFFFFF"
      ? "linear-gradient(145deg, #FEF2F2, #FEE2E2)"
      : "linear-gradient(145deg, rgba(153,27,27,0.34), rgba(15,23,42,0.96))",
  boxShadow: cores.sombra,
},

    cardTopo: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      gap: "12px",
      marginBottom: "14px",
    },

    cardLabel: {
  color: cores.textoSecundario,
  fontSize: "14px",
  fontWeight: 600,
},

    cardIcone: {
      width: "38px",
      height: "38px",
      borderRadius: "12px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "rgba(239, 68, 68, 0.12)",
      color: "#F87171",
      fontSize: "19px",
      fontWeight: 800,
    },

 cardValor: {
  margin: 0,
  color: cores.texto,
  fontSize: "25px",
  fontWeight: 800,
},

    cardDetalhe: {
      margin: "8px 0 0",
      color: cores.textoSuave,
      fontSize: "13px",
    },

    painel: {
      background: cores.painel,
      border: `1px solid ${cores.borda}`,
      borderRadius: "18px",
      overflow: "hidden",
      boxShadow: "0 12px 35px rgba(0, 0, 0, 0.16)",
    },

    painelCabecalho: {
      padding: "20px",
      borderBottom: "1px solid rgba(148, 163, 184, 0.12)",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      flexWrap: "wrap",
      gap: "16px",
    },

    painelTitulo: {
      margin: 0,
      color: cores.texto,
      fontSize: "18px",
      fontWeight: 750,
    },

    painelDescricao: {
      margin: "6px 0 0",
      color: cores.textoSuave,
      fontSize: "13px",
    },

    filtros: {
      display: "flex",
      alignItems: "center",
      gap: "10px",
      flexWrap: "wrap",
    },

    input: {
      width: "240px",
      maxWidth: "100%",
      padding: "11px 13px",
      borderRadius: "10px",
      border: "1px solid rgba(148, 163, 184, 0.18)",
      background: cores.input,
      color: cores.texto,
      color: cores.texto,
      outline: "none",
      fontSize: "14px",
    },

    select: {
      padding: "11px 13px",
      borderRadius: "10px",
      border: "1px solid rgba(148, 163, 184, 0.18)",
      background: cores.input,
      color: cores.texto,
      outline: "none",
      fontSize: "14px",
      cursor: "pointer",
    },

    resumoMes: {
      margin: "0 20px 20px",
      padding: "18px",
      borderRadius: "14px",
      background: "rgba(239, 68, 68, 0.07)",
      border: "1px solid rgba(239, 68, 68, 0.13)",
    },

    resumoMesTopo: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      gap: "12px",
      flexWrap: "wrap",
      marginBottom: "13px",
    },

    resumoMesTitulo: {
      margin: 0,
      color: cores.texto,
      fontSize: "14px",
      fontWeight: 700,
    },

    resumoMesValor: {
      margin: 0,
      color: "#F87171",
      fontSize: "17px",
      fontWeight: 800,
    },

    barraFundo: {
      width: "100%",
      height: "8px",
      background: "rgba(148, 163, 184, 0.13)",
      borderRadius: "999px",
      overflow: "hidden",
    },

    barraProgresso: {
      width: `${Math.min(percentualMesAtual, 100)}%`,
      height: "100%",
      background: "linear-gradient(90deg, #DC2626, #F87171)",
      borderRadius: "999px",
      transition: "width 0.3s ease",
    },

    tabelaContainer: {
      width: "100%",
      overflowX: "auto",
    },

    tabela: {
      width: "100%",
      borderCollapse: "collapse",
      minWidth: "680px",
    },

    tabelaCabecalho: {
      background: cores.fundoSecundario,
    },

    th: {
      padding: "14px 20px",
      textAlign: "left",
      color: cores.textoSecundario,
      fontSize: "12px",
      fontWeight: 750,
      textTransform: "uppercase",
      letterSpacing: "0.05em",
      borderBottom: `1px solid ${cores.borda}`,
    },

    thDireita: {
      padding: "14px 20px",
      textAlign: "right",
      color: cores.textoSecundario,
      fontSize: "12px",
      fontWeight: 750,
      textTransform: "uppercase",
      letterSpacing: "0.05em",
      borderBottom: `1px solid ${cores.borda}`,
    },

    td: {
      padding: "16px 20px",
      color: cores.textoSecundario,
      fontSize: "14px",
      borderBottom: "1px solid rgba(148, 163, 184, 0.08)",
    },

    tdDireita: {
      padding: "16px 20px",
      textAlign: "right",
      color: "#F87171",
      fontSize: "14px",
      fontWeight: 750,
      borderBottom: "1px solid rgba(148, 163, 184, 0.08)",
    },

    descricaoDespesa: {
      display: "flex",
      alignItems: "center",
      gap: "12px",
    },

    iconeDespesa: {
      width: "36px",
      height: "36px",
      minWidth: "36px",
      borderRadius: "11px",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      background: "rgba(239, 68, 68, 0.1)",
      color: "#F87171",
      fontWeight: 800,
    },

    descricaoTexto: {
      color: cores.texto,
      fontWeight: 650,
    },

    badge: {
      display: "inline-flex",
      alignItems: "center",
      padding: "6px 9px",
      borderRadius: "999px",
      color: "#FCA5A5",
      background: "rgba(239, 68, 68, 0.1)",
      fontSize: "12px",
      fontWeight: 700,
    },

    vazio: {
      padding: "50px 20px",
      textAlign: "center",
    },

    vazioIcone: {
      width: "56px",
      height: "56px",
      margin: "0 auto 16px",
      borderRadius: "18px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "rgba(239, 68, 68, 0.1)",
      color: "#F87171",
      fontSize: "24px",
      fontWeight: 800,
    },

    vazioTitulo: {
      margin: 0,
      color: cores.texto,
      fontSize: "17px",
      fontWeight: 750,
    },

    vazioTexto: {
      margin: "8px auto 0",
      maxWidth: "420px",
      color: cores.textoSuave,
      lineHeight: 1.6,
      fontSize: "14px",
    },

    rodapeTabela: {
      padding: "14px 20px",
      color: cores.textoSuave,
      fontSize: "13px",
      borderTop: "1px solid rgba(148, 163, 184, 0.08)",
    },
  };

  return (
    <div style={ui.page(cores)}>
      <header style={estilos.cabecalho}>
        <div>
          <h1 style={ui.title(cores)}>Despesas</h1>

          <p style={estilos.subtitulo}>
            Acompanhe seus gastos, identifique despesas importantes e consulte
            seu histórico financeiro.
          </p>
        </div>
      </header>

      <section style={estilos.gradeCards}>
        <article style={ui.card(cores)}>
          <div style={estilos.cardTopo}>
            <span style={estilos.cardLabel}>Total de despesas</span>
            <span style={estilos.cardIcone}>R$</span>
          </div>

          <p style={estilos.cardValor}>{formatarMoeda(totalDespesas)}</p>

          <p style={estilos.cardDetalhe}>
            Soma de todas as despesas cadastradas
          </p>
        </article>

        <article style={ui.card(cores)}>
          <div style={estilos.cardTopo}>
            <span style={estilos.cardLabel}>Despesas neste mês</span>
            <span style={estilos.cardIcone}>↘</span>
          </div>

          <p style={estilos.cardValor}>{formatarMoeda(totalMesAtual)}</p>

          <p style={estilos.cardDetalhe}>
            {despesasDoMesAtual.length}{" "}
            {despesasDoMesAtual.length === 1 ? "registro" : "registros"} no mês
          </p>
        </article>

        <article style={ui.card(cores)}>
          <div style={estilos.cardTopo}>
            <span style={estilos.cardLabel}>Despesa média</span>
            <span style={estilos.cardIcone}>Ø</span>
          </div>

          <p style={estilos.cardValor}>{formatarMoeda(despesaMedia)}</p>

          <p style={estilos.cardDetalhe}>Média por despesa cadastrada</p>
        </article>

        <article style={ui.card(cores)}>
          <div style={estilos.cardTopo}>
            <span style={estilos.cardLabel}>Maior despesa</span>
            <span style={estilos.cardIcone}>↑</span>
          </div>

          <p style={estilos.cardValor}>{formatarMoeda(maiorDespesa)}</p>

          <p style={estilos.cardDetalhe}>
            Maior saída registrada no período
          </p>
        </article>
      </section>

      <section style={ui.panel(cores)}>
        <div style={estilos.painelCabecalho}>
          <div>
            <h2 style={estilos.painelTitulo}>Histórico de despesas</h2>

            <p style={estilos.painelDescricao}>
              Consulte, filtre e organize todos os gastos cadastrados.
            </p>
          </div>

          <div style={estilos.filtros}>
            <input
              type="text"
              value={busca}
              onChange={(evento) => setBusca(evento.target.value)}
              placeholder="Buscar despesa..."
              style={estilos.input}
            />

            <select
              value={ordenacao}
              onChange={(evento) => setOrdenacao(evento.target.value)}
              style={estilos.select}
            >
              <option value="mais-recentes">Mais recentes</option>
              <option value="mais-antigas">Mais antigas</option>
              <option value="maior-valor">Maior valor</option>
              <option value="menor-valor">Menor valor</option>
              <option value="descricao">Descrição</option>
            </select>
          </div>
        </div>

        {despesasNormalizadas.length > 0 && (
          <div style={estilos.resumoMes}>
            <div style={estilos.resumoMesTopo}>
              <p style={estilos.resumoMesTitulo}>
                Participação do mês atual no total
              </p>

              <p style={estilos.resumoMesValor}>
                {percentualMesAtual.toFixed(1)}%
              </p>
            </div>

            <div style={estilos.barraFundo}>
              <div style={estilos.barraProgresso} />
            </div>
          </div>
        )}

        {despesasNormalizadas.length === 0 ? (
          <div style={estilos.vazio}>
            <div style={estilos.vazioIcone}>R$</div>

            <h3 style={estilos.vazioTitulo}>Nenhuma despesa cadastrada</h3>

            <p style={estilos.vazioTexto}>
              Quando uma despesa for adicionada, ela aparecerá aqui com seu
              valor, data e demais informações.
            </p>
          </div>
        ) : despesasFiltradas.length === 0 ? (
          <div style={estilos.vazio}>
            <div style={estilos.vazioIcone}>?</div>

            <h3 style={estilos.vazioTitulo}>Nenhuma despesa encontrada</h3>

            <p style={estilos.vazioTexto}>
              Não encontramos despesas com o termo pesquisado. Tente buscar por
              outra descrição.
            </p>
          </div>
        ) : (
          <>
            <div style={estilos.tabelaContainer}>
              <table style={estilos.tabela}>
                <thead style={estilos.tabelaCabecalho}>
                  <tr>
                    <th style={estilos.th}>Descrição</th>
                    <th style={estilos.th}>Categoria</th>
                    <th style={estilos.th}>Data</th>
                    <th style={estilos.th}>Tipo</th>
                    <th style={estilos.thDireita}>Valor</th>
                  </tr>
                </thead>

                <tbody>
                  {despesasFiltradas.map((despesa) => (
                    <tr key={despesa.id}>
                      <td style={estilos.td}>
                        <div style={estilos.descricaoDespesa}>
                          <span style={estilos.iconeDespesa}>−</span>

                          <span style={estilos.descricaoTexto}>
                            {despesa.descricao || "Despesa sem descrição"}
                          </span>
                        </div>
                      </td>

                      <td style={estilos.td}>
                        <span style={estilos.badge}>
                          {despesa.categoria || "Sem categoria"}
                        </span>
                      </td>

                      <td
  style={{
    ...estilos.td,
    color: cores.texto,
    fontWeight: 600,
  }}
>
  {formatarData(despesa.data)}
</td>

                      <td style={estilos.td}>
                        <span style={estilos.badge}>Saída</span>
                      </td>

                      <td style={estilos.tdDireita}>
                        − {formatarMoeda(despesa.valorNumerico)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div style={estilos.rodapeTabela}>
              Exibindo {despesasFiltradas.length} de{" "}
              {despesasNormalizadas.length}{" "}
              {despesasNormalizadas.length === 1 ? "despesa" : "despesas"}
            </div>
          </>
        )}
      </section>
    </div>
  );
}

export default Despesas;
