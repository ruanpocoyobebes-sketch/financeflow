import { useMemo, useState } from "react";
import { useFinance } from "../context/FinanceContext";
import { useSettings } from "../context/SettingsContext";

function Metas() {
  const { cores } = useSettings();
  const {
    metas = [],
    adicionarMeta,
    adicionarValorMeta,
    retirarValorMeta,
    removerMeta,
  } = useFinance();

  const [nome, setNome] = useState("");
  const [valorAlvo, setValorAlvo] = useState("");
  const [valorAtual, setValorAtual] = useState("");
  const [prazo, setPrazo] = useState("");
  const [busca, setBusca] = useState("");
  const [filtro, setFiltro] = useState("todas");
  const [ordenacao, setOrdenacao] = useState("progresso-maior");
  const [formularioAberto, setFormularioAberto] = useState(false);
  const [mensagemErro, setMensagemErro] = useState("");

  const formatarMoeda = (valor) => {
    const numero = Number(valor) || 0;

    return numero.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  };

  const converterValor = (valor) => {
    if (typeof valor === "number") {
      return valor;
    }

    const texto = String(valor || "")
      .trim()
      .replace(/\s/g, "")
      .replace(/\./g, "")
      .replace(",", ".");

    return Number(texto) || 0;
  };

  const converterPrazo = (data) => {
    if (!data) {
      return null;
    }

    if (data instanceof Date) {
      return Number.isNaN(data.getTime()) ? null : data;
    }

    if (typeof data === "string") {
      const texto = data.trim();

      if (/^\d{4}-\d{2}-\d{2}$/.test(texto)) {
        const dataConvertida = new Date(`${texto}T12:00:00`);

        return Number.isNaN(dataConvertida.getTime())
          ? null
          : dataConvertida;
      }

      if (/^\d{2}\/\d{2}\/\d{4}$/.test(texto)) {
        const [dia, mes, ano] = texto.split("/").map(Number);
        const dataConvertida = new Date(ano, mes - 1, dia, 12, 0, 0);

        return Number.isNaN(dataConvertida.getTime())
          ? null
          : dataConvertida;
      }
    }

    const dataConvertida = new Date(data);

    return Number.isNaN(dataConvertida.getTime())
      ? null
      : dataConvertida;
  };

  const formatarData = (data) => {
    const dataConvertida = converterPrazo(data);

    if (!dataConvertida) {
      return "Sem prazo";
    }

    return dataConvertida.toLocaleDateString("pt-BR");
  };

  const obterDiasRestantes = (data) => {
    const prazoConvertido = converterPrazo(data);

    if (!prazoConvertido) {
      return null;
    }

    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    prazoConvertido.setHours(0, 0, 0, 0);

    const diferenca = prazoConvertido.getTime() - hoje.getTime();

    return Math.ceil(diferenca / (1000 * 60 * 60 * 24));
  };

  const metasNormalizadas = useMemo(() => {
    return metas.map((meta) => {
      const alvo = Math.abs(Number(meta.valorAlvo) || 0);
      const atual = Math.max(Number(meta.valorAtual) || 0, 0);

      const progressoBruto = alvo > 0 ? (atual / alvo) * 100 : 0;
      const progresso = Math.min(Math.max(progressoBruto, 0), 100);
      const restante = Math.max(alvo - atual, 0);
      const diasRestantes = obterDiasRestantes(meta.prazo);

      let status = "em-andamento";

      if (atual >= alvo && alvo > 0) {
        status = "concluida";
      } else if (diasRestantes !== null && diasRestantes < 0) {
        status = "atrasada";
      } else if (
        diasRestantes !== null &&
        diasRestantes >= 0 &&
        diasRestantes <= 30
      ) {
        status = "prazo-proximo";
      }

      return {
        ...meta,
        nomeNormalizado: meta.nome?.trim() || "Meta sem nome",
        valorAlvoNumerico: alvo,
        valorAtualNumerico: atual,
        progresso,
        restante,
        diasRestantes,
        status,
      };
    });
  }, [metas]);

  const totalGuardado = useMemo(() => {
    return metasNormalizadas.reduce(
      (total, meta) => total + meta.valorAtualNumerico,
      0
    );
  }, [metasNormalizadas]);

  const totalObjetivos = useMemo(() => {
    return metasNormalizadas.reduce(
      (total, meta) => total + meta.valorAlvoNumerico,
      0
    );
  }, [metasNormalizadas]);

  const totalRestante = Math.max(totalObjetivos - totalGuardado, 0);

  const progressoGeral =
    totalObjetivos > 0
      ? Math.min((totalGuardado / totalObjetivos) * 100, 100)
      : 0;

  const metasConcluidas = metasNormalizadas.filter(
    (meta) => meta.status === "concluida"
  ).length;

  const metasFiltradas = useMemo(() => {
    const termoBusca = busca.trim().toLowerCase();

    const filtradas = metasNormalizadas.filter((meta) => {
      const correspondeBusca = meta.nomeNormalizado
        .toLowerCase()
        .includes(termoBusca);

      const correspondeFiltro =
        filtro === "todas" ||
        (filtro === "em-andamento" &&
          meta.status !== "concluida" &&
          meta.status !== "atrasada") ||
        (filtro === "concluidas" && meta.status === "concluida") ||
        (filtro === "atrasadas" && meta.status === "atrasada") ||
        (filtro === "sem-prazo" && !meta.prazo);

      return correspondeBusca && correspondeFiltro;
    });

    return [...filtradas].sort((a, b) => {
      switch (ordenacao) {
        case "progresso-menor":
          return a.progresso - b.progresso;

        case "maior-objetivo":
          return b.valorAlvoNumerico - a.valorAlvoNumerico;

        case "menor-objetivo":
          return a.valorAlvoNumerico - b.valorAlvoNumerico;

        case "mais-guardado":
          return b.valorAtualNumerico - a.valorAtualNumerico;

        case "prazo-proximo": {
          const prazoA = converterPrazo(a.prazo)?.getTime() || Infinity;
          const prazoB = converterPrazo(b.prazo)?.getTime() || Infinity;

          return prazoA - prazoB;
        }

        case "nome":
          return a.nomeNormalizado.localeCompare(
            b.nomeNormalizado,
            "pt-BR"
          );

        case "progresso-maior":
        default:
          return b.progresso - a.progresso;
      }
    });
  }, [metasNormalizadas, busca, filtro, ordenacao]);

  function limparFormulario() {
    setNome("");
    setValorAlvo("");
    setValorAtual("");
    setPrazo("");
    setMensagemErro("");
  }

  function criarMeta(evento) {
    evento.preventDefault();

    const nomeLimpo = nome.trim();
    const alvoConvertido = converterValor(valorAlvo);
    const atualConvertido = converterValor(valorAtual);

    if (!nomeLimpo) {
      setMensagemErro("Digite um nome para a meta.");
      return;
    }

    if (alvoConvertido <= 0) {
      setMensagemErro("O valor alvo precisa ser maior que zero.");
      return;
    }

    if (atualConvertido < 0) {
      setMensagemErro("O valor guardado não pode ser negativo.");
      return;
    }

    adicionarMeta(
      nomeLimpo,
      alvoConvertido,
      atualConvertido,
      prazo
    );

    limparFormulario();
    setFormularioAberto(false);
  }

  function solicitarValor(mensagem) {
    const resposta = window.prompt(mensagem);

    if (resposta === null || resposta.trim() === "") {
      return null;
    }

    const valorConvertido = converterValor(resposta);

    if (valorConvertido <= 0) {
      window.alert("Digite um valor maior que zero.");
      return null;
    }

    return valorConvertido;
  }

  function adicionarValor(id) {
    const valor = solicitarValor(
      "Quanto você deseja adicionar à meta?"
    );

    if (valor === null) {
      return;
    }

    adicionarValorMeta(id, valor);
  }

  function retirarValor(id) {
    const valor = solicitarValor(
      "Quanto você deseja retirar da meta?"
    );

    if (valor === null) {
      return;
    }

    retirarValorMeta(id, valor);
  }

  function excluirMeta(meta) {
    const possuiValor = meta.valorAtualNumerico > 0;

    const mensagem = possuiValor
      ? `A meta "${meta.nomeNormalizado}" possui ${formatarMoeda(
          meta.valorAtualNumerico
        )}. Ao excluir, esse valor retornará ao saldo disponível. Deseja continuar?`
      : `Deseja realmente excluir a meta "${meta.nomeNormalizado}"?`;

    const confirmou = window.confirm(mensagem);

    if (confirmou) {
      removerMeta(meta.id);
    }
  }

  const obterStatus = (meta) => {
    switch (meta.status) {
      case "concluida":
        return {
          texto: "Concluída",
          estilo: estilos.statusConcluida,
        };

      case "atrasada":
        return {
          texto: "Prazo vencido",
          estilo: estilos.statusAtrasada,
        };

      case "prazo-proximo":
        return {
          texto: "Prazo próximo",
          estilo: estilos.statusProximo,
        };

      default:
        return {
          texto: "Em andamento",
          estilo: estilos.statusAndamento,
        };
    }
  };

  const obterTextoPrazo = (meta) => {
    if (!meta.prazo || meta.diasRestantes === null) {
      return "Sem prazo definido";
    }

    if (meta.diasRestantes === 0) {
      return "O prazo termina hoje";
    }

    if (meta.diasRestantes === 1) {
      return "Falta 1 dia";
    }

    if (meta.diasRestantes > 1) {
      return `Faltam ${meta.diasRestantes} dias`;
    }

    if (meta.diasRestantes === -1) {
      return "Venceu há 1 dia";
    }

    return `Venceu há ${Math.abs(meta.diasRestantes)} dias`;
  };

  const estilos = {
    pagina: {
      width: "100%",
      display: "flex",
      flexDirection: "column",
      gap: "24px",
    },

    cabecalho: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "flex-start",
      gap: "16px",
      flexWrap: "wrap",
    },

    titulo: {
      margin: 0,
      color: `${cores.texto}`,
      fontSize: "30px",
      fontWeight: 800,
    },

    subtitulo: {
      margin: "8px 0 0",
      color: `${cores.textoSecundario}`,
      fontSize: "15px",
      lineHeight: 1.5,
    },

    botaoNovaMeta: {
      padding: "12px 18px",
      border: "none",
      borderRadius: "11px",
      background: "linear-gradient(135deg, #7C3AED, #A855F7)",
      color: "#FFFFFF",
      fontSize: "14px",
      fontWeight: 750,
      cursor: "pointer",
      boxShadow: "0 10px 24px rgba(124, 58, 237, 0.24)",
    },

    gradeCards: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))",
      gap: "16px",
    },

    card: {
      padding: "20px",
      border: `1px solid ${cores.borda}`,
      borderRadius: "18px",
      background: cores.painel,
      boxShadow: cores.sombra,
    },

    cardDestaque: {
      padding: "20px",
      border: "1px solid rgba(168, 85, 247, 0.3)",
      borderRadius: "18px",
      background:
        cores.painel === "#FFFFFF"
          ? "linear-gradient(145deg, #FAF5FF, #F3E8FF)"
          : "linear-gradient(145deg, rgba(107, 33, 168, 0.36), rgba(15, 23, 42, 0.96))",
      boxShadow: cores.sombra,
    },

    cardTopo: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      gap: "12px",
      marginBottom: "14px",
    },

    cardLabel: {
      color: `${cores.textoSecundario}`,
      fontSize: "14px",
      fontWeight: 600,
    },

    cardIcone: {
      width: "38px",
      height: "38px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      borderRadius: "12px",
      background: "rgba(168, 85, 247, 0.13)",
      color: "#C084FC",
      fontSize: "18px",
      fontWeight: 800,
    },

    cardValor: {
      margin: 0,
      color: `${cores.texto}`,
      fontSize: "25px",
      fontWeight: 800,
      wordBreak: "break-word",
    },

    cardDetalhe: {
      margin: "8px 0 0",
      color: `${cores.textoSuave}`,
      fontSize: "13px",
      lineHeight: 1.5,
    },

    painel: {
      border: `1px solid ${cores.borda}`,
      borderRadius: "18px",
      background: cores.painel,
      boxShadow: cores.sombra,
      overflow: "hidden",
    },

    painelCabecalho: {
      padding: "20px",
      borderBottom: `1px solid ${cores.borda}`,
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      gap: "16px",
      flexWrap: "wrap",
    },

    painelTitulo: {
      margin: 0,
      color: `${cores.texto}`,
      fontSize: "18px",
      fontWeight: 750,
    },

    painelDescricao: {
      margin: "6px 0 0",
      color: `${cores.textoSuave}`,
      fontSize: "13px",
      lineHeight: 1.5,
    },

    resumoGeral: {
      padding: "20px",
    },

    resumoTopo: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      gap: "12px",
      marginBottom: "14px",
      flexWrap: "wrap",
    },

    resumoTexto: {
      color: `${cores.texto}`,
      fontSize: "14px",
      fontWeight: 700,
    },

    resumoPercentual: {
      color: "#C084FC",
      fontSize: "18px",
      fontWeight: 800,
    },

    barraFundo: {
      width: "100%",
      height: "11px",
      overflow: "hidden",
      borderRadius: "999px",
      background: "rgba(148, 163, 184, 0.13)",
    },

    barraGeral: {
      width: `${progressoGeral}%`,
      height: "100%",
      borderRadius: "999px",
      background: "linear-gradient(90deg, #7C3AED, #C084FC)",
      transition: "width 0.3s ease",
    },

    formulario: {
      padding: "20px",
      display: "flex",
      flexDirection: "column",
      gap: "16px",
    },

    gradeFormulario: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))",
      gap: "14px",
    },

    campoGrupo: {
      display: "flex",
      flexDirection: "column",
      gap: "7px",
    },

    label: {
      color: `${cores.texto}`,
      fontSize: "13px",
      fontWeight: 700,
    },

    input: {
      width: "100%",
      boxSizing: "border-box",
      padding: "12px 13px",
      border: `1px solid ${cores.borda}`,
      borderRadius: "10px",
      outline: "none",
      background: `${cores.input}`,
      color: `${cores.texto}`,
      fontSize: "14px",
    },

    erro: {
      margin: 0,
      padding: "11px 13px",
      border: "1px solid rgba(239, 68, 68, 0.2)",
      borderRadius: "10px",
      background: "rgba(239, 68, 68, 0.08)",
      color: cores.painel === "#FFFFFF" ? "#B91C1C" : "#FCA5A5",
      fontSize: "13px",
    },

    acoesFormulario: {
      display: "flex",
      justifyContent: "flex-end",
      gap: "10px",
      flexWrap: "wrap",
    },

    botaoCancelar: {
      padding: "11px 16px",
      border: `1px solid ${cores.borda}`,
      borderRadius: "10px",
      background: "transparent",
      color: `${cores.texto}`,
      fontWeight: 700,
      cursor: "pointer",
    },

    botaoCriar: {
      padding: "11px 18px",
      border: "none",
      borderRadius: "10px",
      background: "#A855F7",
      color: "#FFFFFF",
      fontWeight: 750,
      cursor: "pointer",
    },

    filtros: {
      display: "flex",
      gap: "10px",
      alignItems: "center",
      flexWrap: "wrap",
    },

    inputBusca: {
      width: "220px",
      maxWidth: "100%",
      padding: "11px 13px",
      border: `1px solid ${cores.borda}`,
      borderRadius: "10px",
      outline: "none",
      background: `${cores.input}`,
      color: `${cores.texto}`,
      fontSize: "14px",
    },

    select: {
      padding: "11px 13px",
      border: `1px solid ${cores.borda}`,
      borderRadius: "10px",
      outline: "none",
      background: `${cores.input}`,
      color: `${cores.texto}`,
      fontSize: "14px",
      cursor: "pointer",
    },

    gradeMetas: {
      padding: "20px",
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(310px, 1fr))",
      gap: "18px",
    },

    metaCard: {
      padding: "20px",
      border: `1px solid ${cores.borda}`,
      borderRadius: "16px",
      background: cores.painelHover,
      boxShadow: cores.sombra,
    },

    metaTopo: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "flex-start",
      gap: "14px",
    },

    metaNome: {
      margin: 0,
      color: `${cores.texto}`,
      fontSize: "18px",
      fontWeight: 780,
      wordBreak: "break-word",
    },

    metaPrazo: {
      margin: "7px 0 0",
      color: `${cores.textoSuave}`,
      fontSize: "12px",
    },

    botaoExcluir: {
      width: "34px",
      height: "34px",
      minWidth: "34px",
      border: "1px solid rgba(239, 68, 68, 0.18)",
      borderRadius: "10px",
      background: "rgba(239, 68, 68, 0.08)",
      color: "#F87171",
      fontSize: "16px",
      cursor: "pointer",
    },

    statusAndamento: {
      display: "inline-flex",
      marginTop: "14px",
      padding: "6px 9px",
      borderRadius: "999px",
      background: "rgba(59, 130, 246, 0.1)",
      color: "#93C5FD",
      fontSize: "12px",
      fontWeight: 700,
    },

    statusConcluida: {
      display: "inline-flex",
      marginTop: "14px",
      padding: "6px 9px",
      borderRadius: "999px",
      background: "rgba(34, 197, 94, 0.1)",
      color: "#86EFAC",
      fontSize: "12px",
      fontWeight: 700,
    },

    statusAtrasada: {
      display: "inline-flex",
      marginTop: "14px",
      padding: "6px 9px",
      borderRadius: "999px",
      background: "rgba(239, 68, 68, 0.1)",
      color: "#FCA5A5",
      fontSize: "12px",
      fontWeight: 700,
    },

    statusProximo: {
      display: "inline-flex",
      marginTop: "14px",
      padding: "6px 9px",
      borderRadius: "999px",
      background: "rgba(245, 158, 11, 0.1)",
      color: "#FCD34D",
      fontSize: "12px",
      fontWeight: 700,
    },

    valoresMeta: {
      marginTop: "18px",
      display: "flex",
      justifyContent: "space-between",
      gap: "14px",
      flexWrap: "wrap",
    },

    valorPrincipal: {
      margin: 0,
      color: `${cores.texto}`,
      fontSize: "19px",
      fontWeight: 800,
    },

    valorSecundario: {
      margin: "5px 0 0",
      color: `${cores.textoSuave}`,
      fontSize: "12px",
    },

    valorDireita: {
      textAlign: "right",
    },

    metaBarraFundo: {
      width: "100%",
      height: "10px",
      marginTop: "18px",
      overflow: "hidden",
      borderRadius: "999px",
      background: cores.fundoSecundario,
    },

    metaBarra: {
      height: "100%",
      borderRadius: "999px",
      background: "linear-gradient(90deg, #7C3AED, #C084FC)",
      transition: "width 0.3s ease",
    },

    progressoLinha: {
      marginTop: "9px",
      display: "flex",
      justifyContent: "space-between",
      gap: "12px",
      color: `${cores.textoSecundario}`,
      fontSize: "12px",
    },

    acoesMeta: {
      marginTop: "18px",
      display: "flex",
      gap: "10px",
      flexWrap: "wrap",
    },

    botaoAdicionar: {
      flex: 1,
      minWidth: "130px",
      padding: "10px 14px",
      border: "none",
      borderRadius: "10px",
      background: "#7C3AED",
      color: "#FFFFFF",
      fontWeight: 750,
      cursor: "pointer",
    },

    botaoRetirar: {
      flex: 1,
      minWidth: "130px",
      padding: "10px 14px",
      border: `1px solid ${cores.borda}`,
      borderRadius: "10px",
      background: cores.fundoSecundario,
      color: `${cores.texto}`,
      fontWeight: 750,
      cursor: "pointer",
    },

    vazio: {
      padding: "55px 20px",
      textAlign: "center",
    },

    vazioIcone: {
      width: "58px",
      height: "58px",
      margin: "0 auto 16px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      borderRadius: "18px",
      background: "rgba(168, 85, 247, 0.12)",
      color: "#C084FC",
      fontSize: "25px",
      fontWeight: 800,
    },

    vazioTitulo: {
      margin: 0,
      color: `${cores.texto}`,
      fontSize: "17px",
      fontWeight: 750,
    },

    vazioTexto: {
      maxWidth: "430px",
      margin: "8px auto 0",
      color: `${cores.textoSuave}`,
      fontSize: "14px",
      lineHeight: 1.6,
    },
  };

  return (
    <div style={estilos.pagina}>
      <header style={estilos.cabecalho}>
        <div>
          <h1 style={estilos.titulo}>Metas financeiras</h1>

          <p style={estilos.subtitulo}>
            Organize seus objetivos, acompanhe o progresso e controle quanto
            ainda falta para concluir cada meta.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setFormularioAberto((estadoAtual) => !estadoAtual);
            setMensagemErro("");
          }}
          style={estilos.botaoNovaMeta}
        >
          {formularioAberto ? "Fechar formulário" : "+ Nova meta"}
        </button>
      </header>

      <section style={estilos.gradeCards}>
        <article style={estilos.cardDestaque}>
          <div style={estilos.cardTopo}>
            <span style={estilos.cardLabel}>Total guardado</span>
            <span style={estilos.cardIcone}>R$</span>
          </div>

          <p style={estilos.cardValor}>{formatarMoeda(totalGuardado)}</p>

          <p style={estilos.cardDetalhe}>
            Valor acumulado em todas as metas
          </p>
        </article>

        <article style={estilos.card}>
          <div style={estilos.cardTopo}>
            <span style={estilos.cardLabel}>Objetivo total</span>
            <span style={estilos.cardIcone}>◎</span>
          </div>

          <p style={estilos.cardValor}>{formatarMoeda(totalObjetivos)}</p>

          <p style={estilos.cardDetalhe}>
            Soma dos objetivos financeiros
          </p>
        </article>

        <article style={estilos.card}>
          <div style={estilos.cardTopo}>
            <span style={estilos.cardLabel}>Valor restante</span>
            <span style={estilos.cardIcone}>−</span>
          </div>

          <p style={estilos.cardValor}>{formatarMoeda(totalRestante)}</p>

          <p style={estilos.cardDetalhe}>
            Quanto ainda falta para todos os objetivos
          </p>
        </article>

        <article style={estilos.card}>
          <div style={estilos.cardTopo}>
            <span style={estilos.cardLabel}>Metas concluídas</span>
            <span style={estilos.cardIcone}>✓</span>
          </div>

          <p style={estilos.cardValor}>
            {metasConcluidas} de {metasNormalizadas.length}
          </p>

          <p style={estilos.cardDetalhe}>
            Objetivos que já atingiram 100%
          </p>
        </article>
      </section>

      <section style={estilos.painel}>
        <div style={estilos.resumoGeral}>
          <div style={estilos.resumoTopo}>
            <span style={estilos.resumoTexto}>
              Progresso geral das metas
            </span>

            <span style={estilos.resumoPercentual}>
              {progressoGeral.toFixed(1)}%
            </span>
          </div>

          <div style={estilos.barraFundo}>
            <div style={estilos.barraGeral} />
          </div>
        </div>
      </section>

      {formularioAberto && (
        <section style={estilos.painel}>
          <div style={estilos.painelCabecalho}>
            <div>
              <h2 style={estilos.painelTitulo}>Criar nova meta</h2>

              <p style={estilos.painelDescricao}>
                Informe o objetivo, o valor desejado e um prazo opcional.
              </p>
            </div>
          </div>

          <form onSubmit={criarMeta} style={estilos.formulario}>
            <div style={estilos.gradeFormulario}>
              <div style={estilos.campoGrupo}>
                <label style={estilos.label}>Nome da meta</label>

                <input
                  type="text"
                  placeholder="Ex.: Reserva de emergência"
                  value={nome}
                  onChange={(evento) => {
                    setNome(evento.target.value);
                    setMensagemErro("");
                  }}
                  style={estilos.input}
                />
              </div>

              <div style={estilos.campoGrupo}>
                <label style={estilos.label}>Valor alvo</label>

                <input
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="Ex.: 10000"
                  value={valorAlvo}
                  onChange={(evento) => {
                    setValorAlvo(evento.target.value);
                    setMensagemErro("");
                  }}
                  style={estilos.input}
                />
              </div>

              <div style={estilos.campoGrupo}>
                <label style={estilos.label}>
                  Valor inicial guardado
                </label>

                <input
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="Ex.: 500"
                  value={valorAtual}
                  onChange={(evento) => {
                    setValorAtual(evento.target.value);
                    setMensagemErro("");
                  }}
                  style={estilos.input}
                />
              </div>

              <div style={estilos.campoGrupo}>
                <label style={estilos.label}>Prazo</label>

                <input
                  type="date"
                  value={prazo}
                  onChange={(evento) => setPrazo(evento.target.value)}
                  style={estilos.input}
                />
              </div>
            </div>

            {mensagemErro && (
              <p style={estilos.erro}>{mensagemErro}</p>
            )}

            <div style={estilos.acoesFormulario}>
              <button
                type="button"
                onClick={() => {
                  limparFormulario();
                  setFormularioAberto(false);
                }}
                style={estilos.botaoCancelar}
              >
                Cancelar
              </button>

              <button type="submit" style={estilos.botaoCriar}>
                Criar meta
              </button>
            </div>
          </form>
        </section>
      )}

      <section style={estilos.painel}>
        <div style={estilos.painelCabecalho}>
          <div>
            <h2 style={estilos.painelTitulo}>Seus objetivos</h2>

            <p style={estilos.painelDescricao}>
              Acompanhe e atualize o valor de cada meta financeira.
            </p>
          </div>

          <div style={estilos.filtros}>
            <input
              type="text"
              placeholder="Buscar meta..."
              value={busca}
              onChange={(evento) => setBusca(evento.target.value)}
              style={estilos.inputBusca}
            />

            <select
              value={filtro}
              onChange={(evento) => setFiltro(evento.target.value)}
              style={estilos.select}
            >
              <option value="todas">Todas as metas</option>
              <option value="em-andamento">Em andamento</option>
              <option value="concluidas">Concluídas</option>
              <option value="atrasadas">Prazo vencido</option>
              <option value="sem-prazo">Sem prazo</option>
            </select>

            <select
              value={ordenacao}
              onChange={(evento) => setOrdenacao(evento.target.value)}
              style={estilos.select}
            >
              <option value="progresso-maior">
                Maior progresso
              </option>
              <option value="progresso-menor">
                Menor progresso
              </option>
              <option value="maior-objetivo">
                Maior objetivo
              </option>
              <option value="menor-objetivo">
                Menor objetivo
              </option>
              <option value="mais-guardado">
                Mais dinheiro guardado
              </option>
              <option value="prazo-proximo">
                Prazo mais próximo
              </option>
              <option value="nome">Nome</option>
            </select>
          </div>
        </div>

        {metasNormalizadas.length === 0 ? (
          <div style={estilos.vazio}>
            <div style={estilos.vazioIcone}>◎</div>

            <h3 style={estilos.vazioTitulo}>
              Nenhuma meta criada
            </h3>

            <p style={estilos.vazioTexto}>
              Crie seu primeiro objetivo financeiro para começar a acompanhar
              quanto já foi guardado e quanto ainda falta.
            </p>
          </div>
        ) : metasFiltradas.length === 0 ? (
          <div style={estilos.vazio}>
            <div style={estilos.vazioIcone}>?</div>

            <h3 style={estilos.vazioTitulo}>
              Nenhuma meta encontrada
            </h3>

            <p style={estilos.vazioTexto}>
              Não encontramos metas com os filtros selecionados. Tente alterar
              a busca, o status ou a ordenação.
            </p>
          </div>
        ) : (
          <div style={estilos.gradeMetas}>
            {metasFiltradas.map((meta) => {
              const status = obterStatus(meta);

              return (
                <article key={meta.id} style={estilos.metaCard}>
                  <div style={estilos.metaTopo}>
                    <div>
                      <h3 style={estilos.metaNome}>
                        {meta.nomeNormalizado}
                      </h3>

                      <p style={estilos.metaPrazo}>
                        {meta.prazo
                          ? `Prazo: ${formatarData(meta.prazo)}`
                          : "Sem prazo definido"}
                      </p>
                    </div>

                    <button
                      type="button"
                      title="Excluir meta"
                      onClick={() => excluirMeta(meta)}
                      style={estilos.botaoExcluir}
                    >
                      ×
                    </button>
                  </div>

                  <span style={status.estilo}>{status.texto}</span>

                  <div style={estilos.valoresMeta}>
                    <div>
                      <p style={estilos.valorPrincipal}>
                        {formatarMoeda(meta.valorAtualNumerico)}
                      </p>

                      <p style={estilos.valorSecundario}>
                        Valor guardado
                      </p>
                    </div>

                    <div style={estilos.valorDireita}>
                      <p style={estilos.valorPrincipal}>
                        {formatarMoeda(meta.valorAlvoNumerico)}
                      </p>

                      <p style={estilos.valorSecundario}>
                        Valor objetivo
                      </p>
                    </div>
                  </div>

                  <div style={estilos.metaBarraFundo}>
                    <div
                      style={{
                        ...estilos.metaBarra,
                        width: `${meta.progresso}%`,
                      }}
                    />
                  </div>

                  <div style={estilos.progressoLinha}>
                    <span>{meta.progresso.toFixed(1)}% concluído</span>

                    <span>{obterTextoPrazo(meta)}</span>
                  </div>

                  <p style={{ ...estilos.cardDetalhe, marginTop: "14px" }}>
                    {meta.restante > 0
                      ? `Ainda faltam ${formatarMoeda(meta.restante)}`
                      : "Objetivo financeiro alcançado"}
                  </p>

                  <div style={estilos.acoesMeta}>
                    <button
                      type="button"
                      onClick={() => adicionarValor(meta.id)}
                      style={estilos.botaoAdicionar}
                    >
                      + Adicionar valor
                    </button>

                    <button
                      type="button"
                      onClick={() => retirarValor(meta.id)}
                      disabled={meta.valorAtualNumerico <= 0}
                      style={{
                        ...estilos.botaoRetirar,
                        opacity:
                          meta.valorAtualNumerico <= 0 ? 0.45 : 1,
                        cursor:
                          meta.valorAtualNumerico <= 0
                            ? "not-allowed"
                            : "pointer",
                      }}
                    >
                      Retirar valor
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}

export default Metas;
