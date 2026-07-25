import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function ProtectedRoute({ children }) {
  const { autenticado, carregando } = useAuth();

  if (carregando) {
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

  return children;
}

export default ProtectedRoute;
