import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { usePerfil } from "../context/PerfilContext";

function ProtectedRoute({ children }) {
  const { autenticado, carregando, sair } = useAuth();
  const { bloqueado, carregandoPerfil } = usePerfil();

  if (carregando || (autenticado && carregandoPerfil)) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          background: "var(--bg-primary, #0f172a)",
          color: "var(--text-primary, #ffffff)",
          fontSize: 22,
          fontWeight: "bold",
        }}
      >
        Carregando...
      </div>
    );
  }

  if (!autenticado) {
    return <Navigate to="/login" replace />;
  }

  if (bloqueado) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "grid",
          placeItems: "center",
          padding: 24,
          background: "var(--bg-primary, #0f172a)",
          color: "var(--text-primary, #ffffff)",
        }}
      >
        <div
          style={{
            width: "min(460px, 100%)",
            padding: 32,
            border: "1px solid var(--border-color, #334155)",
            borderRadius: 20,
            background: "var(--panel-bg, #1e293b)",
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: 42 }}>🔒</div>
          <h1>Conta bloqueada</h1>
          <p style={{ color: "var(--text-secondary, #94a3b8)" }}>
            O acesso desta conta foi bloqueado pelo administrador.
          </p>
          <button
            type="button"
            onClick={() => sair()}
            style={{
              marginTop: 12,
              minHeight: 46,
              padding: "0 22px",
              border: 0,
              borderRadius: 10,
              background: "#ef4444",
              color: "#fff",
              cursor: "pointer",
              fontWeight: 700,
            }}
          >
            Sair da conta
          </button>
        </div>
      </div>
    );
  }

  return children;
}

export default ProtectedRoute;
