import { useMemo, useState } from "react";
import {
  FaArrowDown,
  FaArrowUp,
  FaBullseye,
  FaChartLine,
  FaCoins,
  FaPrint,
  FaReceipt,
  FaWallet,
} from "react-icons/fa";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useFinance } from "../context/FinanceContext";

const CORES_CATEGORIAS = [
  "#EF4444",
  "#F97316",
  "#EAB308",
  "#22C55E",
  "#14B8A6",
  "#3B82F6",
  "#6366F1",
  "#A855F7",
  "#EC4899",
  "#94A3B8",
];

function Relatorios() {
  const {
    receitas,
    despesas,
    investimentos,
    metas,
  } = useFinance();

  const [periodo, setPeriodo] = useState("todos");
  const [dataInicial, setDataInicial] = useState("");
  const [dataFinal, setDataFinal] = useState("");

  function formatarMoeda(valor) {
    return Number(valor || 0).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  }

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

    const dataConvertida = new Date(data);

    if (Number.isNaN(dataConvertida.getTime())) {
      return null;
    }

    return dataConvertida;
  }

  function estaDentroDoPeriodo(item) {
    const dataTransacao = converterData(item.data);

    if (!dataTransacao) return true;

    const hoje = new Date();

    const inicioHoje = new Date(
      hoje.getFullYear(),
      hoje.getMonth(),
      hoje.getDate()
    );

    const fimHoje = new Date(
      hoje.getFullYear(),
      hoje.getMonth(),
      hoje.getDate(),
      23,
      59,
      59
    );

    if (periodo === "hoje") {
      return (
        dataTransacao >= inicioHoje &&
        dataTransacao <= fimHoje
      );
    }

    if (periodo === "mes") {
      return (
        dataTransacao.getMonth() === hoje.getMonth() &&
        dataTransacao.getFullYear() === hoje.getFullYear()
      );
    }

    if (periodo === "ano") {
      return (
        dataTransacao.getFullYear() === hoje.getFullYear()
      );
    }

    if (periodo === "personalizado") {
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
    }

    return true;
  }

  const receitasFiltradas = useMemo(
    () => receitas.filter(estaDentroDoPeriodo),
    [receitas, periodo, dataInicial, dataFinal]
  );

  const despesasFiltradas = useMemo(
    () => despesas.filter(estaDentroDoPeriodo),
    [despesas, periodo, dataInicial, dataFinal]
  );

  const investimentosFiltrados = useMemo(
    () => investimentos.filter(estaDentroDoPeriodo),
    [investimentos, periodo, dataInicial, dataFinal]
  );

  const transacoesFiltradas = useMemo(
    () => [
      ...receitasFiltradas,
      ...despesasFiltradas,
      ...investimentosFiltrados,
    ],
    [
      receitasFiltradas,
      despesasFiltradas,
      investimentosFiltrados,
    ]
  );

  const totalReceitas = receitasFiltradas.reduce(
    (total, item) => total + Number(item.valor || 0),
    0
  );

  const totalDespesas = despesasFiltradas.reduce(
    (total, item) => total + Number(item.valor || 0),
    0
  );

  const totalInvestimentos =
    investimentosFiltrados.reduce(
      (total, item) => total + Number(item.valor || 0),
      0
    );

  const totalMetas = metas.reduce(
    (total, meta) =>
      total + Number(meta.valorAtual || 0),
    0
  );

  const saldoDisponivel =
    totalReceitas -
    totalDespesas -
    totalInvestimentos -
    totalMetas;

  /*
    Patrimônio total: tudo que ainda pertence ao usuário.
    Investimentos e metas não reduzem o patrimônio, pois apenas
    representam dinheiro transferido para outro destino.
  */
  const patrimonioTotal =
    totalReceitas - totalDespesas;

  function encontrarMaior(lista) {
    if (lista.length === 0) return null;

    return lista.reduce((maior, item) =>
      Number(item.valor) > Number(maior.valor)
        ? item
        : maior
    );
  }

  const maiorReceita = encontrarMaior(
    receitasFiltradas
  );

  const maiorDespesa = encontrarMaior(
    despesasFiltradas
  );

  const maiorInvestimento = encontrarMaior(
    investimentosFiltrados
  );

  function agruparPorCategoria(lista) {
    const agrupado = lista.reduce((resultado, item) => {
      const categoria = item.categoria || "Outros";

      resultado[categoria] =
        (resultado[categoria] || 0) +
        Number(item.valor || 0);

      return resultado;
    }, {});

    return Object.entries(agrupado)
      .map(([categoria, valor]) => ({
        categoria,
        valor,
      }))
      .sort((a, b) => b.valor - a.valor);
  }

  const despesasPorCategoria = useMemo(
    () => agruparPorCategoria(despesasFiltradas),
    [despesasFiltradas]
  );

  const receitasPorCategoria = useMemo(
    () => agruparPorCategoria(receitasFiltradas),
    [receitasFiltradas]
  );

  const investimentosPorCategoria = useMemo(
    () =>
      agruparPorCategoria(
        investimentosFiltrados
      ),
    [investimentosFiltrados]
  );

  const categoriaMaiorDespesa =
    despesasPorCategoria[0] || null;

  const categoriaMaiorReceita =
    receitasPorCategoria[0] || null;

  const evolucaoMensal = useMemo(() => {
    const meses = [
      "Jan",
      "Fev",
      "Mar",
      "Abr",
      "Mai",
      "Jun",
      "Jul",
      "Ago",
      "Set",
      "Out",
      "Nov",
      "Dez",
    ];

    const dados = meses.map((mes) => ({
      mes,
      receitas: 0,
      despesas: 0,
      investimentos: 0,
    }));

    function adicionarAoMes(lista, campo) {
      lista.forEach((item) => {
        const data = converterData(item.data);

        if (!data) return;

        const indiceMes = data.getMonth();

        dados[indiceMes][campo] += Number(
          item.valor || 0
        );
      });
    }

    adicionarAoMes(receitasFiltradas, "receitas");
    adicionarAoMes(despesasFiltradas, "despesas");
    adicionarAoMes(
      investimentosFiltrados,
      "investimentos"
    );

    return dados;
  }, [
    receitasFiltradas,
    despesasFiltradas,
    investimentosFiltrados,
  ]);

  const textoPeriodo = {
    todos: "Todo o período",
    hoje: "Hoje",
    mes: "Este mês",
    ano: "Este ano",
    personalizado: "Período personalizado",
  };

  function imprimirRelatorio() {
    window.print();
  }

  return (
    <div
      style={{
        color: "white",
        paddingBottom: 40,
      }}
    >
      <div style={cabecalho}>
        <div>
          <h1
            style={{
              marginTop: 0,
              marginBottom: 6,
            }}
          >
            Relatórios financeiros
          </h1>

          <p
            style={{
              margin: 0,
              color: "#94A3B8",
            }}
          >
            Analise suas movimentações, categorias e
            resultados financeiros.
          </p>
        </div>

        <button
          type="button"
          onClick={imprimirRelatorio}
          style={botaoImprimir}
        >
          <FaPrint />
          Imprimir
        </button>
      </div>

      <div style={areaFiltros}>
        <div>
          <label style={labelFiltro}>
            Período
          </label>

          <select
            value={periodo}
            onChange={(event) =>
              setPeriodo(event.target.value)
            }
            style={inputFiltro}
          >
            <option value="todos">
              Todo o período
            </option>

            <option value="hoje">
              Hoje
            </option>

            <option value="mes">
              Este mês
            </option>

            <option value="ano">
              Este ano
            </option>

            <option value="personalizado">
              Personalizado
            </option>
          </select>
        </div>

        {periodo === "personalizado" && (
          <>
            <div>
              <label style={labelFiltro}>
                Data inicial
              </label>

              <input
                type="date"
                value={dataInicial}
                onChange={(event) =>
                  setDataInicial(event.target.value)
                }
                style={inputFiltro}
              />
            </div>

            <div>
              <label style={labelFiltro}>
                Data final
              </label>

              <input
                type="date"
                value={dataFinal}
                onChange={(event) =>
                  setDataFinal(event.target.value)
                }
                style={inputFiltro}
              />
            </div>
          </>
        )}

        <div style={periodoSelecionado}>
          {textoPeriodo[periodo]}
        </div>
      </div>

      <div style={gradeCards}>
        <CardRelatorio
          titulo="Entradas"
          valor={formatarMoeda(totalReceitas)}
          detalhe={`${receitasFiltradas.length} movimentação(ões)`}
          cor="#22C55E"
          icone={<FaArrowUp />}
        />

        <CardRelatorio
          titulo="Despesas"
          valor={formatarMoeda(totalDespesas)}
          detalhe={`${despesasFiltradas.length} movimentação(ões)`}
          cor="#EF4444"
          icone={<FaArrowDown />}
        />

        <CardRelatorio
          titulo="Investimentos"
          valor={formatarMoeda(totalInvestimentos)}
          detalhe={`${investimentosFiltrados.length} movimentação(ões)`}
          cor="#3B82F6"
          icone={<FaChartLine />}
        />

        <CardRelatorio
          titulo="Guardado em metas"
          valor={formatarMoeda(totalMetas)}
          detalhe={`${metas.length} meta(s)`}
          cor="#A855F7"
          icone={<FaBullseye />}
        />

        <CardRelatorio
          titulo="Saldo disponível"
          valor={formatarMoeda(saldoDisponivel)}
          detalhe="Após despesas, investimentos e metas"
          cor={
            saldoDisponivel >= 0
              ? "#22C55E"
              : "#EF4444"
          }
          icone={<FaWallet />}
        />
      </div>

      <div style={gradeDestaques}>
        <Destaque
          titulo="Maior entrada"
          item={maiorReceita}
          cor="#22C55E"
          formatarMoeda={formatarMoeda}
        />

        <Destaque
          titulo="Maior despesa"
          item={maiorDespesa}
          cor="#EF4444"
          formatarMoeda={formatarMoeda}
        />

        <Destaque
          titulo="Maior investimento"
          item={maiorInvestimento}
          cor="#3B82F6"
          formatarMoeda={formatarMoeda}
        />
      </div>

      <div style={gradeGraficos}>
        <section style={painel}>
          <h2 style={tituloPainel}>
            Evolução mensal
          </h2>

          <p style={subtituloPainel}>
            Comparação das movimentações ao longo do ano.
          </p>

          <div style={{ width: "100%", height: 340 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={evolucaoMensal}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#334155"
                />

                <XAxis
                  dataKey="mes"
                  stroke="#94A3B8"
                />

                <YAxis
                  stroke="#94A3B8"
                  tickFormatter={(valor) =>
                    `R$ ${Number(valor).toLocaleString(
                      "pt-BR",
                      {
                        notation: "compact",
                      }
                    )}`
                  }
                />

                <Tooltip
                  formatter={(valor, nome) => [
                    formatarMoeda(valor),
                    nome,
                  ]}
                  contentStyle={tooltip}
                />

                <Legend />

                <Bar
                  dataKey="receitas"
                  name="Entradas"
                  fill="#22C55E"
                  radius={[5, 5, 0, 0]}
                />

                <Bar
                  dataKey="despesas"
                  name="Despesas"
                  fill="#EF4444"
                  radius={[5, 5, 0, 0]}
                />

                <Bar
                  dataKey="investimentos"
                  name="Investimentos"
                  fill="#3B82F6"
                  radius={[5, 5, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section style={painel}>
          <h2 style={tituloPainel}>
            Despesas por categoria
          </h2>

          <p style={subtituloPainel}>
            Veja para onde seu dinheiro está indo.
          </p>

          {despesasPorCategoria.length === 0 ? (
            <MensagemVazia />
          ) : (
            <div
              style={{
                width: "100%",
                height: 340,
              }}
            >
              <ResponsiveContainer
                width="100%"
                height="100%"
              >
                <PieChart>
                  <Pie
                    data={despesasPorCategoria}
                    dataKey="valor"
                    nameKey="categoria"
                    cx="50%"
                    cy="45%"
                    innerRadius={65}
                    outerRadius={105}
                    paddingAngle={3}
                  >
                    {despesasPorCategoria.map(
                      (item, index) => (
                        <Cell
                          key={item.categoria}
                          fill={
                            CORES_CATEGORIAS[
                              index %
                                CORES_CATEGORIAS.length
                            ]
                          }
                          stroke="#1E293B"
                          strokeWidth={2}
                        />
                      )
                    )}
                  </Pie>

                  <Tooltip
                    formatter={(valor) =>
                      formatarMoeda(valor)
                    }
                    contentStyle={tooltip}
                  />

                  <Legend
                    verticalAlign="bottom"
                    formatter={(valor) => (
                      <span
                        style={{
                          color: "#CBD5E1",
                        }}
                      >
                        {valor}
                      </span>
                    )}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </section>
      </div>
            <div style={gradeCategorias}>
        <ListaCategorias
          titulo="Entradas por categoria"
          dados={receitasPorCategoria}
          cor="#22C55E"
          formatarMoeda={formatarMoeda}
        />

        <ListaCategorias
          titulo="Despesas por categoria"
          dados={despesasPorCategoria}
          cor="#EF4444"
          formatarMoeda={formatarMoeda}
        />

        <ListaCategorias
          titulo="Investimentos por categoria"
          dados={investimentosPorCategoria}
          cor="#3B82F6"
          formatarMoeda={formatarMoeda}
        />
      </div>

      <section style={painel}>
        <h2 style={tituloPainel}>
          Estatísticas gerais
        </h2>

        <p style={subtituloPainel}>
          Resumo das movimentações selecionadas.
        </p>

        <div style={gradeEstatisticas}>
          <Estatistica
            titulo="Total de movimentações"
            valor={transacoesFiltradas.length}
            icone={<FaReceipt />}
          />

          <Estatistica
            titulo="Patrimônio total"
            valor={formatarMoeda(patrimonioTotal)}
            detalhe="Entradas menos despesas"
            icone={<FaCoins />}
          />

          <Estatistica
            titulo="Saldo disponível"
            valor={formatarMoeda(saldoDisponivel)}
            detalhe="Após investimentos e metas"
            icone={<FaWallet />}
          />

          <Estatistica
            titulo="Categoria com maior despesa"
            valor={
              categoriaMaiorDespesa
                ? categoriaMaiorDespesa.categoria
                : "Nenhuma"
            }
            detalhe={
              categoriaMaiorDespesa
                ? formatarMoeda(
                    categoriaMaiorDespesa.valor
                  )
                : ""
            }
            icone={<FaArrowDown />}
          />

          <Estatistica
            titulo="Categoria com maior entrada"
            valor={
              categoriaMaiorReceita
                ? categoriaMaiorReceita.categoria
                : "Nenhuma"
            }
            detalhe={
              categoriaMaiorReceita
                ? formatarMoeda(
                    categoriaMaiorReceita.valor
                  )
                : ""
            }
            icone={<FaArrowUp />}
          />
        </div>
      </section>
    </div>
  );
}

function CardRelatorio({
  titulo,
  valor,
  detalhe,
  cor,
  icone,
}) {
  return (
    <div style={card}>
      <div
        style={{
          ...iconeCard,
          background: `${cor}22`,
          color: cor,
        }}
      >
        {icone}
      </div>

      <span style={tituloCard}>
        {titulo}
      </span>

      <strong
        style={{
          color: cor,
          fontSize: 23,
        }}
      >
        {valor}
      </strong>

      <small style={detalheCard}>
        {detalhe}
      </small>
    </div>
  );
}

function Destaque({
  titulo,
  item,
  cor,
  formatarMoeda,
}) {
  return (
    <div style={painel}>
      <span style={tituloCard}>
        {titulo}
      </span>

      {item ? (
        <>
          <strong
            style={{
              color: cor,
              fontSize: 24,
              marginTop: 12,
            }}
          >
            {formatarMoeda(item.valor)}
          </strong>

          <span
            style={{
              color: "white",
              marginTop: 8,
              fontWeight: 600,
            }}
          >
            {item.descricao}
          </span>

          <small style={detalheCard}>
            {item.categoria || "Outros"}
          </small>
        </>
      ) : (
        <span
          style={{
            color: "#64748B",
            marginTop: 16,
          }}
        >
          Nenhuma movimentação.
        </span>
      )}
    </div>
  );
}

function ListaCategorias({
  titulo,
  dados,
  cor,
  formatarMoeda,
}) {
  const total = dados.reduce(
    (soma, item) => soma + item.valor,
    0
  );

  return (
    <section style={painel}>
      <h2 style={tituloPainel}>
        {titulo}
      </h2>

      {dados.length === 0 ? (
        <MensagemVazia />
      ) : (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 16,
            marginTop: 20,
          }}
        >
          {dados.map((item) => {
            const porcentagem =
              total > 0
                ? (item.valor / total) * 100
                : 0;

            return (
              <div key={item.categoria}>
                <div style={linhaCategoria}>
                  <span>{item.categoria}</span>

                  <strong
                    style={{
                      color: cor,
                    }}
                  >
                    {formatarMoeda(item.valor)}
                  </strong>
                </div>

                <div style={barraFundo}>
                  <div
                    style={{
                      height: "100%",
                      width: `${porcentagem}%`,
                      background: cor,
                      borderRadius: 999,
                    }}
                  />
                </div>

                <small style={detalheCard}>
                  {porcentagem.toFixed(1)}% do total
                </small>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}

function Estatistica({
  titulo,
  valor,
  detalhe,
  icone,
}) {
  return (
    <div style={estatistica}>
      <div style={iconeEstatistica}>
        {icone}
      </div>

      <div>
        <span style={tituloCard}>
          {titulo}
        </span>

        <strong
          style={{
            display: "block",
            color: "white",
            fontSize: 19,
            marginTop: 6,
          }}
        >
          {valor}
        </strong>

        {detalhe && (
          <small style={detalheCard}>
            {detalhe}
          </small>
        )}
      </div>
    </div>
  );
}

function MensagemVazia() {
  return (
    <div style={mensagemVazia}>
      Nenhum dado encontrado neste período.
    </div>
  );
}

const cabecalho = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: 20,
  marginBottom: 24,
  flexWrap: "wrap",
};

const botaoImprimir = {
  display: "flex",
  alignItems: "center",
  gap: 8,
  padding: "11px 16px",
  border: "none",
  borderRadius: 9,
  background: "#3B82F6",
  color: "white",
  fontWeight: 700,
  cursor: "pointer",
};

const areaFiltros = {
  display: "flex",
  alignItems: "flex-end",
  gap: 14,
  flexWrap: "wrap",
  background: "#1E293B",
  border: "1px solid #334155",
  padding: 18,
  borderRadius: 14,
  marginBottom: 24,
};

const labelFiltro = {
  display: "block",
  color: "#CBD5E1",
  fontSize: 13,
  fontWeight: 600,
  marginBottom: 6,
};

const inputFiltro = {
  minWidth: 170,
  padding: "10px 12px",
  borderRadius: 8,
  border: "1px solid #334155",
  background: "#0F172A",
  color: "white",
  outline: "none",
};

const periodoSelecionado = {
  padding: "10px 14px",
  borderRadius: 8,
  background: "#0F172A",
  color: "#94A3B8",
  fontSize: 14,
};

const gradeCards = {
  display: "grid",
  gridTemplateColumns:
    "repeat(auto-fit, minmax(210px, 1fr))",
  gap: 16,
  marginBottom: 22,
};

const card = {
  display: "flex",
  flexDirection: "column",
  background: "#1E293B",
  border: "1px solid #334155",
  borderRadius: 14,
  padding: 20,
};

const iconeCard = {
  width: 42,
  height: 42,
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  borderRadius: 10,
  fontSize: 18,
  marginBottom: 15,
};

const tituloCard = {
  color: "#94A3B8",
  fontSize: 14,
  fontWeight: 600,
};

const detalheCard = {
  display: "block",
  color: "#64748B",
  marginTop: 7,
  fontSize: 12,
};

const gradeDestaques = {
  display: "grid",
  gridTemplateColumns:
    "repeat(auto-fit, minmax(230px, 1fr))",
  gap: 16,
  marginBottom: 22,
};

const gradeGraficos = {
  display: "grid",
  gridTemplateColumns:
    "repeat(auto-fit, minmax(420px, 1fr))",
  gap: 20,
  marginBottom: 22,
};

const gradeCategorias = {
  display: "grid",
  gridTemplateColumns:
    "repeat(auto-fit, minmax(280px, 1fr))",
  gap: 20,
  marginBottom: 22,
};

const painel = {
  display: "flex",
  flexDirection: "column",
  background: "#1E293B",
  border: "1px solid #334155",
  borderRadius: 14,
  padding: 20,
};

const tituloPainel = {
  color: "white",
  marginTop: 0,
  marginBottom: 5,
  fontSize: 20,
};

const subtituloPainel = {
  color: "#94A3B8",
  marginTop: 0,
  marginBottom: 18,
  fontSize: 14,
};

const tooltip = {
  background: "#0F172A",
  border: "1px solid #334155",
  borderRadius: 10,
  color: "white",
};

const linhaCategoria = {
  display: "flex",
  justifyContent: "space-between",
  gap: 10,
  color: "#E2E8F0",
  fontSize: 14,
};

const barraFundo = {
  width: "100%",
  height: 7,
  background: "#0F172A",
  borderRadius: 999,
  marginTop: 8,
  overflow: "hidden",
};

const gradeEstatisticas = {
  display: "grid",
  gridTemplateColumns:
    "repeat(auto-fit, minmax(220px, 1fr))",
  gap: 14,
  marginTop: 8,
};

const estatistica = {
  display: "flex",
  alignItems: "center",
  gap: 14,
  background: "#0F172A",
  border: "1px solid #334155",
  borderRadius: 11,
  padding: 16,
};

const iconeEstatistica = {
  width: 40,
  height: 40,
  flexShrink: 0,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  borderRadius: 9,
  background: "rgba(59, 130, 246, 0.15)",
  color: "#60A5FA",
};

const mensagemVazia = {
  minHeight: 180,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: "#64748B",
  textAlign: "center",
  border: "1px dashed #475569",
  borderRadius: 10,
  marginTop: 15,
};

export default Relatorios;