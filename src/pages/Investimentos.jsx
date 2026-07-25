import { useMemo, useState } from "react";
import { useFinance } from "../context/FinanceContext";
import { useSettings } from "../context/SettingsContext";
import * as ui from "../styles/theme";

function Investimentos() {
  const { investimentos = [] } = useFinance();
  const { cores } = useSettings();

  const [busca, setBusca] = useState("");
  const [categoriaSelecionada, setCategoriaSelecionada] = useState("todas");
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

    if (data instanceof Date) {
      return Number.isNaN(data.getTime()) ? null : data;
    }

    if (typeof data === "string") {
      const texto = data.trim();

      if (/^\d{2}\/\d{2}\/\d{4}$/.test(texto)) {
        const [dia, mes, ano] = texto.split("/").map(Number);
        const dataConvertida = new Date(ano, mes - 1, dia, 12, 0, 0);

        return Number.isNaN(dataConvertida.getTime())
          ? null
          : dataConvertida;
      }

      if (/^\d{4}-\d{2}-\d{2}$/.test(texto)) {
        const dataConvertida = new Date(`${texto}T12:00:00`);

        return Number.isNaN(dataConvertida.getTime())
          ? null
          : dataConvertida;
      }

      const dataConvertida = new Date(texto);

      return Number.isNaN(dataConvertida.getTime())
        ? null
        : dataConvertida;
    }

    const dataConvertida = new Date(data);

    return Number.isNaN(dataConvertida.getTime())
      ? null
      : dataConvertida;
  };

  const formatarData = (data) => {
    const dataConvertida = converterData(data);

    if (!dataConvertida) {
      return data || "Data não informada";
    }

    return dataConvertida.toLocaleDateString("pt-BR");
  };

  const investimentosNormalizados = useMemo(() => {
    return investimentos.map((investimento) => ({
      ...investimento,
      valorNumerico: Math.abs(Number(investimento.valor) || 0),
      dataConvertida: converterData(investimento.data),
      descricaoNormalizada:
        investimento.descricao?.trim() || "Investimento sem descrição",
      categoriaNormalizada:
        investimento.categoria?.trim() || "Outros",
      contaNormalizada:
        investimento.conta?.trim() || "Conta principal",
      statusNormalizado:
        investimento.status?.trim().toLowerCase() || "confirmado",
    }));
  }, [investimentos]);

  const investimentosConfirmados = useMemo(() => {
    return investimentosNormalizados.filter(
      (investimento) => investimento.statusNormalizado === "confirmado"
    );
  }, [investimentosNormalizados]);

  const totalInvestido = useMemo(() => {
    return investimentosConfirmados.reduce(
      (total, investimento) => total + investimento.valorNumerico,
      0
    );
  }, [investimentosConfirmados]);

  const aporteMedio =
    investimentosConfirmados.length > 0
      ? totalInvestido / investimentosConfirmados.length
      : 0;

  const maiorAporte = useMemo(() => {
    if (investimentosConfirmados.length === 0) {
      return 0;
    }

    return Math.max(
      ...investimentosConfirmados.map(
        (investimento) => investimento.valorNumerico
      )
    );
  }, [investimentosConfirmados]);

  const investimentosDoMesAtual = useMemo(() => {
    const hoje = new Date();
    const mesAtual = hoje.getMonth();
    const anoAtual = hoje.getFullYear();

    return investimentosConfirmados.filter((investimento) => {
      if (!investimento.dataConvertida) {
        return false;
      }

      return (
        investimento.dataConvertida.getMonth() === mesAtual &&
        investimento.dataConvertida.getFullYear() === anoAtual
      );
    });
  }, [investimentosConfirmados]);

  const totalMesAtual = useMemo(() => {
    return investimentosDoMesAtual.reduce(
      (total, investimento) => total + investimento.valorNumerico,
      0
    );
  }, [investimentosDoMesAtual]);

  const percentualMesAtual =
    totalInvestido > 0 ? (totalMesAtual / totalInvestido) * 100 : 0;

  const categorias = useMemo(() => {
    return [
      ...new Set(
        investimentosNormalizados.map(
          (investimento) => investimento.categoriaNormalizada
        )
      ),
    ].sort((a, b) => a.localeCompare(b, "pt-BR"));
  }, [investimentosNormalizados]);

  const resumoCategorias = useMemo(() => {
    const totais = investimentosConfirmados.reduce(
      (resultado, investimento) => {
        const categoria = investimento.categoriaNormalizada;

        if (!resultado[categoria]) {
          resultado[categoria] = {
            categoria,
            total: 0,
            quantidade: 0,
          };
        }

        resultado[categoria].total += investimento.valorNumerico;
        resultado[categoria].quantidade += 1;

        return resultado;
      },
      {}
    );

    return Object.values(totais).sort((a, b) => b.total - a.total);
  }, [investimentosConfirmados]);

  const categoriaPrincipal = resumoCategorias[0] || null;

  const investimentosFiltrados = useMemo(() => {
    const termoBusca = busca.trim().toLowerCase();

    const filtrados = investimentosNormalizados.filter((investimento) => {
      const correspondeBusca =
        investimento.descricaoNormalizada
          .toLowerCase()
          .includes(termoBusca) ||
        investimento.categoriaNormalizada
          .toLowerCase()
          .includes(termoBusca) ||
        investimento.contaNormalizada
          .toLowerCase()
          .includes(termoBusca);

      const correspondeCategoria =
        categoriaSelecionada === "todas" ||
        investimento.categoriaNormalizada === categoriaSelecionada;

      return correspondeBusca && correspondeCategoria;
    });

    return [...filtrados].sort((a, b) => {
      switch (ordenacao) {
        case "mais-antigos":
          return (
            (a.dataConvertida?.getTime() || 0) -
            (b.dataConvertida?.getTime() || 0)
          );

        case "maior-valor":
          return b.valorNumerico - a.valorNumerico;

        case "menor-valor":
          return a.valorNumerico - b.valorNumerico;

        case "descricao":
          return a.descricaoNormalizada.localeCompare(
            b.descricaoNormalizada,
            "pt-BR"
          );

        case "categoria":
          return a.categoriaNormalizada.localeCompare(
            b.categoriaNormalizada,
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
  }, [
    investimentosNormalizados,
    busca,
    categoriaSelecionada,
    ordenacao,
  ]);

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
      color: cores.texto,
      fontSize: "30px",
      fontWeight: 800,
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

card: ui.card(cores),

    cardDestaque: {
      padding: "20px",
      border: "1px solid rgba(59, 130, 246, 0.3)",
      borderRadius: "18px",
      background:
        cores.painel === "#FFFFFF"
          ? "linear-gradient(145deg, #EFF6FF, #DBEAFE)"
          : "linear-gradient(145deg, rgba(30, 64, 175, 0.36), rgba(15, 23, 42, 0.96))",
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
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      borderRadius: "12px",
      background: "rgba(59, 130, 246, 0.13)",
      color: "#60A5FA",
      fontSize: "18px",
      fontWeight: 800,
    },

    cardValor: {
      margin: 0,
      color: cores.texto,
      fontSize: "25px",
      fontWeight: 800,
      wordBreak: "break-word",
    },

    cardDetalhe: {
      margin: "8px 0 0",
      color: cores.textoSuave,
      fontSize: "13px",
      lineHeight: 1.5,
    },

    gradeInformacoes: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(290px, 1fr))",
      gap: "16px",
    },

    painel: {
      border:ui.panel(cores),
  overflow: "hidden",
},

    painelInterno: {
      padding: "20px",
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
      lineHeight: 1.5,
    },

    resumoMes: {
      padding: "18px",
      border: `1px solid ${cores.borda}`,
      borderRadius: "14px",
      background:
        cores.painel === "#FFFFFF"
          ? "#EFF6FF"
          : "rgba(59, 130, 246, 0.08)",
    },

    resumoMesTopo: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      gap: "12px",
      marginBottom: "13px",
      flexWrap: "wrap",
    },

    resumoMesTitulo: {
      margin: 0,
      color: cores.texto,
      fontSize: "14px",
      fontWeight: 700,
    },

    resumoMesValor: {
      margin: 0,
      color: "#60A5FA",
      fontSize: "17px",
      fontWeight: 800,
    },

    barraFundo: {
      width: "100%",
      height: "8px",
      overflow: "hidden",
      borderRadius: "999px",
      background: "rgba(148, 163, 184, 0.13)",
    },

    barraProgresso: {
      width: `${Math.min(percentualMesAtual, 100)}%`,
      height: "100%",
      borderRadius: "999px",
      background: "linear-gradient(90deg, #2563EB, #60A5FA)",
      transition: "width 0.3s ease",
    },

    listaCategorias: {
      display: "flex",
      flexDirection: "column",
      gap: "14px",
      marginTop: "18px",
    },

    categoriaLinha: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      gap: "16px",
    },

    categoriaInfo: {
      minWidth: 0,
    },

    categoriaNome: {
      margin: 0,
      color: cores.texto,
      fontSize: "14px",
      fontWeight: 700,
      whiteSpace: "nowrap",
      overflow: "hidden",
      textOverflow: "ellipsis",
    },

    categoriaQuantidade: {
      margin: "4px 0 0",
      color: cores.textoSuave,
      fontSize: "12px",
    },

    categoriaValor: {
      color: "#60A5FA",
      fontSize: "14px",
      fontWeight: 750,
      whiteSpace: "nowrap",
    },

    vazioPequeno: {
      margin: "18px 0 0",
      color: cores.textoSuave,
      fontSize: "14px",
      lineHeight: 1.6,
    },

    filtros: {
      display: "flex",
      alignItems: "center",
      gap: "10px",
      flexWrap: "wrap",
    },

    input: {
      width:ui.input(cores),
  width: "100%",
  boxSizing: "border-box",
},

    select: {
      padding:ui.input(cores),
  cursor: "pointer",
},

    tabelaContainer: {
      width: "100%",
      overflowX: "auto",
    },

    tabela: {
      width: "100%",
      minWidth: "820px",
      borderCollapse: "collapse",
    },

    tabelaCabecalho: {
      background: cores.painel,
    },

    th: {
      padding: "14px 20px",
      borderBottom: `1px solid ${cores.borda}`,
      color: cores.textoSecundario,
      fontSize: "12px",
      fontWeight: 750,
      textAlign: "left",
      textTransform: "uppercase",
      letterSpacing: "0.05em",
    },

    thDireita: {
      padding: "14px 20px",
      borderBottom: `1px solid ${cores.borda}`,
      color: cores.textoSecundario,
      fontSize: "12px",
      fontWeight: 750,
      textAlign: "right",
      textTransform: "uppercase",
      letterSpacing: "0.05em",
    },

    td: {
      padding: "16px 20px",
      borderBottom: `1px solid ${cores.borda}`,
      color: cores.texto,
      fontSize: "14px",
    },

    tdDireita: {
      padding: "16px 20px",
      borderBottom: `1px solid ${cores.borda}`,
      color: "#60A5FA",
      fontSize: "14px",
      fontWeight: 750,
      textAlign: "right",
    },

    descricaoInvestimento: {
      display: "flex",
      alignItems: "center",
      gap: "12px",
    },

    iconeInvestimento: {
      width: "36px",
      height: "36px",
      minWidth: "36px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      borderRadius: "11px",
      background: "rgba(59, 130, 246, 0.11)",
      color: "#60A5FA",
      fontWeight: 800,
    },

    descricaoTexto: {
      color: cores.texto,
      fontWeight: 650,
    },

    categoriaBadge: {
      display: "inline-flex",
      alignItems: "center",
      padding: "6px 9px",
      borderRadius: "999px",
      background:
        cores.painel === "#FFFFFF" ? "#DBEAFE" : "rgba(59, 130, 246, 0.14)",
      color: cores.painel === "#FFFFFF" ? "#1D4ED8" : "#93C5FD",
      fontSize: "12px",
      fontWeight: 700,
    },

    statusConfirmado: {
      display: "inline-flex",
      alignItems: "center",
      padding: "6px 9px",
      borderRadius: "999px",
      background:
        cores.painel === "#FFFFFF" ? "#DCFCE7" : "rgba(34, 197, 94, 0.13)",
      color: cores.painel === "#FFFFFF" ? "#15803D" : "#86EFAC",
      fontSize: "12px",
      fontWeight: 700,
      textTransform: "capitalize",
    },

    statusPendente: {
      display: "inline-flex",
      alignItems: "center",
      padding: "6px 9px",
      borderRadius: "999px",
      background:
        cores.painel === "#FFFFFF" ? "#FEF3C7" : "rgba(245, 158, 11, 0.13)",
      color: cores.painel === "#FFFFFF" ? "#B45309" : "#FCD34D",
      fontSize: "12px",
      fontWeight: 700,
      textTransform: "capitalize",
    },

    vazio: {
      padding: "50px 20px",
      textAlign: "center",
    },

    vazioIcone: {
      width: "56px",
      height: "56px",
      margin: "0 auto 16px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      borderRadius: "18px",
      background: "rgba(59, 130, 246, 0.11)",
      color: "#60A5FA",
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
      maxWidth: "430px",
      margin: "8px auto 0",
      color: cores.textoSuave,
      fontSize: "14px",
      lineHeight: 1.6,
    },

    rodapeTabela: {
      padding: "14px 20px",
      borderTop: `1px solid ${cores.borda}`,
      color: cores.textoSuave,
      fontSize: "13px",
    },
  };

  return (
    <div style={ui.page(cores)}>
      <header style={estilos.cabecalho}>
        <div>
          <h1 style={ui.title(cores)}>Investimentos</h1>

          <p style={estilos.subtitulo}>
            Acompanhe seus aportes, identifique as principais categorias e
            consulte todo o histórico de investimentos.
          </p>
        </div>
      </header>

      <section style={estilos.gradeCards}>
        <article style={ui.card(cores)}>
          <div style={estilos.cardTopo}>
            <span style={estilos.cardLabel}>Total investido</span>
            <span style={estilos.cardIcone}>R$</span>
          </div>

          <p style={estilos.cardValor}>{formatarMoeda(totalInvestido)}</p>

          <p style={estilos.cardDetalhe}>
            Soma de todos os investimentos confirmados
          </p>
        </article>

        <article style={ui.card(cores)}>
          <div style={estilos.cardTopo}>
            <span style={estilos.cardLabel}>Aportes neste mês</span>
            <span style={estilos.cardIcone}>↗</span>
          </div>

          <p style={estilos.cardValor}>{formatarMoeda(totalMesAtual)}</p>

          <p style={estilos.cardDetalhe}>
            {investimentosDoMesAtual.length}{" "}
            {investimentosDoMesAtual.length === 1
              ? "aporte registrado"
              : "aportes registrados"}
          </p>
        </article>

        <article style={ui.card(cores)}>
          <div style={estilos.cardTopo}>
            <span style={estilos.cardLabel}>Aporte médio</span>
            <span style={estilos.cardIcone}>Ø</span>
          </div>

          <p style={estilos.cardValor}>{formatarMoeda(aporteMedio)}</p>

          <p style={estilos.cardDetalhe}>
            Média entre os investimentos confirmados
          </p>
        </article>

        <article style={ui.card(cores)}>
          <div style={estilos.cardTopo}>
            <span style={estilos.cardLabel}>Maior aporte</span>
            <span style={estilos.cardIcone}>↑</span>
          </div>

          <p style={estilos.cardValor}>{formatarMoeda(maiorAporte)}</p>

          <p style={estilos.cardDetalhe}>
            Maior investimento registrado no período
          </p>
        </article>
      </section>

      <section style={estilos.gradeInformacoes}>
        <article style={ui.panel(cores)}>
          <div style={estilos.painelInterno}>
            <h2 style={estilos.painelTitulo}>Participação do mês atual</h2>

            <p style={estilos.painelDescricao}>
              Percentual dos aportes deste mês em relação ao total investido.
            </p>

            <div style={{ marginTop: "18px" }}>
              <div style={estilos.resumoMes}>
                <div style={estilos.resumoMesTopo}>
                  <p style={estilos.resumoMesTitulo}>Aportes do mês</p>

                  <p style={estilos.resumoMesValor}>
                    {percentualMesAtual.toFixed(1)}%
                  </p>
                </div>

                <div style={estilos.barraFundo}>
                  <div style={estilos.barraProgresso} />
                </div>
              </div>
            </div>
          </div>
        </article>

        <article style={ui.panel(cores)}>
          <div style={estilos.painelInterno}>
            <h2 style={estilos.painelTitulo}>Principais categorias</h2>

            <p style={estilos.painelDescricao}>
              Categorias com maior valor investido.
            </p>

            {resumoCategorias.length === 0 ? (
              <p style={estilos.vazioPequeno}>
                As categorias aparecerão aqui quando houver investimentos
                cadastrados.
              </p>
            ) : (
              <div style={estilos.listaCategorias}>
                {resumoCategorias.slice(0, 4).map((item) => (
                  <div
                    key={item.categoria}
                    style={estilos.categoriaLinha}
                  >
                    <div style={estilos.categoriaInfo}>
                      <p style={estilos.categoriaNome}>{item.categoria}</p>

                      <p style={estilos.categoriaQuantidade}>
                        {item.quantidade}{" "}
                        {item.quantidade === 1
                          ? "investimento"
                          : "investimentos"}
                      </p>
                    </div>

                    <span style={estilos.categoriaValor}>
                      {formatarMoeda(item.total)}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {categoriaPrincipal && (
              <p style={{ ...estilos.cardDetalhe, marginTop: "18px" }}>
                Maior concentração: {categoriaPrincipal.categoria}
              </p>
            )}
          </div>
        </article>
      </section>

      <section style={ui.panel(cores)}>
        <div style={estilos.painelCabecalho}>
          <div>
            <h2 style={estilos.painelTitulo}>
              Histórico de investimentos
            </h2>

            <p style={estilos.painelDescricao}>
              Consulte, filtre e organize todos os aportes cadastrados.
            </p>
          </div>

          <div style={estilos.filtros}>
            <input
              type="text"
              value={busca}
              onChange={(evento) => setBusca(evento.target.value)}
              placeholder="Buscar investimento..."
              style={estilos.input}
            />

            <select
              value={categoriaSelecionada}
              onChange={(evento) =>
                setCategoriaSelecionada(evento.target.value)
              }
              style={estilos.select}
            >
              <option value="todas">Todas as categorias</option>

              {categorias.map((categoria) => (
                <option key={categoria} value={categoria}>
                  {categoria}
                </option>
              ))}
            </select>

            <select
              value={ordenacao}
              onChange={(evento) => setOrdenacao(evento.target.value)}
              style={estilos.select}
            >
              <option value="mais-recentes">Mais recentes</option>
              <option value="mais-antigos">Mais antigos</option>
              <option value="maior-valor">Maior valor</option>
              <option value="menor-valor">Menor valor</option>
              <option value="descricao">Descrição</option>
              <option value="categoria">Categoria</option>
            </select>
          </div>
        </div>

        {investimentosNormalizados.length === 0 ? (
          <div style={estilos.vazio}>
            <div style={estilos.vazioIcone}>R$</div>

            <h3 style={estilos.vazioTitulo}>
              Nenhum investimento cadastrado
            </h3>

            <p style={estilos.vazioTexto}>
              Quando um investimento for adicionado, ele aparecerá aqui com
              valor, categoria, conta, data e status.
            </p>
          </div>
        ) : investimentosFiltrados.length === 0 ? (
          <div style={estilos.vazio}>
            <div style={estilos.vazioIcone}>?</div>

            <h3 style={estilos.vazioTitulo}>
              Nenhum investimento encontrado
            </h3>

            <p style={estilos.vazioTexto}>
              Não encontramos investimentos com os filtros selecionados.
              Tente alterar a busca, a categoria ou a ordenação.
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
                    <th style={estilos.th}>Conta</th>
                    <th style={estilos.th}>Data</th>
                    <th style={estilos.th}>Status</th>
                    <th style={estilos.thDireita}>Valor</th>
                  </tr>
                </thead>

                <tbody>
                  {investimentosFiltrados.map((investimento) => {
                    const statusConfirmado =
                      investimento.statusNormalizado === "confirmado";

                    return (
                      <tr key={investimento.id}>
                        <td style={estilos.td}>
                          <div style={estilos.descricaoInvestimento}>
                            <span style={estilos.iconeInvestimento}>↗</span>

                            <span style={estilos.descricaoTexto}>
                              {investimento.descricaoNormalizada}
                            </span>
                          </div>
                        </td>

                        <td style={estilos.td}>
                          <span style={estilos.categoriaBadge}>
                            {investimento.categoriaNormalizada}
                          </span>
                        </td>

                        <td style={estilos.td}>
                          {investimento.contaNormalizada}
                        </td>

                        <td style={estilos.td}>
                          {formatarData(investimento.data)}
                        </td>

                        <td style={estilos.td}>
                          <span
                            style={
                              statusConfirmado
                                ? estilos.statusConfirmado
                                : estilos.statusPendente
                            }
                          >
                            {investimento.statusNormalizado}
                          </span>
                        </td>

                        <td style={estilos.tdDireita}>
                          {formatarMoeda(investimento.valorNumerico)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div style={estilos.rodapeTabela}>
              Exibindo {investimentosFiltrados.length} de{" "}
              {investimentosNormalizados.length}{" "}
              {investimentosNormalizados.length === 1
                ? "investimento"
                : "investimentos"}
            </div>
          </>
        )}
      </section>
    </div>
  );
}

export default Investimentos;