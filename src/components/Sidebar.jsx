import { useState } from "react";
import { NavLink } from "react-router-dom";

import {
  FaChartPie,
  FaArrowUp,
  FaArrowDown,
  FaChartLine,
  FaBullseye,
  FaFileAlt,
  FaCog,
} from "react-icons/fa";

const menu = [
  {
    nome: "Dashboard",
    rota: "/",
    icone: <FaChartPie />,
  },
  {
    nome: "Receitas",
    rota: "/receitas",
    icone: <FaArrowUp />,
  },
  {
    nome: "Despesas",
    rota: "/despesas",
    icone: <FaArrowDown />,
  },
  {
    nome: "Investimentos",
    rota: "/investimentos",
    icone: <FaChartLine />,
  },
  {
    nome: "Metas",
    rota: "/metas",
    icone: <FaBullseye />,
  },
  {
    nome: "Relatórios",
    rota: "/relatorios",
    icone: <FaFileAlt />,
  },
  {
    nome: "Configurações",
    rota: "/configuracoes",
    icone: <FaCog />,
  },
];

function Sidebar() {
  const [expandida, setExpandida] = useState(false);

  return (
    <aside
      onMouseEnter={() => setExpandida(true)}
      onMouseLeave={() => setExpandida(false)}
      style={{
        width: expandida ? 250 : 76,
        minWidth: expandida ? 250 : 76,
        height: "100vh",
        position: "sticky",
        top: 0,
        background: "var(--bg-secondary)",
        color: "var(--text-primary)",
        padding: expandida ? "24px 18px" : "24px 10px",
        display: "flex",
        flexDirection: "column",
        boxSizing: "border-box",
        overflow: "hidden",
        borderRight: "2px solid #334155",
        boxShadow: "8px 0 20px rgba(0, 0, 0, 0.18)",
        transition:
          "width 0.25s ease, min-width 0.25s ease, padding 0.25s ease",
        zIndex: 100,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: expandida ? "flex-start" : "center",
          gap: 10,
          minHeight: 44,
          marginBottom: 30,
          whiteSpace: "nowrap",
        }}
      >
        <span
          style={{
            fontSize: 24,
            flexShrink: 0,
          }}
        >
          💰
        </span>

        <h2
          style={{
            margin: 0,
            color: "var(--accent)",
            fontSize: 22,
            opacity: expandida ? 1 : 0,
            width: expandida ? "auto" : 0,
            overflow: "hidden",
            transform: expandida
              ? "translateX(0)"
              : "translateX(-10px)",
            transition:
              "opacity 0.18s ease, transform 0.18s ease, width 0.25s ease",
            pointerEvents: "none",
          }}
        >
          mahafinance
        </h2>
      </div>

      <nav
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 10,
        }}
      >
        {menu.map((item) => (
          <NavLink
            key={item.rota}
            to={item.rota}
            end={item.rota === "/"}
            title={!expandida ? item.nome : ""}
            style={({ isActive }) => ({
              minHeight: 46,
              display: "flex",
              alignItems: "center",
              justifyContent: expandida
                ? "flex-start"
                : "center",
              gap: 14,
              textDecoration: "none",
              color: isActive
                ? "#FFFFFF"
                : "var(--text-primary)",
              padding: expandida
                ? "12px 14px"
                : "12px 8px",
              borderRadius: 10,
              background: isActive
                ? "var(--accent)"
                : "transparent",
              fontWeight: isActive ? 700 : 500,
              whiteSpace: "nowrap",
              overflow: "hidden",
              transition:
                "background 0.2s ease, padding 0.25s ease",
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
              }}
            >
              {item.icone}
            </span>

            <span
              style={{
                opacity: expandida ? 1 : 0,
                width: expandida ? "auto" : 0,
                overflow: "hidden",
                transform: expandida
                  ? "translateX(0)"
                  : "translateX(-10px)",
                transition:
                  "opacity 0.18s ease, transform 0.18s ease, width 0.25s ease",
                pointerEvents: "none",
              }}
            >
              {item.nome}
            </span>
          </NavLink>
        ))}
      </nav>

      <div
        style={{
          marginTop: "auto",
          textAlign: "center",
          color: "var(--text-muted)",
          fontSize: 13,
          whiteSpace: "nowrap",
          opacity: expandida ? 1 : 0,
          height: expandida ? 20 : 0,
          overflow: "hidden",
          transition: "opacity 0.18s ease, height 0.25s ease",
        }}
      >
        mahafinance v1.0
      </div>
    </aside>
  );
}

export default Sidebar;