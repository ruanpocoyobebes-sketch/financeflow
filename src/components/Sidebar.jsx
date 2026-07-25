import { useMemo, useRef, useState } from "react";
import { NavLink } from "react-router-dom";

import {
  FaArrowDown,
  FaArrowUp,
  FaBrain,
  FaBullseye,
  FaChartLine,
  FaChartPie,
  FaCog,
  FaFileAlt,
} from "react-icons/fa";

import { useFinance } from "../context/FinanceContext";
import { useSettings } from "../context/SettingsContext";

const menu = [
  {
    nome: "Dashboard",
    rota: "/app",
    icone: <FaChartPie />,
  },
  {
    nome: "Receitas",
    rota: "/app/receitas",
    icone: <FaArrowUp />,
    tipoValor: "receitas",
    corValor: "#22C55E",
  },
  {
    nome: "Despesas",
    rota: "/app/despesas",
    icone: <FaArrowDown />,
    tipoValor: "despesas",
    corValor: "#EF4444",
  },
  {
    nome: "Investimentos",
    rota: "/app/investimentos",
    icone: <FaChartLine />,
    tipoValor: "investimentos",
    corValor: "#3B82F6",
  },
  {
    nome: "Metas",
    rota: "/app/metas",
    icone: <FaBullseye />,
    tipoValor: "metas",
    corValor: "#A855F7",
  },
  {
    nome: "Relatórios",
    rota: "/app/relatorios",
    icone: <FaFileAlt />,
  },
  {
    nome: "Análise com IA",
    rota: "/app/analise-ia",
    icone: <FaBrain />,
    premium: true,
  },
  {
    nome: "Configurações",
    rota: "/app/configuracoes",
    icone: <FaCog />,
  },
];

