import "./index.css";
import { Routes, Route } from "react-router-dom";

import { useSettings } from "./context/SettingsContext";

import Sidebar from "./components/Sidebar";

import Dashboard from "./pages/Dashboard";
import Receitas from "./pages/Receitas";
import Despesas from "./pages/Despesas";
import Investimentos from "./pages/Investimentos";
import Metas from "./pages/Metas";
import Relatorios from "./pages/Relatorios";
import Configuracoes from "./pages/Configuracoes";

function App() {
  const { settings } = useSettings();

  return (
    <div
      data-theme={settings.tema}
      style={{
        display: "flex",
        minHeight: "100vh",
        background: "var(--bg-primary)",
        color: "var(--text-primary)",
        transition: "background 0.25s ease, color 0.25s ease",
      }}
    >
      <Sidebar />

      <main
        style={{
          flex: 1,
          padding: "30px",
          overflowY: "auto",
        }}
      >
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/receitas" element={<Receitas />} />
          <Route path="/despesas" element={<Despesas />} />
          <Route
            path="/investimentos"
            element={<Investimentos />}
          />
          <Route path="/metas" element={<Metas />} />
          <Route path="/relatorios" element={<Relatorios />} />
          <Route
            path="/configuracoes"
            element={<Configuracoes />}
          />
        </Routes>
      </main>
    </div>
  );
}

export default App;