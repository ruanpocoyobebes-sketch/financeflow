function Navbar() {
  return (
    <header
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "10px",
      }}
    >
      <div>
        <h2
          style={{
            color: "white",
            margin: 0,
          }}
        >
          FinanceFlow
        </h2>

        <p
          style={{
            color: "#94A3B8",
            marginTop: 6,
            marginBottom: 0,
          }}
        >
          Controle financeiro pessoal
        </p>
      </div>

      <div
        style={{
          background: "#1E293B",
          padding: "12px 18px",
          borderRadius: "10px",
          color: "#94A3B8",
        }}
      >
        Dashboard
      </div>
    </header>
  );
}

export default Navbar;