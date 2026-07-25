function DateFilter({
  dataInicial,
  setDataInicial,
  dataFinal,
  setDataFinal,
}) {
  return (
    <div
      style={{
        display: "flex",
        gap: 20,
        alignItems: "center",
        marginBottom: 25,
        flexWrap: "wrap",
      }}
    >
      <div>
        <label
          style={{
            color: "var(--text-primary, #ffffff)",
            display: "block",
            marginBottom: 8,
          }}
        >
          Data Inicial
        </label>

        <input
          type="date"
          value={dataInicial}
          onChange={(e) =>
            setDataInicial(e.target.value)
          }
          style={input}
        />
      </div>

      <div>
        <label
          style={{
            color: "var(--text-primary, #ffffff)",
            display: "block",
            marginBottom: 8,
          }}
        >
          Data Final
        </label>

        <input
          type="date"
          value={dataFinal}
          onChange={(e) =>
            setDataFinal(e.target.value)
          }
          style={input}
        />
      </div>
    </div>
  );
}

const input = {
  background: "var(--input-bg, #0f172a)",
  color: "var(--text-primary, #ffffff)",
  border: "1px solid var(--border-color, #334155)",
  padding: "10px 15px",
  borderRadius: 8,
  fontSize: 15,
};

export default DateFilter;
