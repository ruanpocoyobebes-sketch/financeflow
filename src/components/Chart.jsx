import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
} from "recharts";

import { useSettings } from "../context/SettingsContext";

const COLORS = {
  "Saldo disponível": "#22C55E",
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

  const data = [
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

  function renderLabel({ percent }) {
    if (!percent || percent < 0.04) {
      return "";
    }

    return `${(percent * 100).toFixed(0)}%`;
  }

  return (
    <div
      style={{
        background: "#1E293B",
        borderRadius: 16,
        padding: 25,
        marginTop: 30,
        boxShadow:
          "0 10px 30px rgba(0,0,0,0.25)",
        border: "1px solid #334155",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: 20,
          flexWrap: "wrap",
        }}
      >
        <div>
          <h2
            style={{
              color: "white",
              marginTop: 0,
              marginBottom: 5,
            }}
          >
            Distribuição do patrimônio
          </h2>

          <p
            style={{
              color: "#94A3B8",
              marginTop: 0,
              marginBottom: 0,
            }}
          >
            Veja onde seu dinheiro está atualmente.
          </p>
        </div>

        <div
          style={{
            background:
              saldoDisponivel >= 0
                ? "rgba(34, 197, 94, 0.12)"
                : "rgba(239, 68, 68, 0.12)",
            border:
              saldoDisponivel >= 0
                ? "1px solid rgba(34, 197, 94, 0.35)"
                : "1px solid rgba(239, 68, 68, 0.35)",
            borderRadius: 12,
            padding: "10px 14px",
          }}
        >
          <span
            style={{
              display: "block",
              color: "#94A3B8",
              fontSize: 12,
              marginBottom: 4,
            }}
          >
            Saldo disponível
          </span>

          <strong
            style={{
              color:
                saldoDisponivel >= 0
                  ? "#22C55E"
                  : "#EF4444",
              fontSize: 17,
            }}
          >
            {formatarMoeda(saldoDisponivel)}
          </strong>
        </div>
      </div>

      <div
        style={{
          width: "100%",
          height: 340,
          marginTop: 15,
        }}
      >
        {data.length > 0 ? (
          <ResponsiveContainer
            width="100%"
            height="100%"
          >
            <PieChart>
              <Pie
                data={data}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="47%"
                innerRadius={70}
                outerRadius={110}
                paddingAngle={4}
                animationDuration={800}
                label={renderLabel}
                labelLine={false}
              >
                {data.map((item) => (
                  <Cell
                    key={item.name}
                    fill={COLORS[item.name]}
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
            }}
          >
            Nenhum patrimônio registrado no período.
          </div>
        )}
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
            marginBottom: 20,
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
          paddingTop: 20,
          borderTop: "1px solid #334155",
        }}
      >
        <div
          style={{
            textAlign: "center",
            background: "#0F172A",
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
            Patrimônio total
          </span>

          <h2
            style={{
              color:
                patrimonioTotal >= 0
                  ? "#FFFFFF"
                  : "#EF4444",
              marginTop: 6,
              marginBottom: 0,
            }}
          >
            {formatarMoeda(patrimonioTotal)}
          </h2>
        </div>

        <div
          style={{
            textAlign: "center",
            background: "#0F172A",
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
            Total investido
          </span>

          <h2
            style={{
              color: "#3B82F6",
              marginTop: 6,
              marginBottom: 0,
            }}
          >
            {formatarMoeda(totalInvestimentos)}
          </h2>
        </div>

        <div
          style={{
            textAlign: "center",
            background: "#0F172A",
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
            Guardado em metas
          </span>

          <h2
            style={{
              color: "#A855F7",
              marginTop: 6,
              marginBottom: 0,
            }}
          >
            {formatarMoeda(totalMetas)}
          </h2>
        </div>
      </div>
    </div>
  );
}

export default Chart;