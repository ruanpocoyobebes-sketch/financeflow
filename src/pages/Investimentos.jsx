import { useFinance } from "../context/FinanceContext";

function Investimentos() {
  const { investimentos } = useFinance();

  const formatar = (valor) =>
    valor.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });

  return (
    <div>
      <h1>Investimentos</h1>

      {investimentos.length === 0 ? (
        <p>Nenhum investimento cadastrado.</p>
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
            {investimentos.map((item) => (
              <tr key={item.id}>
                <td>{item.descricao}</td>
                <td>{item.data}</td>
                <td align="right" style={{ color: "#3B82F6" }}>
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

export default Investimentos;