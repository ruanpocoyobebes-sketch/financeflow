import { useState } from "react";

import { useFinance } from "../context/FinanceContext";
import { useSettings } from "../context/SettingsContext";

import Navbar from "../components/Navbar";
import Card from "../components/Card";
import TransactionList from "../components/TransactionList";
import FinanceModal from "../components/FinanceModal";
import Chart from "../components/Chart";
import DateFilter from "../components/DateFilter";

function Dashboard() {
  const [modalAberto, setModalAberto] = useState(false);
  const [transacaoEditando, setTransacaoEditando] = useState(null);

  const [dataInicial, setDataInicial] = useState("");
  const [dataFinal, setDataFinal] = useState("");

  const { transacoes, metas } = useFinance();
  const { settings } = useSettings();

  const transacoesFiltradas = transacoes.filter((item) => {
    if (!dataInicial && !dataFinal) return true;

    const partes = item.data.split("/");

    const data = new Date(
      `${partes[2]}-${partes[1]}-${partes[0]}`
    );

    if (dataInicial && data < new Date(dataInicial)) {
      return false;
    }

    if (dataFinal) {
      const final = new Date(dataFinal);
      final.setHours(23, 59, 59, 999);

      if (data > final) {
        return false;
      }
    }

    return true;
  });

  const receitasFiltradas = transacoesFiltradas
    .filter((item) => item.tipo === "Receita")
    .reduce((total, item) => total + Number(item.valor), 0);

  const despesasFiltradas = transacoesFiltradas
    .filter((item) => item.tipo === "Despesa")
    .reduce((total, item) => total + Number(item.valor), 0);

  const investimentosFiltrados = transacoesFiltradas
    .filter((item) => item.tipo === "Investimento")
    .reduce((total, item) => total + Number(item.valor), 0);

  const totalMetas = metas.reduce(
    (total, meta) => total + Number(meta.valorAtual || 0),
    0
  );

  const totalObjetivosMetas = metas.reduce(
    (total, meta) => total + Number(meta.valorAlvo || 0),
    0
  );

  const saldoFiltrado =
    receitasFiltradas -
    despesasFiltradas -
    investimentosFiltrados -
    totalMetas;

  const percentualGastos =
    receitasFiltradas > 0
      ? (despesasFiltradas / receitasFiltradas) * 100
      : 0;

  const percentualInvestido =
    receitasFiltradas > 0
      ? (investimentosFiltrados / receitasFiltradas) * 100
      : 0;

  const percentualMetas =
    totalObjetivosMetas > 0
      ? (totalMetas / totalObjetivosMetas) * 100
      : 0;

  const despesasPorCategoria = transacoesFiltradas
    .filter((item) => item.tipo === "Despesa")
    .reduce((categorias, item) => {
      const categoria = item.categoria || "Sem categoria";

      categorias[categoria] =
        (categorias[categoria] || 0) + Number(item.valor);

      return categorias;
    }, {});

  const maiorCategoriaDespesa = Object.entries(
    despesasPorCategoria
  ).sort((a, b) => b[1] - a[1])[0];

  function formatarMoeda(valor) {
    return Number(valor || 0).toLocaleString("pt-BR", {
      style: "currency",
      currency: settings.moeda || "BRL",
      minimumFractionDigits: settings.mostrarCentavos ? 2 : 0,
      maximumFractionDigits: settings.mostrarCentavos ? 2 : 0,
    });
  }

  function abrirNovaTransacao() {
    setTransacaoEditando(null);
    setModalAberto(true);
  }

  function abrirEdicao(transacao) {
    setTransacaoEditando(transacao);
    setModalAberto(true);
  }

  function fecharModal() {
    setModalAberto(false);
    setTransacaoEditando(null);
  }

  function obterSaudacao() {
    const horaAtual = new Date().getHours();

    if (horaAtual >= 5 && horaAtual < 12) {
      return {
        texto: "Bom dia",
        emoji: "🌅",
      };
    }

    if (horaAtual >= 12 && horaAtual < 18) {
      return {
        texto: "Boa tarde",
        emoji: "☀️",
      };
    }

    return {
      texto: "Boa noite",
      emoji: "🌙",
    };
  }

  function obterDataAtual() {
    return new Intl.DateTimeFormat("pt-BR", {
      weekday: "long",
      day: "2-digit",
      month: "long",
      year: "numeric",
    }).format(new Date());
  }

  function criarInsights() {
    const insights = [];

    if (transacoesFiltradas.length === 0) {
      insights.push({
        titulo: "Nenhuma movimentação no período",
        descricao:
          "Cadastre receitas, despesas ou investimentos para receber análises financeiras.",
        icone: "📊",
        cor: "#3B82F6",
      });

      return insights;
    }

    if (saldoFiltrado < 0) {
      insights.push({
        titulo: "Saldo negativo",
        descricao: `Suas saídas ultrapassaram as receitas em ${formatarMoeda(
          Math.abs(saldoFiltrado)
        )}.`,
        icone: "⚠️",
        cor: "#EF4444",
      });
    } else if (saldoFiltrado > 0) {
      insights.push({
        titulo: "Saldo positivo",
        descricao: `Você ainda possui ${formatarMoeda(
          saldoFiltrado
        )} disponível neste período.`,
        icone: "✅",
        cor: "#22C55E",
      });
    }

    if (receitasFiltradas > 0 && percentualGastos >= 80) {
      insights.push({
        titulo: "Gastos elevados",
        descricao: `Suas despesas consomem ${percentualGastos.toFixed(
          1
        )}% das receitas.`,
        icone: "🚨",
        cor: "#F97316",
      });
    } else if (
      receitasFiltradas > 0 &&
      percentualGastos <= 50
    ) {
      insights.push({
        titulo: "Bom controle de gastos",
        descricao: `Você utilizou ${percentualGastos.toFixed(
          1
        )}% das receitas com despesas.`,
        icone: "💚",
        cor: "#22C55E",
      });
    }

    if (receitasFiltradas > 0 && percentualInvestido >= 20) {
      insights.push({
        titulo: "Ótimo ritmo de investimentos",
        descricao: `${percentualInvestido.toFixed(
          1
        )}% das receitas foram direcionadas para investimentos.`,
        icone: "📈",
        cor: "#3B82F6",
      });
    } else if (
      receitasFiltradas > 0 &&
      investimentosFiltrados === 0
    ) {
      insights.push({
        titulo: "Nenhum investimento registrado",
        descricao:
          "Considere separar uma parte das receitas para investimentos.",
        icone: "💡",
        cor: "#EAB308",
      });
    }

    if (maiorCategoriaDespesa) {
      insights.push({
        titulo: "Maior categoria de gasto",
        descricao: `${
          maiorCategoriaDespesa[0]
        } representa ${formatarMoeda(
          maiorCategoriaDespesa[1]
        )} em despesas.`,
        icone: "🏷️",
        cor: "#A855F7",
      });
    }

    if (metas.length > 0) {
      insights.push({
        titulo: "Progresso das metas",
        descricao: `Você já alcançou ${Math.min(
          percentualMetas,
          100
        ).toFixed(1)}% do valor total das suas metas.`,
        icone: "🎯",
        cor: "#A855F7",
      });
    }

    return insights.slice(0, 5);
  }

  const saudacao = obterSaudacao();
  const nomeUsuario = settings.nome?.trim();

  const primeiraLetra = nomeUsuario
    ? nomeUsuario.charAt(0).toUpperCase()
    : "F";

  const insights = criarInsights();

  return (
    <div>
      <Navbar />

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginTop: 25,
          marginBottom: 25,
          gap: 20,
          flexWrap: "wrap",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
          }}
        >
          <div
            style={{
              width: 58,
              height: 58,
              borderRadius: "50%",
              background:
                "linear-gradient(135deg, #22C55E, #16A34A)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
              fontSize: 24,
              fontWeight: "bold",
              flexShrink: 0,
              boxShadow:
                "0 8px 20px rgba(34, 197, 94, 0.25)",
            }}
          >
            {primeiraLetra}
          </div>

          <div>
            <h1
              style={{
                color: "white",
                margin: 0,
                fontSize: 30,
              }}
            >
              {saudacao.emoji} {saudacao.texto}
              {nomeUsuario ? `, ${nomeUsuario}` : ""}
            </h1>

            <p
              style={{
                color: "#94A3B8",
                marginTop: 8,
                marginBottom: 0,
                textTransform: "capitalize",
              }}
            >
              {obterDataAtual()}
            </p>

            <p
              style={{
                color: "#64748B",
                marginTop: 6,
                marginBottom: 0,
              }}
            >
              Confira como estão suas finanças hoje.
            </p>
          </div>
        </div>

        <button
          onClick={abrirNovaTransacao}
          style={{
            background: "#22C55E",
            color: "white",
            border: "none",
            borderRadius: 10,
            padding: "14px 22px",
            cursor: "pointer",
            fontWeight: "bold",
            fontSize: 15,
            boxShadow:
              "0 8px 20px rgba(34, 197, 94, 0.2)",
          }}
        >
          + Nova Transação
        </button>
      </div>

      <DateFilter
        dataInicial={dataInicial}
        setDataInicial={setDataInicial}
        dataFinal={dataFinal}
        setDataFinal={setDataFinal}
      />

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit, minmax(220px, 1fr))",
          gap: 20,
        }}
      >
        <Card
          titulo="Saldo disponível"
          valor={saldoFiltrado}
          cor={saldoFiltrado >= 0 ? "#22C55E" : "#EF4444"}
        />

        <Card
          titulo="Receitas"
          valor={receitasFiltradas}
          cor="#22C55E"
        />

        <Card
          titulo="Despesas"
          valor={despesasFiltradas}
          cor="#EF4444"
        />

        <Card
          titulo="Investimentos"
          valor={investimentosFiltrados}
          cor="#3B82F6"
        />

        <Card
          titulo="Guardado em metas"
          valor={totalMetas}
          cor="#A855F7"
        />
      </div>
            <section
        style={{
          marginTop: 30,
          background: "#111827",
          border: "1px solid #1F2937",
          borderRadius: 16,
          padding: 24,
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 15,
            flexWrap: "wrap",
            marginBottom: 20,
          }}
        >
          <div>
            <h2
              style={{
                color: "white",
                margin: 0,
                marginBottom: 7,
              }}
            >
              🧠 Análise inteligente
            </h2>

            <p
              style={{
                color: "#94A3B8",
                margin: 0,
              }}
            >
              Insights gerados a partir das suas movimentações.
            </p>
          </div>

          <div
            style={{
              background: "#1E293B",
              color: "#CBD5E1",
              padding: "9px 13px",
              borderRadius: 999,
              fontSize: 13,
              border: "1px solid #334155",
            }}
          >
            {transacoesFiltradas.length} movimentações analisadas
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(260px, 1fr))",
            gap: 16,
          }}
        >
          {insights.map((insight, indice) => (
            <div
              key={`${insight.titulo}-${indice}`}
              style={{
                background: "#1E293B",
                borderRadius: 14,
                padding: 18,
                border: `1px solid ${insight.cor}55`,
                display: "flex",
                alignItems: "flex-start",
                gap: 14,
              }}
            >
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 12,
                  background: `${insight.cor}22`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 22,
                  flexShrink: 0,
                }}
              >
                {insight.icone}
              </div>

              <div>
                <h3
                  style={{
                    color: insight.cor,
                    margin: 0,
                    marginBottom: 7,
                    fontSize: 16,
                  }}
                >
                  {insight.titulo}
                </h3>

                <p
                  style={{
                    color: "#CBD5E1",
                    margin: 0,
                    lineHeight: 1.5,
                    fontSize: 14,
                  }}
                >
                  {insight.descricao}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {metas.length > 0 && (
        <section
          style={{
            marginTop: 30,
            background: "#1E293B",
            borderRadius: 16,
            padding: 24,
            border: "1px solid #334155",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: 15,
              flexWrap: "wrap",
              marginBottom: 14,
            }}
          >
            <div>
              <h2
                style={{
                  color: "white",
                  margin: 0,
                  marginBottom: 6,
                }}
              >
                🎯 Progresso geral das metas
              </h2>

              <p
                style={{
                  color: "#94A3B8",
                  margin: 0,
                }}
              >
                {formatarMoeda(totalMetas)} de{" "}
                {formatarMoeda(totalObjetivosMetas)}
              </p>
            </div>

            <strong
              style={{
                color: "#A855F7",
                fontSize: 20,
              }}
            >
              {Math.min(percentualMetas, 100).toFixed(1)}%
            </strong>
          </div>

          <div
            style={{
              width: "100%",
              height: 12,
              background: "#0F172A",
              borderRadius: 999,
              overflow: "hidden",
            }}
          >
            <div
              style={{
                width: `${Math.min(percentualMetas, 100)}%`,
                height: "100%",
                background:
                  "linear-gradient(90deg, #A855F7, #7C3AED)",
                borderRadius: 999,
                transition: "width 0.4s ease",
              }}
            />
          </div>
        </section>
      )}

      <Chart
        receitas={receitasFiltradas}
        despesas={despesasFiltradas}
        investimentos={investimentosFiltrados}
        metas={totalMetas}
      />

      <div
        style={{
          marginTop: 30,
        }}
      >
        <TransactionList
          transacoes={transacoesFiltradas}
          abrirEdicao={abrirEdicao}
          dataInicial={dataInicial}
          dataFinal={dataFinal}
        />
      </div>

      <FinanceModal
        aberto={modalAberto}
        fechar={fecharModal}
        transacaoEditando={transacaoEditando}
      />
    </div>
  );
}

export default Dashboard;