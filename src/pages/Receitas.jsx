import { useMemo, useState } from "react";
import { useFinance } from "../context/FinanceContext";
import { useSettings } from "../context/SettingsContext";
import * as ui from "../styles/theme";

function Receitas() {
  const { receitas = [] } = useFinance();
  const { cores } = useSettings();

  const [busca, setBusca] = useState("");
  const [categoriaSelecionada, setCategoriaSelecionada] =
    useState("todas");
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
        const dataConvertida = new Date(
          ano,
          mes - 1,
          dia,
          12,
          0,
          0
        );

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

  const receitasNormalizadas = useMemo(() => {
    return receitas.map((receita) => ({
      ...receita,

      valorNumerico: Math.abs(Number(receita.valor) || 0),

      dataConvertida: converterData(receita.data),

      descricaoNormalizada:
        receita.descricao?.trim() || "Receita sem descrição",

      categoriaNormalizada:
        receita.categoria?.trim() || "Outros",

      contaNormalizada:
        receita.conta?.trim() || "Conta principal",

      statusNormalizado:
        receita.status?.trim().toLowerCase() || "confirmado",
    }));
  }, [receitas]);

  const receitasConfirmadas = useMemo(() => {
    return receitasNormalizadas.filter(
      (receita) => receita.statusNormalizado === "confirmado"
    );
  }, [receitasNormalizadas]);

  const totalReceitas = useMemo(() => {
    return receitasConfirmadas.reduce(
      (total, receita) => total + receita.valorNumerico,
      0
    );
  }, [receitasConfirmadas]);

  const mediaReceitas =
    receitasConfirmadas.length > 0
      ? totalReceitas / receitasConfirmadas.length
      : 0;

  const maiorReceita = useMemo(() => {
    if (receitasConfirmadas.length === 0) {
      return 0;
    }

    return Math.max(
      ...receitasConfirmadas.map(
        (receita) => receita.valorNumerico
      )
    );
  }, [receitasConfirmadas]);

  const receitasDoMesAtual = useMemo(() => {
    const hoje = new Date();
    const mesAtual = hoje.getMonth();
    const anoAtual = hoje.getFullYear();

    return receitasConfirmadas.filter((receita) => {
      if (!receita.dataConvertida) {
        return false;
      }

      return (
        receita.dataConvertida.getMonth() === mesAtual &&
        receita.dataConvertida.getFullYear() === anoAtual
      );
    });
  }, [receitasConfirmadas]);

  const totalMesAtual = useMemo(() => {
    return receitasDoMesAtual.reduce(
      (total, receita) => total + receita.valorNumerico,
      0
    );
  }, [receitasDoMesAtual]);

  const percentualMesAtual =
    totalReceitas > 0
      ? Math.min((totalMesAtual / totalReceitas) * 100, 100)
      : 0;

  const categorias = useMemo(() => {
    return [
      ...new Set(
        receitasNormalizadas.map(
          (receita) => receita.categoriaNormalizada
        )
      ),
    ].sort((a, b) => a.localeCompare(b, "pt-BR"));
  }, [receitasNormalizadas]);

  const resumoCategorias = useMemo(() => {
    const totais = receitasConfirmadas.reduce(
      (resultado, receita) => {
        const categoria = receita.categoriaNormalizada;

        if (!resultado[categoria]) {
          resultado[categoria] = {
            categoria,
            total: 0,
            quantidade: 0,
          };
        }

        resultado[categoria].total += receita.valorNumerico;
        resultado[categoria].quantidade += 1;

        return resultado;
      },
      {}
    );

    return Object.values(totais).sort(
      (a, b) => b.total - a.total
    );
  }, [receitasConfirmadas]);

  const categoriaPrincipal = resumoCategorias[0] || null;

  const receitasFiltradas = useMemo(() => {
    const termoBusca = busca.trim().toLowerCase();

    const filtradas = receitasNormalizadas.filter((receita) => {
      const correspondeBusca =
        receita.descricaoNormalizada
          .toLowerCase()
          .includes(termoBusca) ||
        receita.categoriaNormalizada
          .toLowerCase()
          .includes(termoBusca) ||
        receita.contaNormalizada
          .toLowerCase()
          .includes(termoBusca);

      const correspondeCategoria =
        categoriaSelecionada === "todas" ||
        receita.categoriaNormalizada === categoriaSelecionada;

      return correspondeBusca && correspondeCategoria;
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
    receitasNormalizadas,
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
      gridTemplateColumns:
        "repeat(auto-fit, minmax(210px, 1fr))",
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
  border: "1px solid rgba(34, 197, 94, 0.3)",
  borderRadius: "18px",
  background:
  cores.painel === "#FFFFFF"
    ? "linear-gradient(145deg, #F8FFF9, #ECFDF3)"
    : "linear-gradient(145deg, rgba(21,128,61,0.34), rgba(15,23,42,0.96))",
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
      background: "rgba(34, 197, 94, 0.13)",
      color: "#4ADE80",
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
      gridTemplateColumns:
        "repeat(auto-fit, minmax(290px, 1fr))",
      gap: "16px",
    },

    painel: {
      border: `1px solid ${cores.borda}`,
      borderRadius: "18px",
      background: cores.painel,
      boxShadow: "0 12px 35px rgba(0, 0, 0, 0.16)",
      overflow: "hidden",
    },

    painelInterno: {
      padding: "20px",
    },

    painelCabecalho: {
      padding: "20px",
      borderBottom:
        `1px solid ${cores.borda}`,
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
      border: "1px solid rgba(34, 197, 94, 0.16)",
      borderRadius: "14px",
      background: "rgba(34, 197, 94, 0.07)",
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
      color: "#4ADE80",
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
      width: `${percentualMesAtual}%`,
      height: "100%",
      borderRadius: "999px",
      background: "linear-gradient(90deg, #16A34A, #4ADE80)",
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
      color: "#4ADE80",
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
      width: "240px",
      maxWidth: "100%",
      padding: "11px 13px",
      border: `1px solid ${cores.borda}`,
      borderRadius: "10px",
      outline: "none",
    background: cores.input,
      color: cores.texto,
      fontSize: "14px",
    },

    select: {
      padding: "11px 13px",
      border: `1px solid ${cores.borda}`,
      borderRadius: "10px",
      outline: "none",
      background: cores.input,
      color: cores.texto,
      fontSize: "14px",
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
      background: cores.fundoSecundario,
    },

    th: {
      padding: "14px 20px",
      borderBottom:
        `1px solid ${cores.borda}`,
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
      borderBottom:
        `1px solid ${cores.borda}`,
      color: "#4ADE80",
      fontSize: "14px",
      fontWeight: 750,
      textAlign: "right",
    },

    descricaoReceita: {
      display: "flex",
      alignItems: "center",
      gap: "12px",
    },

    iconeReceita: {
      width: "36px",
      height: "36px",
      minWidth: "36px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      borderRadius: "11px",
      background: "rgba(34, 197, 94, 0.11)",
      color: "#4ADE80",
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
      background: "rgba(34, 197, 94, 0.11)",
      color: "#86EFAC",
      fontSize: "12px",
      fontWeight: 700,
    },

    statusConfirmado: {
      display: "inline-flex",
      alignItems: "center",
      padding: "6px 9px",
      borderRadius: "999px",
      background: "rgba(34, 197, 94, 0.1)",
      color: "#86EFAC",
      fontSize: "12px",
      fontWeight: 700,
      textTransform: "capitalize",
    },

    statusPendente: {
      display: "inline-flex",
      alignItems: "center",
      padding: "6px 9px",
      borderRadius: "999px",
      background: "rgba(245, 158, 11, 0.1)",
      color: "#FCD34D",
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
      background: "rgba(34, 197, 94, 0.11)",
      color: "#4ADE80",
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
          <h1 style={ui.title(cores)}>Receitas</h1>

          <p style={estilos.subtitulo}>
            Acompanhe suas entradas, identifique as principais fontes de
            receita e consulte todo o histórico financeiro.
          </p>
        </div>
      </header>

      <section style={estilos.gradeCards}>
        <article style={estilos.cardDestaque}>
          <div style={estilos.cardTopo}>
            <span style={estilos.cardLabel}>Total recebido</span>
            <span style={estilos.cardIcone}>R$</span>
          </div>

          <p style={estilos.cardValor}>
            {formatarMoeda(totalReceitas)}
          </p>

          <p style={estilos.cardDetalhe}>
            Soma de todas as receitas confirmadas
          </p>
        </article>

        <article style={ui.card(cores)}>
          <div style={estilos.cardTopo}>
            <span style={estilos.cardLabel}>
              Receitas deste mês
            </span>

            <span style={estilos.cardIcone}>↗</span>
          </div>

          <p style={estilos.cardValor}>
            {formatarMoeda(totalMesAtual)}
          </p>

          <p style={estilos.cardDetalhe}>
            {receitasDoMesAtual.length}{" "}
            {receitasDoMesAtual.length === 1
              ? "entrada registrada"
              : "entradas registradas"}
          </p>
        </article>

        <article style={estilos.card}>
          <div style={estilos.cardTopo}>
            <span style={estilos.cardLabel}>Receita média</span>
            <span style={estilos.cardIcone}>Ø</span>
          </div>

          <p style={estilos.cardValor}>
            {formatarMoeda(mediaReceitas)}
          </p>

          <p style={estilos.cardDetalhe}>
            Média entre todas as receitas confirmadas
          </p>
        </article>

        <article style={estilos.card}>
          <div style={estilos.cardTopo}>
            <span style={estilos.cardLabel}>Maior receita</span>
            <span style={estilos.cardIcone}>↑</span>
          </div>

          <p style={estilos.cardValor}>
            {formatarMoeda(maiorReceita)}
          </p>

          <p style={estilos.cardDetalhe}>
            Maior entrada registrada no período
          </p>
        </article>
      </section>

      <section style={estilos.gradeInformacoes}>
        <article style={estilos.painel}>
          <div style={estilos.painelInterno}>
            <h2 style={estilos.painelTitulo}>
              Participação do mês atual
            </h2>

            <p style={estilos.painelDescricao}>
              Percentual das receitas deste mês em relação ao total
              recebido.
            </p>

            <div style={{ marginTop: "18px" }}>
              <div style={estilos.resumoMes}>
                <div style={estilos.resumoMesTopo}>
                  <p style={estilos.resumoMesTitulo}>
                    Receitas do mês
                  </p>

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

        <article style={estilos.painel}>
          <div style={estilos.painelInterno}>
            <h2 style={estilos.painelTitulo}>
              Principais categorias
            </h2>

            <p style={estilos.painelDescricao}>
              Categorias responsáveis pelas maiores entradas.
            </p>

            {resumoCategorias.length === 0 ? (
              <p style={estilos.vazioPequeno}>
                As categorias aparecerão aqui quando houver receitas
                cadastradas.
              </p>
            ) : (
              <div style={estilos.listaCategorias}>
                {resumoCategorias.slice(0, 4).map((item) => (
                  <div
                    key={item.categoria}
                    style={estilos.categoriaLinha}
                  >
                    <div style={estilos.categoriaInfo}>
                      <p style={estilos.categoriaNome}>
                        {item.categoria}
                      </p>

                      <p style={estilos.categoriaQuantidade}>
                        {item.quantidade}{" "}
                        {item.quantidade === 1
                          ? "receita"
                          : "receitas"}
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
              <p
                style={{
                  ...estilos.cardDetalhe,
                  marginTop: "18px",
                }}
              >
                Maior fonte: {categoriaPrincipal.categoria}
              </p>
            )}
          </div>
        </article>
      </section>

      <section style={ui.panel(cores)}>
        <div style={estilos.painelCabecalho}>
          <div>
            <h2 style={estilos.painelTitulo}>
              Histórico de receitas
            </h2>

            <p style={estilos.painelDescricao}>
              Consulte, filtre e organize todas as entradas cadastradas.
            </p>
          </div>

          <div style={estilos.filtros}>
            <input
              type="text"
              value={busca}
              onChange={(evento) => setBusca(evento.target.value)}
              placeholder="Buscar receita..."
              style={estilos.input}
            />

            <select
              value={categoriaSelecionada}
              onChange={(evento) =>
                setCategoriaSelecionada(evento.target.value)
              }
              style={estilos.select}
            >
              <option value="todas">
                Todas as categorias
              </option>

              {categorias.map((categoria) => (
                <option key={categoria} value={categoria}>
                  {categoria}
                </option>
              ))}
            </select>

            <select
              value={ordenacao}
              onChange={(evento) =>
                setOrdenacao(evento.target.value)
              }
              style={estilos.select}
            >
              <option value="mais-recentes">
                Mais recentes
              </option>

              <option value="mais-antigas">
                Mais antigas
              </option>

              <option value="maior-valor">
                Maior valor
              </option>

              <option value="menor-valor">
                Menor valor
              </option>

              <option value="descricao">
                Descrição
              </option>

              <option value="categoria">
                Categoria
              </option>
            </select>
          </div>
        </div>

        {receitasNormalizadas.length === 0 ? (
          <div style={estilos.vazio}>
            <div style={estilos.vazioIcone}>R$</div>

            <h3 style={estilos.vazioTitulo}>
              Nenhuma receita cadastrada
            </h3>

            <p style={estilos.vazioTexto}>
              Quando uma receita for adicionada, ela aparecerá aqui com
              valor, categoria, conta, data e status.
            </p>
          </div>
        ) : receitasFiltradas.length === 0 ? (
          <div style={estilos.vazio}>
            <div style={estilos.vazioIcone}>?</div>

            <h3 style={estilos.vazioTitulo}>
              Nenhuma receita encontrada
            </h3>

            <p style={estilos.vazioTexto}>
              Não encontramos receitas com os filtros selecionados.
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
                  {receitasFiltradas.map((receita) => {
                    const statusConfirmado =
                      receita.statusNormalizado === "confirmado";

                    return (
                      <tr key={receita.id}>
                        <td style={estilos.td}>
                          <div style={estilos.descricaoReceita}>
                            <span style={estilos.iconeReceita}>
                              ↗
                            </span>

                            <span style={estilos.descricaoTexto}>
                              {receita.descricaoNormalizada}
                            </span>
                          </div>
                        </td>

                        <td style={estilos.td}>
                          <span style={estilos.categoriaBadge}>
                            {receita.categoriaNormalizada}
                          </span>
                        </td>

                        <td style={estilos.td}>
                          {receita.contaNormalizada}
                        </td>

                        <td style={estilos.td}>
                          {formatarData(receita.data)}
                        </td>

                        <td style={estilos.td}>
                          <span
                            style={
                              statusConfirmado
                                ? estilos.statusConfirmado
                                : estilos.statusPendente
                            }
                          >
                            {receita.statusNormalizado}
                          </span>
                        </td>

                        <td style={estilos.tdDireita}>
                          {formatarMoeda(receita.valorNumerico)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div style={estilos.rodapeTabela}>
              Exibindo {receitasFiltradas.length} de{" "}
              {receitasNormalizadas.length}{" "}
              {receitasNormalizadas.length === 1
                ? "receita"
                : "receitas"}
            </div>
          </>
        )}
      </section>
    </div>
  );
}

export default Receitas;
