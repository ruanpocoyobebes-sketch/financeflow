export const page = (cores) => ({
  width: "100%",
  display: "flex",
  flexDirection: "column",
  gap: 24,
});

export const panel = (cores) => ({
  background: cores.painel,
  border: `1px solid ${cores.borda}`,
  borderRadius: 20,
  boxShadow: cores.sombra,
});

export const card = (cores) => ({
  background: cores.painel,
  border: `1px solid ${cores.borda}`,
  borderRadius: 18,
  padding: 20,
  boxShadow: cores.sombra,
  transition: ".25s",
});

export const title = (cores) => ({
  color: cores.texto,
  fontSize: 30,
  fontWeight: 800,
});

export const subtitle = (cores) => ({
  color: cores.textoSecundario,
  fontSize: 15,
  marginTop: 6,
});

export const input = (cores) => ({
  background: cores.fundoSecundario,
  color: cores.texto,
  border: `1px solid ${cores.borda}`,
  borderRadius: 12,
  padding: "12px 14px",
  outline: "none",
});

export const table = (cores) => ({
  background: cores.painel,
  color: cores.texto,
});

export const badgeGreen = {
  background: "rgba(34,197,94,.15)",
  color: "#22C55E",
};

export const badgeRed = {
  background: "rgba(239,68,68,.15)",
  color: "#EF4444",
};

export const badgeBlue = {
  background: "rgba(59,130,246,.15)",
  color: "#3B82F6",
};