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
            color: "white",
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
            color: "white",
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
  background: "#0F172A",
  color: "white",
  border: "1px solid #334155",
  padding: "10px 15px",
  borderRadius: 8,
  fontSize: 15,
};

export default DateFilter;