function Sidebar() {
  const [expandida, setExpandida] = useState(false);

  const temporizadorAbrir = useRef(null);
  const temporizadorFechar = useRef(null);

  const { transacoes, metas } = useFinance();
  const { formatarMoeda } = useSettings();

  const valoresFinanceiros = useMemo(() => {
    const listaTransacoes = Array.isArray(transacoes)
      ? transacoes
      : [];

    const listaMetas = Array.isArray(metas)
      ? metas
      : [];

    const receitas = listaTransacoes
      .filter((item) => item.tipo === "Receita")
      .reduce(
        (total, item) => total + Number(item.valor || 0),
        0
      );

    const despesas = listaTransacoes
      .filter((item) => item.tipo === "Despesa")
      .reduce(
        (total, item) => total + Number(item.valor || 0),
        0
      );

    const investimentos = listaTransacoes
      .filter((item) => item.tipo === "Investimento")
      .reduce(
        (total, item) => total + Number(item.valor || 0),
        0
      );

    const totalMetas = listaMetas.reduce(
      (total, meta) =>
        total + Number(meta.valorAtual || 0),
      0
    );

    const saldoDisponivel =
      receitas -
      despesas -
      investimentos -
      totalMetas;

    const patrimonioTotal =
      saldoDisponivel +
      investimentos +
      totalMetas;

    return {
      receitas,
      despesas,
      investimentos,
      metas: totalMetas,
      saldoDisponivel,
      patrimonioTotal,
    };
  }, [transacoes, metas]);

  function obterValorMenu(tipoValor) {
    if (!tipoValor) {
      return null;
    }

    return valoresFinanceiros[tipoValor] || 0;
  }

  function abrirSidebar() {
    clearTimeout(temporizadorFechar.current);

    temporizadorAbrir.current = setTimeout(() => {
      setExpandida(true);
    }, 140);
  }

  function fecharSidebar() {
    clearTimeout(temporizadorAbrir.current);

    temporizadorFechar.current = setTimeout(() => {
      setExpandida(false);
    }, 180);
  }

  return (
    <aside
      onMouseEnter={abrirSidebar}
      onMouseLeave={fecharSidebar}
      style={{
        width: expandida ? 275 : 76,
        minWidth: expandida ? 275 : 76,
        height: "100vh",
        position: "sticky",
        top: 0,
        background: "var(--bg-secondary, #111c2f)",
        color: "var(--text-primary, #ffffff)",
        padding: expandida
          ? "24px 16px"
          : "24px 10px",
        display: "flex",
        flexDirection: "column",
        boxSizing: "border-box",
        overflow: "hidden",
        borderRight: "1px solid var(--border-color, #334155)",
        boxShadow: expandida
          ? "10px 0 40px rgba(0, 0, 0, 0.35)"
          : "5px 0 15px rgba(0, 0, 0, 0.15)",
        transition:
          "width 0.5s cubic-bezier(.22, 1, .36, 1), min-width 0.5s cubic-bezier(.22, 1, .36, 1), padding 0.5s cubic-bezier(.22, 1, .36, 1), box-shadow 0.45s ease",
        zIndex: 100,
      }}
    >
      <div
        style={{
          minHeight: 44,
          marginBottom: expandida ? 18 : 30,
          display: "flex",
          alignItems: "center",
          justifyContent: expandida
            ? "flex-start"
            : "center",
          gap: 10,
          whiteSpace: "nowrap",
        }}
      >
        <span
          style={{
            width: 34,
            height: 34,
            minWidth: 34,
            borderRadius: 11,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#ffffff",
            background:
              "linear-gradient(135deg, #22c55e, #16a34a)",
            fontSize: 15,
            fontWeight: 850,
            boxShadow:
              "0 8px 20px rgba(34, 197, 94, 0.25)",
            transform: expandida
              ? "scale(1)"
              : "scale(0.95)",
            transition: "transform 0.35s ease",
          }}
        >
          M
        </span>

        <h2
          style={{
            margin: 0,
            color: "var(--accent, #22c55e)",
            fontSize: 19,
            opacity: expandida ? 1 : 0,
            width: expandida ? 180 : 0,
            overflow: "hidden",
            transform: expandida
              ? "translateX(0)"
              : "translateX(-18px)",
            transition: expandida
              ? "opacity 0.25s ease 0.18s, transform 0.35s ease 0.12s, width 0.5s cubic-bezier(.22, 1, .36, 1)"
              : "opacity 0.15s ease, transform 0.25s ease, width 0.5s cubic-bezier(.22, 1, .36, 1)",
            pointerEvents: "none",
          }}
        >
          MahaFinance
        </h2>
      </div>

      <div
        style={{
          height: expandida ? 105 : 0,
          marginBottom: expandida ? 18 : 0,
          padding: expandida ? "16px" : "0",
          boxSizing: "border-box",
          overflow: "hidden",
          border: expandida
            ? "1px solid var(--border-color, #334155)"
            : "1px solid transparent",
          borderRadius: 14,
          background: expandida
            ? "var(--panel-bg, #1e293b)"
            : "transparent",
          opacity: expandida ? 1 : 0,
          transform: expandida
            ? "translateY(0)"
            : "translateY(-10px)",
          transition:
            "height 0.45s cubic-bezier(.22, 1, .36, 1), margin 0.45s ease, padding 0.45s ease, opacity 0.25s ease 0.12s, transform 0.35s ease",
          whiteSpace: "nowrap",
        }}
      >
        <span
          style={{
            display: "block",
            marginBottom: 8,
            color: "var(--text-secondary, #94a3b8)",
            fontSize: 11,
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.7px",
          }}
        >
          Patrimônio total
        </span>

        <strong
          style={{
            display: "block",
            color:
              valoresFinanceiros.patrimonioTotal >= 0
                ? "var(--text-primary, #f8fafc)"
                : "#EF4444",
            fontSize: 21,
            lineHeight: 1.2,
          }}
        >
          {formatarMoeda(
            valoresFinanceiros.patrimonioTotal
          )}
        </strong>

        <span
          style={{
            display: "block",
            marginTop: 8,
            color:
              valoresFinanceiros.saldoDisponivel >= 0
                ? "#22C55E"
                : "#EF4444",
            fontSize: 11,
            fontWeight: 700,
          }}
        >
          Saldo disponível:{" "}
          {formatarMoeda(
            valoresFinanceiros.saldoDisponivel
          )}
        </span>
      </div>

      <nav
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 7,
          overflowY: "auto",
          overflowX: "hidden",
          paddingRight: expandida ? 2 : 0,
        }}
      >
        {menu.map((item) => {
          const valorItem = obterValorMenu(
            item.tipoValor
          );

          return (
            <NavLink
              key={item.rota}
              to={item.rota}
              end={item.rota === "/app"}
              title={!expandida ? item.nome : ""}
              style={({ isActive }) => ({
                minHeight:
                  expandida && item.tipoValor ? 58 : 46,
                padding: expandida
                  ? "9px 12px"
                  : "12px 8px",
                borderRadius: 10,
                display: "flex",
                alignItems: "center",
                justifyContent: expandida
                  ? "flex-start"
                  : "center",
                gap: 13,
                overflow: "hidden",
                color: isActive
                  ? "#ffffff"
                  : "var(--text-primary, #ffffff)",
                background: isActive
                  ? item.premium
                    ? "linear-gradient(135deg, #a855f7, #7c3aed)"
                    : "var(--accent, #22c55e)"
                  : "transparent",
                textDecoration: "none",
                fontWeight: isActive ? 700 : 500,
                whiteSpace: "nowrap",
                transition:
                  "background 0.25s ease, color 0.25s ease, padding 0.5s cubic-bezier(.22, 1, .36, 1), min-height 0.35s ease, transform 0.25s ease",
              })}
            >
              <span
                style={{
                  width: 22,
                  minWidth: 22,
                  height: 22,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 18,
                  flexShrink: 0,
                  transform: expandida
                    ? "scale(1)"
                    : "scale(0.95)",
                  transition: "transform 0.35s ease",
                }}
              >
                {item.icone}
              </span>

              <span
                style={{
                  flex: expandida ? 1 : "none",
                  width: expandida ? 165 : 0,
                  opacity: expandida ? 1 : 0,
                  overflow: "hidden",
                  transform: expandida
                    ? "translateX(0)"
                    : "translateX(-18px)",
                  transition: expandida
                    ? "opacity 0.25s ease 0.18s, transform 0.35s ease 0.12s, width 0.5s cubic-bezier(.22, 1, .36, 1)"
                    : "opacity 0.15s ease, transform 0.25s ease, width 0.5s cubic-bezier(.22, 1, .36, 1)",
                  pointerEvents: "none",
                }}
              >
                <span
                  style={{
                    display: "block",
                    fontSize: 14,
                  }}
                >
                  {item.nome}
                </span>

                {item.tipoValor && (
                  <strong
                    style={{
                      display: "block",
                      marginTop: 4,
                      color: item.corValor,
                      fontSize: 12,
                      fontWeight: 800,
                    }}
                  >
                    {formatarMoeda(valorItem)}
                  </strong>
                )}
              </span>

              {item.premium && (
                <span
                  style={{
                    marginLeft: "auto",
                    display: expandida
                      ? "inline-flex"
                      : "none",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: "4px 7px",
                    borderRadius: "999px",
                    background:
                      "rgba(168, 85, 247, 0.18)",
                    color: "#c084fc",
                    fontSize: "9px",
                    fontWeight: 800,
                    textTransform: "uppercase",
                    letterSpacing: "0.4px",
                  }}
                >
                  Premium
                </span>
              )}
            </NavLink>
          );
        })}
      </nav>

      <div
        style={{
          marginTop: "auto",
          height: expandida ? 20 : 0,
          paddingTop: expandida ? 14 : 0,
          overflow: "hidden",
          color: "var(--text-muted, #94a3b8)",
          fontSize: 11,
          textAlign: "center",
          whiteSpace: "nowrap",
          opacity: expandida ? 1 : 0,
          transform: expandida
            ? "translateY(0)"
            : "translateY(8px)",
          transition: expandida
            ? "opacity 0.25s ease 0.22s, height 0.5s cubic-bezier(.22, 1, .36, 1), transform 0.35s ease 0.16s"
            : "opacity 0.15s ease, height 0.35s ease, transform 0.25s ease",
        }}
      >
        MahaFinance v1.0
      </div>
    </aside>
  );
}

export default Sidebar;
