import { Navigate } from "react-router-dom";
import { usePerfil } from "../context/PerfilContext";

function OwnerRoute({ children }) {
  const { ehDono, carregandoPerfil } = usePerfil();

  if (carregandoPerfil) {
    return (
      <div
        style={{
          minHeight: 320,
          display: "grid",
          placeItems: "center",
          color: "var(--text-primary, #ffffff)",
          fontSize: 18,
          fontWeight: 700,
        }}
      >
        Verificando acesso...
      </div>
    );
  }

  if (!ehDono) {
    return <Navigate to="/app" replace />;
  }

  return children;
}

export default OwnerRoute;
