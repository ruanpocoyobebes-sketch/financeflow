import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

const FinanceContext = createContext();

export function FinanceProvider({ children }) {
  const [receitas, setReceitas] = useState([]);
  const [despesas, setDespesas] = useState([]);
  const [investimentos, setInvestimentos] = useState([]);
  const [metas, setMetas] = useState([]);

  const [dadosCarregados, setDadosCarregados] =
    useState(false);

  useEffect(() => {
    const dadosSalvos =
      localStorage.getItem("mahafinance");

    if (dadosSalvos) {
      try {
        const dadosConvertidos =
          JSON.parse(dadosSalvos);

        setReceitas(
          normalizarTransacoes(
            dadosConvertidos.receitas || [],
            "Receita"
          )
        );

        setDespesas(
          normalizarTransacoes(
            dadosConvertidos.despesas || [],
            "Despesa"
          )
        );

        setInvestimentos(
          normalizarTransacoes(
            dadosConvertidos.investimentos || [],
            "Investimento"
          )
        );

        setMetas(
          dadosConvertidos.metas || []
        );
      } catch (erro) {
        console.error(
          "Erro ao carregar os dados do mahafinance:",
          erro
        );
      }
    }

    setDadosCarregados(true);
  }, []);

  useEffect(() => {
    if (!dadosCarregados) return;

    localStorage.setItem(
      "mahafinance",
      JSON.stringify({
        receitas,
        despesas,
        investimentos,
        metas,
      })
    );
  }, [
    receitas,
    despesas,
    investimentos,
    metas,
    dadosCarregados,
  ]);

  function categoriaPadrao(tipo) {
    switch (tipo) {
      case "Receita":
        return "Outros";

      case "Despesa":
        return "Outros";

      case "Investimento":
        return "Outros";

      default:
        return "Outros";
    }
  }

  function normalizarTransacoes(lista, tipo) {
    return lista.map((item) => ({
      ...item,
      tipo: item.tipo || tipo,
      descricao:
        item.descricao || "Sem descrição",
      categoria:
        item.categoria ||
        categoriaPadrao(tipo),
      valor: Number(item.valor) || 0,
      data:
        item.data ||
        new Date().toLocaleDateString(
          "pt-BR"
        ),
    }));
  }

  function criarId() {
    return `${Date.now()}-${Math.random()
      .toString(16)
      .slice(2)}`;
  }

  function criarTransacao(
    tipo,
    descricao,
    valor,
    categoria
  ) {
    return {
      id: criarId(),
      tipo,
      descricao: descricao.trim(),
      categoria:
        categoria || categoriaPadrao(tipo),
      valor: Number(valor),
      data: new Date().toLocaleDateString(
        "pt-BR"
      ),
      criadaEm: new Date().toISOString(),
    };
  }

  function adicionarReceita(
    descricao,
    valor,
    categoria
  ) {
    const novaReceita = criarTransacao(
      "Receita",
      descricao,
      valor,
      categoria
    );

    setReceitas((listaAtual) => [
      ...listaAtual,
      novaReceita,
    ]);
  }

  function adicionarDespesa(
    descricao,
    valor,
    categoria
  ) {
    const novaDespesa = criarTransacao(
      "Despesa",
      descricao,
      valor,
      categoria
    );

    setDespesas((listaAtual) => [
      ...listaAtual,
      novaDespesa,
    ]);
  }

  function adicionarInvestimento(
    descricao,
    valor,
    categoria
  ) {
    const novoInvestimento =
      criarTransacao(
        "Investimento",
        descricao,
        valor,
        categoria
      );

    setInvestimentos((listaAtual) => [
      ...listaAtual,
      novoInvestimento,
    ]);
  }

  function removerReceita(id) {
    setReceitas((listaAtual) =>
      listaAtual.filter(
        (item) => item.id !== id
      )
    );
  }

  function removerDespesa(id) {
    setDespesas((listaAtual) =>
      listaAtual.filter(
        (item) => item.id !== id
      )
    );
  }

  function removerInvestimento(id) {
    setInvestimentos((listaAtual) =>
      listaAtual.filter(
        (item) => item.id !== id
      )
    );
  }

  function editarReceita(
    id,
    novosDados
  ) {
    setReceitas((listaAtual) =>
      listaAtual.map((item) =>
        item.id === id
          ? {
              ...item,
              ...novosDados,
              descricao:
                novosDados.descricao?.trim() ||
                item.descricao,
              categoria:
                novosDados.categoria ||
                item.categoria ||
                categoriaPadrao("Receita"),
              valor: Number(
                novosDados.valor
              ),
            }
          : item
      )
    );
  }

  function editarDespesa(
    id,
    novosDados
  ) {
    setDespesas((listaAtual) =>
      listaAtual.map((item) =>
        item.id === id
          ? {
              ...item,
              ...novosDados,
              descricao:
                novosDados.descricao?.trim() ||
                item.descricao,
              categoria:
                novosDados.categoria ||
                item.categoria ||
                categoriaPadrao("Despesa"),
              valor: Number(
                novosDados.valor
              ),
            }
          : item
      )
    );
  }

  function editarInvestimento(
    id,
    novosDados
  ) {
    setInvestimentos((listaAtual) =>
      listaAtual.map((item) =>
        item.id === id
          ? {
              ...item,
              ...novosDados,
              descricao:
                novosDados.descricao?.trim() ||
                item.descricao,
              categoria:
                novosDados.categoria ||
                item.categoria ||
                categoriaPadrao(
                  "Investimento"
                ),
              valor: Number(
                novosDados.valor
              ),
            }
          : item
      )
    );
  }

  function adicionarMeta(
    nome,
    valorAlvo,
    valorAtual = 0,
    prazo = ""
  ) {
    const novaMeta = {
      id: criarId(),
      nome: nome.trim(),
      valorAlvo: Number(valorAlvo),
      valorAtual: Number(valorAtual),
      prazo,
      criadaEm:
        new Date().toLocaleDateString(
          "pt-BR"
        ),
    };

    setMetas((listaAtual) => [
      ...listaAtual,
      novaMeta,
    ]);
  }

  function removerMeta(id) {
    setMetas((listaAtual) =>
      listaAtual.filter(
        (meta) => meta.id !== id
      )
    );
  }

  function editarMeta(
    id,
    novosDados
  ) {
    setMetas((listaAtual) =>
      listaAtual.map((meta) =>
        meta.id === id
          ? {
              ...meta,
              ...novosDados,
              nome:
                novosDados.nome?.trim() ||
                meta.nome,
              valorAlvo: Number(
                novosDados.valorAlvo
              ),
              valorAtual: Number(
                novosDados.valorAtual
              ),
            }
          : meta
      )
    );
  }

  function adicionarValorMeta(
    id,
    valor
  ) {
    setMetas((listaAtual) =>
      listaAtual.map((meta) =>
        meta.id === id
          ? {
              ...meta,
              valorAtual:
                Number(
                  meta.valorAtual
                ) + Number(valor),
            }
          : meta
      )
    );
  }

  const totalReceitas =
    receitas.reduce(
      (total, item) =>
        total + Number(item.valor),
      0
    );

  const totalDespesas =
    despesas.reduce(
      (total, item) =>
        total + Number(item.valor),
      0
    );

  const totalInvestimentos =
    investimentos.reduce(
      (total, item) =>
        total + Number(item.valor),
      0
    );

  const totalMetas =
    metas.reduce(
      (total, meta) =>
        total +
        Number(meta.valorAtual || 0),
      0
    );

  const saldo =
    totalReceitas -
    totalDespesas -
    totalInvestimentos -
    totalMetas;

  const transacoes = [
    ...receitas,
    ...despesas,
    ...investimentos,
  ].sort((a, b) => {
    const dataA =
      a.criadaEm || a.id;
    const dataB =
      b.criadaEm || b.id;

    return String(dataB).localeCompare(
      String(dataA)
    );
  });

  return (
    <FinanceContext.Provider
      value={{
        receitas,
        despesas,
        investimentos,
        metas,

        totalReceitas,
        totalDespesas,
        totalInvestimentos,
        totalMetas,
        saldo,

        transacoes,

        adicionarReceita,
        adicionarDespesa,
        adicionarInvestimento,

        removerReceita,
        removerDespesa,
        removerInvestimento,

        editarReceita,
        editarDespesa,
        editarInvestimento,

        adicionarMeta,
        removerMeta,
        editarMeta,
        adicionarValorMeta,
      }}
    >
      {children}
    </FinanceContext.Provider>
  );
}

export function useFinance() {
  const contexto =
    useContext(FinanceContext);

  if (!contexto) {
    throw new Error(
      "useFinance precisa estar dentro de FinanceProvider."
    );
  }

  return contexto;
}

export default FinanceContext;