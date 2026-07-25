import { useState } from "react";
import { useSettings } from "../context/SettingsContext";

const ICONES = {
  "Saldo disponível": "💰",
  Receitas: "📈",
  Despesas: "📉",
  Investimentos: "💎",
  "Guardado em metas": "🎯",
};

function Card({ titulo, valor, cor }) {
  const { formatarMoeda, cores } = useSettings();

  const [hover, setHover] = useState(false);

  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        background: cores.painel,
        border: `1px solid ${cores.borda}`,
        borderRadius: 18,
        padding: 22,
        boxShadow: hover
          ? "0 18px 35px rgba(0,0,0,.18)"
          : cores.sombra,
        transform: hover ? "translateY(-6px)" : "translateY(0)",
        transition: ".25s",
        cursor: "default",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 20,
        }}
      >
        <div>
          <p
            style={{
              margin: 0,
              color: cores.textoSecundario,
              fontSize: 14,
              fontWeight: 500,
            }}
          >
            {titulo}
          </p>

          <h2
            style={{
              marginTop: 10,
              marginBottom: 0,
              color: cor,
              fontSize: 30,
              fontWeight: 700,
            }}
          >
            {formatarMoeda(valor)}
          </h2>
        </div>

        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: 16,
            background: `${cor}22`,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            fontSize: 28,
          }}
        >
          {ICONES[titulo] || "💰"}
        </div>
      </div>

      <div
        style={{
          height: 6,
          borderRadius: 999,
          background: cores.fundoSecundario,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: "100%",
            height: "100%",
            background: cor,
            opacity: .8,
          }}
        />
      </div>
    </div>
  );
}

export default Card;