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
  const {
    formatarMoeda,
    cores,
  } = useSettings();

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
    coresGrafico,
    mensagemVazia,
  }) {
        return (
      <section
        style={{
          background: cores.painel,
          borderRadius: 18,
          padding: 24,
          border: `1px solid ${cores.borda}`,
          boxShadow: cores.sombra,
          minWidth: 0,
          transition: ".25s",
        }}
      >
        <div
          style={{
            marginBottom: 18,
          }}
        >
          <h2
            style={{
              color: cores.texto,
              margin: 0,
              marginBottom: 6,
              fontSize: 22,
              fontWeight: 700,
            }}
          >
            {titulo}
          </h2>

          <p
            style={{
              color: cores.textoSecundario,
              margin: 0,
              fontSize: 14,
              lineHeight: 1.5,
            }}
          >
            {descricao}
          </p>
        </div>

        <div
          style={{
            width: "100%",
            height: 330,
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
                  innerRadius={70}
                  outerRadius={108}
                  paddingAngle={4}
                  animationDuration={900}
                  label={renderLabel}
                  labelLine={false}
                >
                  {dados.map((item) => (
                    <Cell
                      key={item.name}
                      fill={coresGrafico[item.name]}
                      stroke={cores.painel}
                      strokeWidth={3}
                    />
                  ))}
                </Pie>

                <Tooltip
                  formatter={(value, name) => [
                    formatarMoeda(value),
                    name,
                  ]}
                  contentStyle={{
                    background: cores.painel,
                    border: `1px solid ${cores.borda}`,
                    borderRadius: 12,
                    color: cores.texto,
                    boxShadow: cores.sombra,
                  }}
                  labelStyle={{
                    color: cores.texto,
                  }}
                  itemStyle={{
                    color: cores.texto,
                  }}
                />

                <Legend
                  verticalAlign="bottom"
                  align="center"
                  iconType="circle"
                  formatter={(value) => (
                    <span
                      style={{
                        color: cores.texto,
                        fontSize: 14,
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
                color: cores.textoSecundario,
                textAlign: "center",
                padding: 20,
                fontSize: 15,
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
          coresGrafico={CORES_PATRIMONIO}
          mensagemVazia="Nenhum patrimônio registrado no período."
        />

        <GraficoPizza
          titulo="Fluxo financeiro"
          descricao="Compare receitas, despesas, investimentos e metas."
          dados={dadosFluxo}
          coresGrafico={CORES_FLUXO}
          mensagemVazia="Nenhuma movimentação registrada no período."
        />
      </div>

      {saldoDisponivel < 0 && (
        <div
          style={{
            background: "rgba(239,68,68,.12)",
            border: "1px solid rgba(239,68,68,.35)",
            borderRadius: 14,
            padding: 16,
            marginTop: 20,
            color: "#EF4444",
            textAlign: "center",
            fontWeight: 600,
          }}
        >
          ⚠️ As saídas ultrapassaram o dinheiro disponível em{" "}
          <strong>
            {formatarMoeda(Math.abs(saldoDisponivel))}
          </strong>
        </div>
      )}

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit, minmax(190px, 1fr))",
          gap: 18,
          marginTop: 24,
        }}
      >
        <Resumo
          titulo="Patrimônio"
          valor={formatarMoeda(patrimonioTotal)}
          cor={
            patrimonioTotal >= 0
              ? "#22C55E"
              : "#EF4444"
          }
        />

        <Resumo
          titulo="Saldo"
          valor={formatarMoeda(saldoDisponivel)}
          cor={
            saldoDisponivel >= 0
              ? "#22C55E"
              : "#EF4444"
          }
        />

        <Resumo
          titulo="Despesas"
          valor={formatarMoeda(totalDespesas)}
          cor="#EF4444"
        />

        <Resumo
          titulo="Investimentos"
          valor={formatarMoeda(totalInvestimentos)}
          cor="#3B82F6"
        />

        <Resumo
          titulo="Metas"
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
  const { cores } = useSettings();

  return (
    <div
      style={{
        background: cores.painel,
        border: `1px solid ${cores.borda}`,
        borderRadius: 16,
        padding: 18,
        textAlign: "center",
        boxShadow: cores.sombra,
        transition: ".25s",
      }}
    >
      <p
        style={{
          margin: 0,
          color: cores.textoSecundario,
          fontSize: 13,
        }}
      >
        {titulo}
      </p>

      <h2
        style={{
          marginTop: 10,
          marginBottom: 0,
          color: cor,
          fontSize: 22,
          fontWeight: 700,
        }}
      >
        {valor}
      </h2>
    </div>
  );
}

export default Chart;