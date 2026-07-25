import "./index.css";

import {
  Navigate,
  Route,
  Routes,
} from "react-router-dom";

import Sidebar from "./components/Sidebar";
import ProtectedRoute from "./components/ProtectedRoute";

import Apresentacao from "./pages/Apresentacao";
import Cadastro from "./pages/Cadastro";
import Entrar from "./pages/Entrar";

import Dashboard from "./pages/Dashboard";
import Receitas from "./pages/Receitas";
import Despesas from "./pages/Despesas";
import Investimentos from "./pages/Investimentos";
import Metas from "./pages/Metas";
import Relatorios from "./pages/Relatorios";
import Configuracoes from "./pages/Configuracoes";
import AnaliseIA from "./pages/AnaliseIA";

function AppLayout({ children }) {
  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        background: "var(--bg-primary, #0f172a)",
        color: "var(--text-primary, #ffffff)",
      }}
    >
      <Sidebar />

      <main
        style={{
          flex: 1,
          minWidth: 0,
          padding: "30px",
          overflowY: "auto",
        }}
      >
        {children}
      </main>
    </div>
  );
}

function RotaProtegida({ children }) {
  return (
    <ProtectedRoute>
      <AppLayout>{children}</AppLayout>
    </ProtectedRoute>
  );
}

function App() {
  return (
    <Routes>
      {/* Páginas públicas */}
      <Route path="/" element={<Apresentacao />} />
      <Route path="/login" element={<Entrar />} />
      <Route path="/cadastro" element={<Cadastro />} />

      {/* Área protegida */}
      <Route
        path="/app"
        element={
          <RotaProtegida>
            <Dashboard />
          </RotaProtegida>
        }
      />

      <Route
        path="/app/receitas"
        element={
          <RotaProtegida>
            <Receitas />
          </RotaProtegida>
        }
      />

      <Route
        path="/app/despesas"
        element={
          <RotaProtegida>
            <Despesas />
          </RotaProtegida>
        }
      />

      <Route
        path="/app/investimentos"
        element={
          <RotaProtegida>
            <Investimentos />
          </RotaProtegida>
        }
      />

      <Route
        path="/app/metas"
        element={
          <RotaProtegida>
            <Metas />
          </RotaProtegida>
        }
      />

      <Route
        path="/app/relatorios"
        element={
          <RotaProtegida>
            <Relatorios />
          </RotaProtegida>
        }
      />

      <Route
        path="/app/analise-ia"
        element={
          <RotaProtegida>
            <AnaliseIA />
          </RotaProtegida>
        }
      />

      <Route
        path="/app/configuracoes"
        element={
          <RotaProtegida>
            <Configuracoes />
          </RotaProtegida>
        }
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;