function Card({ titulo, valor, cor }) {
  const formatarMoeda = (valorRecebido) =>
    Number(valorRecebido).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });

  return (
    <div
      style={{
        background: "#1E293B",
        borderRadius: "14px",
        padding: "22px",
        boxShadow: "0 6px 15px rgba(0,0,0,.25)",
      }}
    >
      <p
        style={{
          color: "#94A3B8",
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