import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import { useAuth } from "./AuthContext";

const FinanceContext = createContext();
const CHAVE_DADOS_LEGADOS = "mahafinance";
const CHAVE_DONO_DADOS_LEGADOS =
  "mahafinance-dados-dono-legado";

export function FinanceProvider({ children }) {
  const {
    usuario,
    carregando: carregandoAutenticacao,
  } = useAuth();

  const usuarioId = usuario?.id || null;
  const chaveDados = usuarioId
    ? `${CHAVE_DADOS_LEGADOS}:${usuarioId}`
    : null;

  const [receitas, setReceitas] = useState([]);
  const [despesas, setDespesas] = useState([]);
  const [investimentos, setInvestimentos] = useState([]);
  const [metas, setMetas] = useState([]);

  const [movimentacoesMeta, setMovimentacoesMeta] =
    useState([]);

  const [dadosCarregados, setDadosCarregados] =
    useState(false);
  const [donoDadosCarregados, setDonoDadosCarregados] =
    useState(null);

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

  function criarId() {
    return `${Date.now()}-${Math.random()
      .toString(16)
      .slice(2)}`;
  }

  function obterDataAtual() {
    return new Date().toLocaleDateString("pt-BR");
  }

  function obterDataISO() {
    return new Date().toISOString();
  }

  function normalizarTransacoes(lista, tipo) {
    return lista.map((item) => ({
      ...item,

      id: item.id || criarId(),

      tipo: item.tipo || tipo,

      natureza:
        item.natureza ||
        (tipo === "Receita"
          ? "entrada"
          : tipo === "Despesa"
          ? "saida"
          : "transferencia"),

      descricao:
        item.descricao || "Sem descrição",

      categoria:
        item.categoria ||
        categoriaPadrao(tipo),

      conta: item.conta || "Conta principal",

      status: item.status || "confirmado",

      valor: Math.abs(Number(item.valor) || 0),

      data: item.data || obterDataAtual(),

      criadaEm:
        item.criadaEm || obterDataISO(),
    }));
  }

  function normalizarMetas(lista) {
    return lista.map((meta) => ({
      ...meta,

      id: meta.id || criarId(),

      nome: meta.nome || "Meta sem nome",

      valorAlvo: Math.abs(
        Number(meta.valorAlvo) || 0
      ),

      valorAtual: Math.max(
        Number(meta.valorAtual) || 0,
        0
      ),

      prazo: meta.prazo || "",

      criadaEm:
        meta.criadaEm || obterDataAtual(),
    }));
  }

  function normalizarMovimentacoesMeta(lista) {
    return lista.map((item) => ({
      ...item,

      id: item.id || criarId(),

      tipo: "Meta",

      natureza: "transferencia",

      operacao:
        item.operacao || "Depósito em meta",

      descricao:
        item.descricao ||
        "Movimentação em meta",

      valor: Math.abs(Number(item.valor) || 0),

      direcao: item.direcao || "saida",

      status: item.status || "confirmado",

      data: item.data || obterDataAtual(),

      criadaEm:
        item.criadaEm || obterDataISO(),
    }));
  }

  useEffect(() => {
    if (carregandoAutenticacao) {
      return;
    }

    setDadosCarregados(false);
    setDonoDadosCarregados(null);
    setReceitas([]);
    setDespesas([]);
    setInvestimentos([]);
    setMetas([]);
    setMovimentacoesMeta([]);

    if (!usuarioId || !chaveDados) {
      return;
    }

    let dadosSalvos =
      localStorage.getItem(chaveDados);

    if (!dadosSalvos) {
      const donoDadosLegados =
        localStorage.getItem(
          CHAVE_DONO_DADOS_LEGADOS
        );

      const dadosLegados =
        localStorage.getItem(
          CHAVE_DADOS_LEGADOS
        );

      const podeMigrarDadosLegados =
        dadosLegados &&
        (!donoDadosLegados ||
          donoDadosLegados === usuarioId);

      if (podeMigrarDadosLegados) {
        dadosSalvos = dadosLegados;

        localStorage.setItem(
          CHAVE_DONO_DADOS_LEGADOS,
          usuarioId
        );
      }
    }

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
          normalizarMetas(
            dadosConvertidos.metas || []
          )
        );

        setMovimentacoesMeta(
          normalizarMovimentacoesMeta(
            dadosConvertidos.movimentacoesMeta || []
          )
        );
      } catch (erro) {
        console.error(
          "Erro ao carregar os dados do MahaFinance:",
          erro
        );
      }
    }

    setDonoDadosCarregados(usuarioId);
    setDadosCarregados(true);
  }, [
    carregandoAutenticacao,
    chaveDados,
    usuarioId,
  ]);

  useEffect(() => {
    if (
      !dadosCarregados ||
      !chaveDados ||
      donoDadosCarregados !== usuarioId
    ) {
      return;
    }

    localStorage.setItem(
      chaveDados,
      JSON.stringify({
        receitas,
        despesas,
        investimentos,
        metas,
        movimentacoesMeta,
      })
    );
  }, [
    receitas,
    despesas,
    investimentos,
    metas,
    movimentacoesMeta,
    dadosCarregados,
    donoDadosCarregados,
    chaveDados,
    usuarioId,
  ]);

  function criarTransacao(
    tipo,
    descricao,
    valor,
    categoria
  ) {
    const valorConvertido = Math.abs(
      Number(valor) || 0
    );

    return {
      id: criarId(),

      tipo,

      natureza:
        tipo === "Receita"
          ? "entrada"
          : tipo === "Despesa"
          ? "saida"
          : "transferencia",

      descricao:
        descricao?.trim() || "Sem descrição",

      categoria:
        categoria || categoriaPadrao(tipo),

      conta: "Conta principal",

      status: "confirmado",

      valor: valorConvertido,

      data: obterDataAtual(),

      criadaEm: obterDataISO(),
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

  function editarReceita(id, novosDados) {
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

              valor: Math.abs(
                Number(novosDados.valor) || 0
              ),
            }
          : item
      )
    );
  }

  function editarDespesa(id, novosDados) {
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

              valor: Math.abs(
                Number(novosDados.valor) || 0
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

              valor: Math.abs(
                Number(novosDados.valor) || 0
              ),
            }
          : item
      )
    );
  }

  function criarMovimentacaoMeta({
    metaId,
    nomeMeta,
    valor,
    operacao,
    direcao,
  }) {
    return {
      id: criarId(),

      metaId,

      tipo: "Meta",

      natureza: "transferencia",

      operacao,

      descricao: `${operacao}: ${nomeMeta}`,

      valor: Math.abs(Number(valor) || 0),

      direcao,

      status: "confirmado",

      data: obterDataAtual(),

      criadaEm: obterDataISO(),
    };
  }
    function adicionarMeta(
    nome,
    valorAlvo,
    valorAtual = 0,
    prazo = ""
  ) {
    const valorInicial = Math.max(
      Number(valorAtual) || 0,
      0
    );

    const novaMeta = {
      id: criarId(),

      nome: nome.trim(),

      valorAlvo: Math.abs(
        Number(valorAlvo) || 0
      ),

      valorAtual: valorInicial,

      prazo,

      criadaEm: obterDataAtual(),
    };

    setMetas((listaAtual) => [
      ...listaAtual,
      novaMeta,
    ]);

    if (valorInicial > 0) {
      const novaMovimentacao =
        criarMovimentacaoMeta({
          metaId: novaMeta.id,
          nomeMeta: novaMeta.nome,
          valor: valorInicial,
          operacao: "Depósito em meta",
          direcao: "saida",
        });

      setMovimentacoesMeta((listaAtual) => [
        ...listaAtual,
        novaMovimentacao,
      ]);
    }
  }

  function removerMeta(id) {
    const metaEncontrada = metas.find(
      (meta) => meta.id === id
    );

    if (
      metaEncontrada &&
      Number(metaEncontrada.valorAtual) > 0
    ) {
      const movimentacaoResgate =
        criarMovimentacaoMeta({
          metaId: metaEncontrada.id,
          nomeMeta: metaEncontrada.nome,
          valor: metaEncontrada.valorAtual,
          operacao: "Resgate de meta",
          direcao: "entrada",
        });

      setMovimentacoesMeta((listaAtual) => [
        ...listaAtual,
        movimentacaoResgate,
      ]);
    }

    setMetas((listaAtual) =>
      listaAtual.filter(
        (meta) => meta.id !== id
      )
    );
  }

  function editarMeta(id, novosDados) {
    setMetas((listaAtual) =>
      listaAtual.map((meta) => {
        if (meta.id !== id) return meta;

        const novoValorAlvo =
          novosDados.valorAlvo !== undefined
            ? Math.abs(
                Number(novosDados.valorAlvo) || 0
              )
            : meta.valorAlvo;

        const novoValorAtual =
          novosDados.valorAtual !== undefined
            ? Math.max(
                Number(novosDados.valorAtual) || 0,
                0
              )
            : meta.valorAtual;

        return {
          ...meta,
          ...novosDados,

          nome:
            novosDados.nome?.trim() ||
            meta.nome,

          valorAlvo: novoValorAlvo,

          valorAtual: novoValorAtual,
        };
      })
    );
  }

  function adicionarValorMeta(id, valor) {
    const valorConvertido = Math.abs(
      Number(valor) || 0
    );

    if (valorConvertido <= 0) return;

    const metaEncontrada = metas.find(
      (meta) => meta.id === id
    );

    if (!metaEncontrada) return;

    setMetas((listaAtual) =>
      listaAtual.map((meta) =>
        meta.id === id
          ? {
              ...meta,

              valorAtual:
                Number(meta.valorAtual || 0) +
                valorConvertido,
            }
          : meta
      )
    );

    const novaMovimentacao =
      criarMovimentacaoMeta({
        metaId: metaEncontrada.id,
        nomeMeta: metaEncontrada.nome,
        valor: valorConvertido,
        operacao: "Depósito em meta",
        direcao: "saida",
      });

    setMovimentacoesMeta((listaAtual) => [
      ...listaAtual,
      novaMovimentacao,
    ]);
  }

  function retirarValorMeta(id, valor) {
    const valorSolicitado = Math.abs(
      Number(valor) || 0
    );

    if (valorSolicitado <= 0) return;

    const metaEncontrada = metas.find(
      (meta) => meta.id === id
    );

    if (!metaEncontrada) return;

    const valorDisponivel = Number(
      metaEncontrada.valorAtual || 0
    );

    const valorRetirado = Math.min(
      valorSolicitado,
      valorDisponivel
    );

    if (valorRetirado <= 0) return;

    setMetas((listaAtual) =>
      listaAtual.map((meta) =>
        meta.id === id
          ? {
              ...meta,

              valorAtual:
                Number(meta.valorAtual || 0) -
                valorRetirado,
            }
          : meta
      )
    );

    const novaMovimentacao =
      criarMovimentacaoMeta({
        metaId: metaEncontrada.id,
        nomeMeta: metaEncontrada.nome,
        valor: valorRetirado,
        operacao: "Retirada de meta",
        direcao: "entrada",
      });

    setMovimentacoesMeta((listaAtual) => [
      ...listaAtual,
      novaMovimentacao,
    ]);
  }

  const receitasConfirmadas =
    receitas.filter(
      (item) => item.status === "confirmado"
    );

  const despesasConfirmadas =
    despesas.filter(
      (item) => item.status === "confirmado"
    );

  const investimentosConfirmados =
    investimentos.filter(
      (item) => item.status === "confirmado"
    );

  const totalReceitas =
    receitasConfirmadas.reduce(
      (total, item) =>
        total + Number(item.valor || 0),
      0
    );

  const totalDespesas =
    despesasConfirmadas.reduce(
      (total, item) =>
        total + Number(item.valor || 0),
      0
    );

  const totalInvestimentos =
    investimentosConfirmados.reduce(
      (total, item) =>
        total + Number(item.valor || 0),
      0
    );

  const totalMetas = metas.reduce(
    (total, meta) =>
      total + Number(meta.valorAtual || 0),
    0
  );

  const totalObjetivosMetas =
    metas.reduce(
      (total, meta) =>
        total + Number(meta.valorAlvo || 0),
      0
    );

  /*
    Dinheiro que pode ser usado agora.

    Investimentos e metas diminuem o saldo disponível,
    pois o dinheiro saiu da conta principal.
  */
  const saldoDisponivel =
    totalReceitas -
    totalDespesas -
    totalInvestimentos -
    totalMetas;

  /*
    Patrimônio total não perde investimentos ou metas.

    Esse dinheiro apenas mudou de lugar.
  */
  const patrimonioTotal =
    saldoDisponivel +
    totalInvestimentos +
    totalMetas;

  /*
    Tudo que passou pelo sistema.

    Isso não representa lucro nem saldo.
  */
  const volumeTransacoes =
    [
      ...receitasConfirmadas,
      ...despesasConfirmadas,
      ...investimentosConfirmados,
    ].reduce(
      (total, item) =>
        total +
        Math.abs(Number(item.valor || 0)),
      0
    );

  const volumeMetas =
    movimentacoesMeta
      .filter(
        (item) => item.status === "confirmado"
      )
      .reduce(
        (total, item) =>
          total +
          Math.abs(Number(item.valor || 0)),
        0
      );

  const volumeMovimentado =
    volumeTransacoes + volumeMetas;

  const quantidadeMovimentacoes =
    receitasConfirmadas.length +
    despesasConfirmadas.length +
    investimentosConfirmados.length +
    movimentacoesMeta.filter(
      (item) => item.status === "confirmado"
    ).length;

  const percentualMetas =
    totalObjetivosMetas > 0
      ? Math.min(
          (totalMetas /
            totalObjetivosMetas) *
            100,
          100
        )
      : 0;

  const transacoes = [
    ...receitas,
    ...despesas,
    ...investimentos,
  ].sort((a, b) => {
    const dataA =
      a.criadaEm || String(a.id);

    const dataB =
      b.criadaEm || String(b.id);

    return String(dataB).localeCompare(
      String(dataA)
    );
  });

  const movimentacoesFinanceiras = [
    ...receitas,
    ...despesas,
    ...investimentos,
    ...movimentacoesMeta,
  ].sort((a, b) => {
    const dataA =
      a.criadaEm || String(a.id);

    const dataB =
      b.criadaEm || String(b.id);

    return String(dataB).localeCompare(
      String(dataA)
    );
  });

  const saldo = saldoDisponivel;

  return (
    <FinanceContext.Provider
      value={{
        receitas,
        despesas,
        investimentos,
        metas,
        movimentacoesMeta,

        totalReceitas,
        totalDespesas,
        totalInvestimentos,
        totalMetas,
        totalObjetivosMetas,

        saldo,
        saldoDisponivel,
        patrimonioTotal,

        volumeMovimentado,
        quantidadeMovimentacoes,
        percentualMetas,

        transacoes,
        movimentacoesFinanceiras,

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
        retirarValorMeta,
      }}
    >
      {children}
    </FinanceContext.Provider>
  );
}

export function useFinance() {
  const contexto = useContext(
    FinanceContext
  );

  if (!contexto) {
    throw new Error(
      "useFinance precisa estar dentro de FinanceProvider."
    );
  }

  return contexto;
}

export default FinanceContext;
