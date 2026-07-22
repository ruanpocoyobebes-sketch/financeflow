import { useFinance } from "../context/FinanceContext";

function Despesas() {
  const { despesas } = useFinance();

  const formatar = (valor) =>
    valor.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });

  return (
    <div>
      <h1>Despesas</h1>

      {despesas.length === 0 ? (
        <p>Nenhuma despesa cadastrada.</p>
      ) : (
        <table style={{ width: "100%", marginTop: 20 }}>
          <thead>
            <tr>
              <th align="left">Descrição</th>
              <th align="left">Data</th>
              <th align="right">Valor</th>
            </tr>
          </thead>

          <tbody>
            {despesas.map((item) => (
              <tr key={item.id}>
                <td>{item.descricao}</td>
                <td>{item.data}</td>
                <td align="right" style={{ color: "#EF4444" }}>
                  {formatar(item.valor)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default Despesas;