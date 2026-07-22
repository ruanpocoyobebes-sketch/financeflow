import { NavLink } from "react-router-dom";

const menu = [
  { nome: "Dashboard", rota: "/" },
  { nome: "Receitas", rota: "/receitas" },
  { nome: "Despesas", rota: "/despesas" },
  { nome: "Investimentos", rota: "/investimentos" },
  { nome: "Metas", rota: "/metas" },
  { nome: "Relatórios", rota: "/relatorios" },
  { nome: "Configurações", rota: "/configuracoes" },
];

function Sidebar() {
  return (
    <aside
      style={{
        width: "250px",
        background: "var(--bg-secondary)",
        color: "var(--text-primary)",
        padding: "30px 20px",
        display: "flex",
        flexDirection: "column",
        borderRight: "1px solid var(--border-color)",
        transition: "0.25s",
      }}
    >
      <h2
        style={{
          textAlign: "center",
          marginBottom: "40px",
          color: "var(--accent)",
        }}
      >
        💰 FinanceFlow
      </h2>

      <nav
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "12px",
        }}
      >
        {menu.map((item) => (
          <NavLink
            key={item.rota}
            to={item.rota}
            end={item.rota === "/"}
            style={({ isActive }) => ({
              textDecoration: "none",
              color: isActive
                ? "#ffffff"
                : "var(--text-primary)",
              padding: "12px 16px",
              borderRadius: "10px",
              background: isActive
                ? "var(--accent)"
                : "transparent",
              transition: "0.25s",
              fontWeight: isActive ? "bold" : "500",
            })}
          >
            {item.nome}
          </NavLink>
        ))}
      </nav>

      <div
        style={{
          marginTop: "auto",
          textAlign: "center",
          color: "var(--text-muted)",
          fontSize: "14px",
        }}
      >
        FinanceFlow v1.0
      </div>
    </aside>
  );
}

export default Sidebar;