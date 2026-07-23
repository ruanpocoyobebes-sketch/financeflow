import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
} from "recharts";

import { useSettings } from "../context/SettingsContext";

const CORES_PATRIMONIO = {
  "Saldo disponível": "#22C55E",
  Investimentos: "#3B82F6",
  Metas: "#A855F7",
};

const CORES_FLUXO = {
  Receitas: "#22C55E",
  Despesas: "#EF4444",
  Investimentos: "#3B82F6",
  Metas: "#A855F7",
};

function Chart({
  receitas = 0,
  despesas = 0,
  investimentos = 0,
  metas = 0,
}) {
  const { formatarMoeda } = useSettings();

  const totalReceitas = Math.max(
    Number(receitas) || 0,
    0
  );

  const totalDespesas = Math.max(
    Number(despesas) || 0,
    0
  );

  const totalInvestimentos = Math.max(
    Number(investimentos) || 0,
    0
  );

  const totalMetas = Math.max(
    Number(metas) || 0,
    0
  );

  const saldoDisponivel =
    totalReceitas -
    totalDespesas -
    totalInvestimentos -
    totalMetas;

  const patrimonioTotal =
    totalReceitas - totalDespesas;

  const saldoExibido = Math.max(
    saldoDisponivel,
    0
  );

  const dadosPatrimonio = [
    {
      name: "Saldo disponível",
      value: saldoExibido,
    },
    {
      name: "Investimentos",
      value: totalInvestimentos,
    },
    {
      name: "Metas",
      value: totalMetas,
    },
  ].filter((item) => item.value > 0);

  const dadosFluxo = [
    {
      name: "Receitas",
      value: totalReceitas,
    },
    {
      name: "Despesas",
      value: totalDespesas,
    },
    {
      name: "Investimentos",
      value: totalInvestimentos,
    },
    {
      name: "Metas",
      value: totalMetas,
    },
  ].filter((item) => item.value > 0);

  function renderLabel({ percent }) {
    if (!percent || percent < 0.04) {
      return "";
    }

    return `${(percent * 100).toFixed(0)}%`;
  }

  function GraficoPizza({
    titulo,
    descricao,
    dados,
    cores,
    mensagemVazia,
  }) {
    return (
      <section
        style={{
          background: "#1E293B",
          borderRadius: 16,
          padding: 24,
          border: "1px solid #334155",
          boxShadow:
            "0 10px 30px rgba(0,0,0,0.22)",
          minWidth: 0,
        }}
      >
        <div>
          <h2
            style={{
              color: "white",
              marginTop: 0,
              marginBottom: 5,
              fontSize: 22,
            }}
          >
            {titulo}
          </h2>

          <p
            style={{
              color: "#94A3B8",
              marginTop: 0,
              marginBottom: 0,
              fontSize: 14,
            }}
          >
            {descricao}
          </p>
        </div>

        <div
          style={{
            width: "100%",
            height: 320,
            marginTop: 10,
          }}
        >
          {dados.length > 0 ? (
            <ResponsiveContainer
              width="100%"
              height="100%"
            >
              <PieChart>
                <Pie
                  data={dados}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="45%"
                  innerRadius={62}
                  outerRadius={100}
                  paddingAngle={4}
                  animationDuration={800}
                  label={renderLabel}
                  labelLine={false}
                >
                  {dados.map((item) => (
                    <Cell
                      key={item.name}
                      fill={cores[item.name]}
                      stroke="#1E293B"
                      strokeWidth={2}
                    />
                  ))}
                </Pie>

                <Tooltip
                  formatter={(value, name) => [
                    formatarMoeda(value),
                    name,
                  ]}
                  contentStyle={{
                    background: "#0F172A",
                    border:
                      "1px solid #334155",
                    borderRadius: 10,
                    color: "white",
                  }}
                  labelStyle={{
                    color: "white",
                  }}
                  itemStyle={{
                    color: "white",
                  }}
                />

                <Legend
                  verticalAlign="bottom"
                  align="center"
                  iconType="circle"
                  formatter={(value) => (
                    <span
                      style={{
                        color: "#E2E8F0",
                      }}
                    >
                      {value}
                    </span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div
              style={{
                height: "100%",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                color: "#94A3B8",
                textAlign: "center",
                padding: 20,
              }}
            >
              {mensagemVazia}
            </div>
          )}
        </div>
      </section>
    );
  }

  return (
    <div
      style={{
        marginTop: 30,
      }}
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit, minmax(420px, 1fr))",
          gap: 20,
        }}
      >
        <GraficoPizza
          titulo="Distribuição do patrimônio"
          descricao="Veja onde seu patrimônio está atualmente."
          dados={dadosPatrimonio}
          cores={CORES_PATRIMONIO}
          mensagemVazia="Nenhum patrimônio registrado no período."
        />

        <GraficoPizza
          titulo="Fluxo financeiro"
          descricao="Compare receitas, despesas, investimentos e metas."
          dados={dadosFluxo}
          cores={CORES_FLUXO}
          mensagemVazia="Nenhuma movimentação registrada no período."
        />
      </div>

      {saldoDisponivel < 0 && (
        <div
          style={{
            background:
              "rgba(239, 68, 68, 0.1)",
            border:
              "1px solid rgba(239, 68, 68, 0.35)",
            borderRadius: 12,
            padding: 14,
            marginTop: 20,
            color: "#FCA5A5",
            textAlign: "center",
          }}
        >
          As saídas ultrapassaram o dinheiro disponível em{" "}
          <strong>
            {formatarMoeda(
              Math.abs(saldoDisponivel)
            )}
          </strong>
          .
        </div>
      )}

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit, minmax(180px, 1fr))",
          gap: 15,
          marginTop: 20,
        }}
      >
        <Resumo
          titulo="Patrimônio total"
          valor={formatarMoeda(patrimonioTotal)}
          cor={
            patrimonioTotal >= 0
              ? "#FFFFFF"
              : "#EF4444"
          }
        />

        <Resumo
          titulo="Saldo disponível"
          valor={formatarMoeda(saldoDisponivel)}
          cor={
            saldoDisponivel >= 0
              ? "#22C55E"
              : "#EF4444"
          }
        />

        <Resumo
          titulo="Total em despesas"
          valor={formatarMoeda(totalDespesas)}
          cor="#EF4444"
        />

        <Resumo
          titulo="Total investido"
          valor={formatarMoeda(totalInvestimentos)}
          cor="#3B82F6"
        />

        <Resumo
          titulo="Guardado em metas"
          valor={formatarMoeda(totalMetas)}
          cor="#A855F7"
        />
      </div>
    </div>
  );
}

function Resumo({
  titulo,
  valor,
  cor,
}) {
  return (
    <div
      style={{
        textAlign: "center",
        background: "#0F172A",
        border: "1px solid #334155",
        borderRadius: 12,
        padding: 16,
      }}
    >
      <span
        style={{
          color: "#94A3B8",
          fontSize: 13,
        }}
      >
        {titulo}
      </span>

      <h2
        style={{
          color: cor,
          marginTop: 6,
          marginBottom: 0,
          fontSize: 21,
        }}
      >
        {valor}
      </h2>
    </div>
  );
}

export default Chart;