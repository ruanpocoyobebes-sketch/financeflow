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
        width: expandida ? "250px" : "82px",
        minWidth: expandida ? "250px" : "82px",
        height: "100vh",
        position: "sticky",
        top: 0,
        background: "var(--bg-secondary)",
        color: "var(--text-primary)",
        padding: expandida ? "30px 20px" : "30px 12px",
        display: "flex",
        flexDirection: "column",
        borderRight: "1px solid var(--border-color)",
        transition:
          "width 0.25s ease, min-width 0.25s ease, padding 0.25s ease",
        overflow: "hidden",
        boxSizing: "border-box",
        zIndex: 100,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: expandida ? "flex-start" : "center",
          gap: 10,
          minHeight: 42,
          marginBottom: 40,
          paddingLeft: expandida ? 4 : 0,
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
            opacity: expandida ? 1 : 0,
            transform: expandida
              ? "translateX(0)"
              : "translateX(-8px)",
            transition:
              "opacity 0.18s ease, transform 0.18s ease",
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
          gap: 12,
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
                ? "#ffffff"
                : "var(--text-primary)",
              padding: expandida
                ? "12px 16px"
                : "12px 10px",
              borderRadius: 10,
              background: isActive
                ? "var(--accent)"
                : "transparent",
              transition:
                "background 0.2s ease, padding 0.25s ease",
              fontWeight: isActive ? "bold" : "500",
              whiteSpace: "nowrap",
              overflow: "hidden",
            })}
          >
            <span
              style={{
                width: 22,
                minWidth: 22,
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
                transform: expandida
                  ? "translateX(0)"
                  : "translateX(-8px)",
                transition:
                  "opacity 0.18s ease, transform 0.18s ease",
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
          minHeight: 22,
          textAlign: "center",
          color: "var(--text-muted)",
          fontSize: 14,
          whiteSpace: "nowrap",
          opacity: expandida ? 1 : 0,
          transition: "opacity 0.18s ease",
        }}
      >
        mahafinance v1.0
      </div>
    </aside>
  );
}

export default Sidebar;