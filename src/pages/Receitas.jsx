import { useFinance } from "../context/FinanceContext";

function Receitas() {
  const { receitas } = useFinance();

  const formatar = (valor) =>
    valor.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });

  return (
    <div>
      <h1>Receitas</h1>

      {receitas.length === 0 ? (
        <p>Nenhuma receita cadastrada.</p>
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
            {receitas.map((item) => (
              <tr key={item.id}>
                <td>{item.descricao}</td>
                <td>{item.data}</td>
                <td align="right" style={{ color: "#22C55E" }}>
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

export default Receitas;