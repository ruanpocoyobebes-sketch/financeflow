import { useSettings } from "../context/SettingsContext";

function Card({ titulo, valor, cor }) {
  const { settings } = useSettings();

  const formatarMoeda = (valorRecebido) =>
    Number(valorRecebido).toLocaleString("pt-BR", {
      style: "currency",
      currency: settings.moeda || "BRL",
      minimumFractionDigits: settings.mostrarCentavos ? 2 : 0,
      maximumFractionDigits: settings.mostrarCentavos ? 2 : 0,
    });

  return (
    <div
      style={{
        background: "var(--bg-card)",
        borderRadius: "14px",
        padding: "22px",
        border: "1px solid var(--border-color)",
        boxShadow: "var(--shadow)",
        transition:
          "background 0.25s ease, border-color 0.25s ease, transform 0.2s ease",
      }}
    >
      <p
        style={{
          color: "var(--text-muted)",
          margin: 0,
          marginBottom: 12,
          fontSize: 15,
        }}
      >
        {titulo}
      </p>

      <h2
        style={{
          color: cor,
          margin: 0,
          fontSize: 28,
        }}
      >
        {formatarMoeda(valor)}
      </h2>
    </div>
  );
}

export default Card;