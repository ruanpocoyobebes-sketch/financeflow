import { useState } from "react";
import { useSettings } from "../context/SettingsContext";

function Navbar() {
  const { cores, settings } = useSettings();

  const [hover, setHover] = useState(false);

  const nome = settings.nome?.trim() || "Usuário";
  const inicial = nome.charAt(0).toUpperCase();

  return (
    <header
      style={{
        background: cores.painel,
        border: `1px solid ${cores.borda}`,
        borderRadius: 18,
        padding: "18px 24px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        boxShadow: cores.sombra,
        marginBottom: 25,
        flexWrap: "wrap",
        gap: 20,
      }}
    >
      <div>
        <h2
          style={{
            margin: 0,
            color: cores.texto,
            fontSize: 26,
            fontWeight: 700,
          }}
        >
          MahaFinance
        </h2>

        <p
          style={{
            marginTop: 6,
            marginBottom: 0,
            color: cores.textoSecundario,
            fontSize: 14,
          }}
        >
          Seu painel financeiro pessoal
        </p>
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 15,
        }}
      >
        <button
          onMouseEnter={() => setHover(true)}
          onMouseLeave={() => setHover(false)}
          style={{
            background: hover ? "#22C55E" : cores.fundoSecundario,
            color: hover ? "#FFFFFF" : cores.texto,
            border: `1px solid ${cores.borda}`,
            borderRadius: 12,
            padding: "10px 18px",
            cursor: "pointer",
            fontWeight: 600,
            fontSize: 14,
            transition: ".25s",
          }}
        >
          📊 Dashboard
        </button>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            background: cores.fundoSecundario,
            border: `1px solid ${cores.borda}`,
            borderRadius: 14,
            padding: "8px 14px",
          }}
        >
          <div
            style={{
              width: 42,
              height: 42,
              borderRadius: "50%",
              background:
                "linear-gradient(135deg,#22C55E,#16A34A)",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              color: "#FFFFFF",
              fontWeight: "bold",
              fontSize: 18,
              flexShrink: 0,
            }}
          >
            {inicial}
          </div>

          <div>
            <div
              style={{
                color: cores.texto,
                fontWeight: 600,
                fontSize: 15,
              }}
            >
              {nome}
            </div>

            <div
              style={{
                color: cores.textoSecundario,
                fontSize: 13,
              }}
            >
              Bem-vindo de volta
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Navbar;