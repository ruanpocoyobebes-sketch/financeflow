import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
} from "recharts";

const COLORS = {
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
  const valores = {
    receitas: Number(receitas) || 0,
    despesas: Number(despesas) || 0,
    investimentos: Number(investimentos) || 0,
    metas: Number(metas) || 0,
  };

  const total =
    valores.receitas +
    valores.despesas +
    valores.investimentos +
    valores.metas;

  const data = [
    {
      name: "Receitas",
      value: valores.receitas,
    },
    {
      name: "Despesas",
      value: valores.despesas,
    },
    {
      name: "Investimentos",
      value: valores.investimentos,
    },
    {
      name: "Metas",
      value: valores.metas,
    },
  ].filter((item) => item.value > 0);

  function formatar(valor) {
    return Number(valor).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  }

  function renderLabel({ percent }) {
    if (!percent) return "";

    return `${(percent * 100).toFixed(0)}%`;
  }

  return (
    <div
      style={{
        background: "#1E293B",
        borderRadius: 16,
        padding: 25,
        marginTop: 30,
        boxShadow: "0 10px 30px rgba(0,0,0,0.25)",
        border: "1px solid #334155",
      }}
    >
      <h2
        style={{
          color: "white",
          marginTop: 0,
          marginBottom: 5,
        }}
      >
        Resumo Financeiro
      </h2>

      <p
        style={{
          color: "#94A3B8",
          marginTop: 0,
          marginBottom: 20,
        }}
      >
        Distribuição das movimentações e valores guardados
      </p>

      <div
        style={{
          width: "100%",
          height: 340,
        }}
      >
        {data.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
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
                  formatar(value),
                  name,
                ]}
                contentStyle={{
                  background: "#0F172A",
                  border: "1px solid #334155",
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
            }}
          >
            Nenhuma movimentação encontrada.
          </div>
        )}
      </div>

      <div
        style={{
          textAlign: "center",
          marginTop: 10,
          paddingTop: 20,
          borderTop: "1px solid #334155",
        }}
      >
        <span
          style={{
            color: "#94A3B8",
            fontSize: 14,
          }}
        >
          Total movimentado
        </span>

        <h2
          style={{
            color: "white",
            marginTop: 5,
            marginBottom: 0,
          }}
        >
          {formatar(total)}
        </h2>
      </div>
    </div>
  );
}

export default Chart;
