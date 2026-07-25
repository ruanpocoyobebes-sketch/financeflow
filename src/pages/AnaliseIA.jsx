import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import { supabase } from "../lib/supabase";
import { usePerfil } from "../context/PerfilContext";
import { useSettings } from "../context/SettingsContext";
import { analiseIAService } from "../services/analiseIA";

const PERGUNTA_PADRAO =
  "Analise minha situação financeira atual. Aponte os principais problemas, os pontos positivos e apresente recomendações práticas para melhorar minha organização financeira.";

function formatarMoeda(valor) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(Number(valor || 0));
}

function formatarData(data) {
  if (!data) {
    return "Data não informada";
  }

  const dataConvertida = new Date(data);

  if (Number.isNaN(dataConvertida.getTime())) {
    return "Data não informada";
  }

  return dataConvertida.toLocaleString("pt-BR");
}

function normalizarTexto(valor) {
  return String(valor || "")
    .trim()
    .toLowerCase();
}

function obterValorRegistro(registro) {
  const possibilidades = [
    registro?.valor,
    registro?.valor_total,
    registro?.total,
    registro?.montante,
    registro?.preco,
  ];

  const valorEncontrado = possibilidades.find(
    (valor) =>
      valor !== undefined &&
      valor !== null &&
      valor !== ""
  );

  const numero = Number(valorEncontrado || 0);

  return Number.isFinite(numero) ? numero : 0;
}

function obterDescricaoRegistro(registro) {
  return (
    registro?.descricao ||
    registro?.nome ||
    registro?.titulo ||
    registro?.observacao ||
    registro?.categoria ||
    "Movimentação sem descrição"
  );
}

function obterCategoriaRegistro(registro) {
  return (
    registro?.categoria ||
    registro?.tipo ||
    registro?.grupo ||
    "Sem categoria"
  );
}

function calcularResumoFinanceiro(
  receitas,
  despesas
) {
  const receitasTratadas = Array.isArray(receitas)
    ? receitas
    : [];

  const despesasTratadas = Array.isArray(despesas)
    ? despesas
    : [];

  const totalReceitas = receitasTratadas.reduce(
    (total, receita) =>
      total + obterValorRegistro(receita),
    0
  );

  const totalDespesas = despesasTratadas.reduce(
    (total, despesa) =>
      total + obterValorRegistro(despesa),
    0
  );

  const saldoDisponivel =
    totalReceitas - totalDespesas;

  const taxaEconomia =
    totalReceitas > 0
      ? (saldoDisponivel / totalReceitas) * 100
      : 0;

  const totaisPorCategoria =
    despesasTratadas.reduce(
      (categorias, despesa) => {
        const categoria =
          obterCategoriaRegistro(despesa);

        const chave =
          normalizarTexto(categoria) ||
          "sem categoria";

        if (!categorias[chave]) {
          categorias[chave] = {
            nome: categoria,
            valor: 0,
          };
        }

        categorias[chave].valor +=
          obterValorRegistro(despesa);

        return categorias;
      },
      {}
    );

  const categoriasOrdenadas = Object.values(
    totaisPorCategoria
  ).sort((a, b) => b.valor - a.valor);

  const categoriaMaisCara =
    categoriasOrdenadas[0] || null;

  const despesasOrdenadas = [
    ...despesasTratadas,
  ].sort(
    (a, b) =>
      obterValorRegistro(b) -
      obterValorRegistro(a)
  );

  const maiorDespesa =
    despesasOrdenadas[0] || null;

  return {
    totalReceitas,
    totalDespesas,
    saldoDisponivel,
    quantidadeReceitas:
      receitasTratadas.length,
    quantidadeDespesas:
      despesasTratadas.length,
    taxaEconomia,
    categoriaMaisCara:
      categoriaMaisCara?.nome ||
      "Não identificada",
    valorCategoriaMaisCara:
      categoriaMaisCara?.valor || 0,
    maiorDespesaDescricao:
      maiorDespesa
        ? obterDescricaoRegistro(maiorDespesa)
        : "Não identificada",
    maiorDespesaValor: maiorDespesa
      ? obterValorRegistro(maiorDespesa)
      : 0,
  };
}

function CartaoResumo({
  titulo,
  valor,
  descricao,
  destaque,
}) {
  return (
    <article
      style={{
        ...estilos.cartaoResumo,
        ...(destaque
          ? estilos.cartaoResumoDestaque
          : {}),
      }}
    >
      <span style={estilos.cartaoResumoTitulo}>
        {titulo}
      </span>

      <strong style={estilos.cartaoResumoValor}>
        {valor}
      </strong>

      <span
        style={estilos.cartaoResumoDescricao}
      >
        {descricao}
      </span>
    </article>
  );
}

function AnaliseIA() {
  const { cores } = useSettings();
  const {
    perfil,
    plano,
    ehPremium,
    carregandoPerfil,
    erroPerfil,
  } = usePerfil();

  const temaClaro = cores.painel === "#FFFFFF";

  const variaveisTema = {
    "--ia-fundo": cores.fundo,
    "--ia-fundo-secundario": cores.fundoSecundario,
    "--ia-painel": cores.painel,
    "--ia-painel-hover": cores.painelHover,
    "--ia-borda": cores.borda,
    "--ia-texto": cores.texto,
    "--ia-texto-secundario": cores.textoSecundario,
    "--ia-texto-suave": cores.textoSuave,
    "--ia-input": cores.input,
    "--ia-sombra": cores.sombra,
    "--ia-roxo": temaClaro ? "#6D28D9" : "#A78BFA",
    "--ia-roxo-suave": temaClaro ? "#7C3AED" : "#C4B5FD",
    "--ia-verde": temaClaro ? "#15803D" : "#86EFAC",
    "--ia-vermelho": temaClaro ? "#B91C1C" : "#FCA5A5",
    "--ia-alerta-erro-fundo": temaClaro
      ? "#FEF2F2"
      : "rgba(127, 29, 29, 0.24)",
    "--ia-alerta-sucesso-fundo": temaClaro
      ? "#F0FDF4"
      : "rgba(20, 83, 45, 0.22)",
    "--ia-destaque": temaClaro
      ? "linear-gradient(145deg, #FAF5FF, #F3E8FF)"
      : "linear-gradient(145deg, rgba(76, 29, 149, 0.28), #111b2e)",
    "--ia-selecionado": temaClaro
      ? "#F3E8FF"
      : "rgba(76, 29, 149, 0.22)",
    "--ia-bloqueio": temaClaro
      ? "linear-gradient(145deg, #FAF5FF, #FFFFFF)"
      : "linear-gradient(145deg, rgba(76, 29, 149, 0.22), #111b2e)",
  };

  const estiloPagina = {
    ...estilos.pagina,
    ...variaveisTema,
  };

  const estiloCentralizado = {
    ...estilos.centralizado,
    ...variaveisTema,
  };

  const [titulo, setTitulo] = useState(
    "Análise Financeira Geral"
  );

  const [pergunta, setPergunta] = useState(
    PERGUNTA_PADRAO
  );

  const [receitas, setReceitas] = useState([]);
  const [despesas, setDespesas] = useState([]);

  const [historico, setHistorico] = useState(
    []
  );

  const [analiseAtual, setAnaliseAtual] =
    useState(null);

  const [carregandoDados, setCarregandoDados] =
    useState(false);

  const [
    carregandoHistorico,
    setCarregandoHistorico,
  ] = useState(false);

  const [gerando, setGerando] =
    useState(false);

  const [copiado, setCopiado] =
    useState(false);

  const [erro, setErro] = useState("");
  const [mensagem, setMensagem] =
    useState("");

  const resumo = useMemo(
    () =>
      calcularResumoFinanceiro(
        receitas,
        despesas
      ),
    [receitas, despesas]
  );

  const carregarDadosFinanceiros =
    useCallback(async () => {
      try {
        setCarregandoDados(true);
        setErro("");

        const {
          data: { user },
          error: erroUsuario,
        } = await supabase.auth.getUser();

        if (erroUsuario) {
          throw erroUsuario;
        }

        if (!user) {
          throw new Error(
            "Você precisa estar conectado."
          );
        }

        const [
          respostaReceitas,
          respostaDespesas,
        ] = await Promise.all([
          supabase
            .from("receitas")
            .select("*")
            .eq("user_id", user.id),

          supabase
            .from("despesas")
            .select("*")
            .eq("user_id", user.id),
        ]);

        if (respostaReceitas.error) {
          throw respostaReceitas.error;
        }

        if (respostaDespesas.error) {
          throw respostaDespesas.error;
        }

        setReceitas(
          respostaReceitas.data || []
        );

        setDespesas(
          respostaDespesas.data || []
        );
      } catch (erroCarregamento) {
        console.error(
          "Erro ao carregar dados financeiros:",
          erroCarregamento
        );

        setErro(
          erroCarregamento?.message ||
            "Não foi possível carregar os dados financeiros."
        );
      } finally {
        setCarregandoDados(false);
      }
    }, []);

  const carregarHistorico =
    useCallback(async () => {
      try {
        setCarregandoHistorico(true);
        setErro("");

        const lista =
          await analiseIAService.listar();

        setHistorico(lista || []);

        setAnaliseAtual((analiseAtualAnterior) => {
          if (analiseAtualAnterior || !lista?.length) {
            return analiseAtualAnterior;
          }

          return lista[0];
        });
      } catch (erroCarregamento) {
        console.error(
          "Erro ao carregar histórico:",
          erroCarregamento
        );

        setErro(
          erroCarregamento?.message ||
            "Não foi possível carregar o histórico."
        );
      } finally {
        setCarregandoHistorico(false);
      }
    }, []);

  useEffect(() => {
    if (
      carregandoPerfil ||
      !ehPremium
    ) {
      return;
    }

    carregarDadosFinanceiros();
    carregarHistorico();
  }, [
    carregandoPerfil,
    ehPremium,
    carregarDadosFinanceiros,
    carregarHistorico,
  ]);

  async function gerarAnalise() {
    try {
      setGerando(true);
      setErro("");
      setMensagem("");
      setCopiado(false);

      const tituloTratado =
        String(titulo || "").trim();

      const perguntaTratada =
        String(pergunta || "").trim();

      if (!tituloTratado) {
        throw new Error(
          "Digite um título para a análise."
        );
      }

      if (!perguntaTratada) {
        throw new Error(
          "Digite uma pergunta para a inteligência artificial."
        );
      }

      const resultado =
        await analiseIAService.gerar({
          titulo: tituloTratado,
          pergunta: perguntaTratada,
          dadosFinanceiros: resumo,
        });

      const novaAnalise =
        resultado.analise || {
          id: `temporaria-${Date.now()}`,
          titulo: tituloTratado,
          pergunta: perguntaTratada,
          resposta: resultado.resposta,
          modelo: resultado.modelo,
          created_at:
            new Date().toISOString(),
        };

      setAnaliseAtual(novaAnalise);

      setHistorico((historicoAtual) => {
        const existe =
          historicoAtual.some(
            (item) =>
              item.id === novaAnalise.id
          );

        if (existe) {
          return historicoAtual;
        }

        return [
          novaAnalise,
          ...historicoAtual,
        ];
      });

      setMensagem(
        resultado.mensagem ||
          "Análise gerada com sucesso."
      );
    } catch (erroGeracao) {
      console.error(
        "Erro ao gerar análise:",
        erroGeracao
      );

      setErro(
        erroGeracao?.message ||
          "Não foi possível gerar a análise."
      );
    } finally {
      setGerando(false);
    }
  }

  async function excluirAnalise(id) {
    try {
      if (
        !id ||
        String(id).startsWith(
          "temporaria-"
        )
      ) {
        setHistorico(
          historico.filter(
            (item) => item.id !== id
          )
        );

        if (analiseAtual?.id === id) {
          setAnaliseAtual(null);
        }

        return;
      }

      const confirmado = window.confirm(
        "Deseja realmente excluir esta análise?"
      );

      if (!confirmado) {
        return;
      }

      setErro("");
      setMensagem("");

      await analiseIAService.remover(id);

      setHistorico(
        historico.filter(
          (item) => item.id !== id
        )
      );

      if (analiseAtual?.id === id) {
        setAnaliseAtual(null);
      }

      setMensagem(
        "Análise excluída com sucesso."
      );
    } catch (erroExclusao) {
      console.error(
        "Erro ao excluir análise:",
        erroExclusao
      );

      setErro(
        erroExclusao?.message ||
          "Não foi possível excluir a análise."
      );
    }
  }

  async function copiarResposta() {
    try {
      if (!analiseAtual?.resposta) {
        return;
      }

      await navigator.clipboard.writeText(
        analiseAtual.resposta
      );

      setCopiado(true);

      window.setTimeout(() => {
        setCopiado(false);
      }, 2000);
    } catch (erroCopia) {
      console.error(
        "Erro ao copiar resposta:",
        erroCopia
      );

      setErro(
        "Não foi possível copiar a resposta."
      );
    }
  }

  function selecionarAnalise(analise) {
    setAnaliseAtual(analise);
    setTitulo(
      analise?.titulo ||
        "Análise Financeira Geral"
    );

    setPergunta(
      analise?.pergunta ||
        PERGUNTA_PADRAO
    );

    setErro("");
    setMensagem("");
    setCopiado(false);
  }

  function prepararNovaAnalise() {
    setAnaliseAtual(null);
    setTitulo(
      "Análise Financeira Geral"
    );
    setPergunta(PERGUNTA_PADRAO);
    setErro("");
    setMensagem("");
    setCopiado(false);
  }

  if (carregandoPerfil) {
    return (
      <div style={estiloCentralizado}>
        <div style={estilos.carregamento}>
          <div style={estilos.spinner} />

          <p style={estilos.textoCarregamento}>
            Verificando sua conta...
          </p>
        </div>
      </div>
    );
  }

  if (erroPerfil) {
    return (
      <div style={estiloPagina}>
        <div style={estilos.alertaErro}>
          {erroPerfil}
        </div>
      </div>
    );
  }

  if (!ehPremium) {
    return (
      <div style={estiloPagina}>
        <section style={estilos.bloqueio}>
          <div style={estilos.iconeBloqueio}>
            ✦
          </div>

          <span style={estilos.seloPremium}>
            Recurso Premium
          </span>

          <h1 style={estilos.tituloBloqueio}>
            Análise financeira com IA
          </h1>

          <p style={estilos.textoBloqueio}>
            O assistente financeiro analisa
            receitas, despesas, saldo e hábitos
            de consumo para apresentar
            recomendações personalizadas.
          </p>

          <div style={estilos.planoAtual}>
            Seu plano atual é{" "}
            <strong>
              {String(
                plano || "free"
              ).toUpperCase()}
            </strong>
          </div>
        </section>
      </div>
    );
  }
    return (
    <div style={estiloPagina}>
      <header style={estilos.cabecalho}>
        <div>
          <div style={estilos.linhaTitulo}>
            <span style={estilos.seloPremium}>
              Premium
            </span>

            <span style={estilos.statusIA}>
              Gemini conectado
            </span>
          </div>

          <h1 style={estilos.titulo}>
            Análise financeira com IA
          </h1>

          <p style={estilos.subtitulo}>
            Olá,{" "}
            {perfil?.nome || "usuário"}.
            Transforme seus dados financeiros
            em recomendações claras e práticas.
          </p>
        </div>

        <button
          type="button"
          onClick={prepararNovaAnalise}
          style={estilos.botaoSecundario}
        >
          + Nova análise
        </button>
      </header>

      {erro && (
        <div style={estilos.alertaErro}>
          <strong>Algo deu errado:</strong>{" "}
          {erro}
        </div>
      )}

      {mensagem && (
        <div style={estilos.alertaSucesso}>
          {mensagem}
        </div>
      )}

      <section style={estilos.gradeResumo}>
        <CartaoResumo
          titulo="Receitas"
          valor={
            carregandoDados
              ? "Carregando..."
              : formatarMoeda(
                  resumo.totalReceitas
                )
          }
          descricao={`${resumo.quantidadeReceitas} receitas cadastradas`}
        />

        <CartaoResumo
          titulo="Despesas"
          valor={
            carregandoDados
              ? "Carregando..."
              : formatarMoeda(
                  resumo.totalDespesas
                )
          }
          descricao={`${resumo.quantidadeDespesas} despesas cadastradas`}
        />

        <CartaoResumo
          titulo="Saldo disponível"
          valor={
            carregandoDados
              ? "Carregando..."
              : formatarMoeda(
                  resumo.saldoDisponivel
                )
          }
          descricao={`Economia de ${resumo.taxaEconomia.toFixed(
            1
          )}%`}
          destaque
        />

        <CartaoResumo
          titulo="Categoria mais cara"
          valor={
            carregandoDados
              ? "Carregando..."
              : resumo.categoriaMaisCara
          }
          descricao={formatarMoeda(
            resumo.valorCategoriaMaisCara
          )}
        />
      </section>

      <div style={estilos.gradePrincipal}>
        <section style={estilos.painel}>
          <div style={estilos.cabecalhoPainel}>
            <div>
              <span style={estilos.rotulo}>
                Assistente financeiro
              </span>

              <h2 style={estilos.tituloPainel}>
                Solicitar análise
              </h2>
            </div>

            <button
              type="button"
              onClick={
                carregarDadosFinanceiros
              }
              disabled={
                carregandoDados || gerando
              }
              style={{
                ...estilos.botaoAtualizar,
                ...((carregandoDados ||
                  gerando) &&
                  estilos.botaoDesativado),
              }}
            >
              {carregandoDados
                ? "Atualizando..."
                : "Atualizar dados"}
            </button>
          </div>

          <label style={estilos.grupoCampo}>
            <span style={estilos.label}>
              Título da análise
            </span>

            <input
              type="text"
              value={titulo}
              onChange={(evento) =>
                setTitulo(
                  evento.target.value
                )
              }
              placeholder="Ex.: Análise de despesas do mês"
              disabled={gerando}
              style={estilos.input}
            />
          </label>

          <label style={estilos.grupoCampo}>
            <span style={estilos.label}>
              O que você deseja analisar?
            </span>

            <textarea
              value={pergunta}
              onChange={(evento) =>
                setPergunta(
                  evento.target.value
                )
              }
              placeholder="Escreva uma pergunta para a IA..."
              disabled={gerando}
              rows={7}
              style={estilos.textarea}
            />
          </label>

          <div style={estilos.informacoesEnvio}>
            <span>
              Maior despesa:{" "}
              <strong>
                {
                  resumo.maiorDespesaDescricao
                }
              </strong>
            </span>

            <span>
              Valor:{" "}
              <strong>
                {formatarMoeda(
                  resumo.maiorDespesaValor
                )}
              </strong>
            </span>
          </div>

          <button
            type="button"
            onClick={gerarAnalise}
            disabled={
              gerando ||
              carregandoDados ||
              !pergunta.trim()
            }
            style={{
              ...estilos.botaoPrincipal,
              ...((gerando ||
                carregandoDados ||
                !pergunta.trim()) &&
                estilos.botaoDesativado),
            }}
          >
            {gerando
              ? "A IA está analisando..."
              : "Gerar análise financeira"}
          </button>

          {gerando && (
            <div style={estilos.caixaProcessando}>
              <div style={estilos.spinner} />

              <div>
                <strong>
                  Analisando seus dados
                </strong>

                <p
                  style={
                    estilos.textoProcessando
                  }
                >
                  O Gemini está comparando
                  receitas, despesas, saldo e
                  padrões de consumo.
                </p>
              </div>
            </div>
          )}
        </section>

        <aside style={estilos.painelHistorico}>
          <div style={estilos.cabecalhoHistorico}>
            <div>
              <span style={estilos.rotulo}>
                Análises salvas
              </span>

              <h2 style={estilos.tituloPainel}>
                Histórico
              </h2>
            </div>

            <span style={estilos.contador}>
              {historico.length}
            </span>
          </div>

          {carregandoHistorico ? (
            <div style={estilos.estadoVazio}>
              Carregando histórico...
            </div>
          ) : historico.length === 0 ? (
            <div style={estilos.estadoVazio}>
              <strong>
                Nenhuma análise encontrada
              </strong>

              <span>
                Sua primeira análise aparecerá
                aqui.
              </span>
            </div>
          ) : (
            <div style={estilos.listaHistorico}>
              {historico.map((analise) => {
                const selecionada =
                  analiseAtual?.id ===
                  analise.id;

                return (
                  <article
                    key={analise.id}
                    style={{
                      ...estilos.itemHistorico,
                      ...(selecionada
                        ? estilos.itemSelecionado
                        : {}),
                    }}
                  >
                    <button
                      type="button"
                      onClick={() =>
                        selecionarAnalise(
                          analise
                        )
                      }
                      style={
                        estilos.botaoSelecionar
                      }
                    >
                      <strong
                        style={
                          estilos.tituloHistorico
                        }
                      >
                        {analise.titulo ||
                          "Análise financeira"}
                      </strong>

                      <span
                        style={
                          estilos.dataHistorico
                        }
                      >
                        {formatarData(
                          analise.created_at
                        )}
                      </span>

                      <span
                        style={
                          estilos.previaHistorico
                        }
                      >
                        {String(
                          analise.resposta ||
                            ""
                        ).slice(0, 110)}
                        {String(
                          analise.resposta ||
                            ""
                        ).length > 110
                          ? "..."
                          : ""}
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        excluirAnalise(
                          analise.id
                        )
                      }
                      style={
                        estilos.botaoExcluir
                      }
                      title="Excluir análise"
                    >
                      Excluir
                    </button>
                  </article>
                );
              })}
            </div>
          )}
        </aside>
      </div>

      <section style={estilos.painelResposta}>
        <div style={estilos.cabecalhoResposta}>
          <div>
            <span style={estilos.rotulo}>
              Resultado
            </span>

            <h2 style={estilos.tituloPainel}>
              {analiseAtual?.titulo ||
                "Resposta da inteligência artificial"}
            </h2>

            {analiseAtual && (
              <span style={estilos.metaResposta}>
                {formatarData(
                  analiseAtual.created_at
                )}{" "}
                •{" "}
                {analiseAtual.modelo ||
                  "Gemini"}
              </span>
            )}
          </div>

          {analiseAtual?.resposta && (
            <button
              type="button"
              onClick={copiarResposta}
              style={estilos.botaoCopiar}
            >
              {copiado
                ? "Copiado"
                : "Copiar resposta"}
            </button>
          )}
        </div>

        {analiseAtual?.resposta ? (
          <div style={estilos.resposta}>
            {analiseAtual.resposta}
          </div>
        ) : (
          <div style={estilos.respostaVazia}>
            <div
              style={
                estilos.iconeRespostaVazia
              }
            >
              ✦
            </div>

            <strong>
              Sua análise aparecerá aqui
            </strong>

            <p>
              Preencha a pergunta acima e
              pressione “Gerar análise
              financeira”.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}

const estilos = {
  pagina: {
    width: "100%",
    maxWidth: "1400px",
    margin: "0 auto",
    paddingBottom: "60px",
    color: "var(--ia-texto)",
  },

  centralizado: {
    minHeight: "65vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "var(--ia-texto)",
  },

  carregamento: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "14px",
  },

  spinner: {
    width: "26px",
    height: "26px",
    border: "3px solid var(--ia-borda)",
    borderTopColor: "var(--ia-roxo)",
    borderRadius: "50%",
    animation:
      "spin 0.8s linear infinite",
  },

  textoCarregamento: {
    margin: 0,
    color: "var(--ia-texto-secundario)",
  },

  cabecalho: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: "24px",
    flexWrap: "wrap",
    marginBottom: "28px",
  },

  linhaTitulo: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    flexWrap: "wrap",
    marginBottom: "12px",
  },

  seloPremium: {
    display: "inline-flex",
    alignItems: "center",
    padding: "7px 11px",
    borderRadius: "999px",
    background:
      "rgba(139, 92, 246, 0.16)",
    color: "var(--ia-roxo-suave)",
    fontSize: "12px",
    fontWeight: 800,
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },

  statusIA: {
    display: "inline-flex",
    alignItems: "center",
    padding: "7px 11px",
    borderRadius: "999px",
    background:
      "rgba(34, 197, 94, 0.12)",
    color: "var(--ia-verde)",
    fontSize: "12px",
    fontWeight: 700,
  },

  titulo: {
    margin: "0 0 10px",
    color: "var(--ia-texto)",
    fontSize: "36px",
    lineHeight: 1.15,
  },

  subtitulo: {
    margin: 0,
    maxWidth: "720px",
    color: "var(--ia-texto-secundario)",
    fontSize: "15px",
    lineHeight: 1.7,
  },

  botaoSecundario: {
    minHeight: "44px",
    padding: "0 18px",
    border: "1px solid var(--ia-borda)",
    borderRadius: "12px",
    background: "var(--ia-fundo-secundario)",
    color: "var(--ia-texto)",
    fontWeight: 800,
    cursor: "pointer",
  },

  alertaErro: {
    marginBottom: "22px",
    padding: "15px 17px",
    border:
      "1px solid rgba(248, 113, 113, 0.45)",
    borderRadius: "12px",
    background: "var(--ia-alerta-erro-fundo)",
    color: "var(--ia-vermelho)",
    lineHeight: 1.5,
  },

  alertaSucesso: {
    marginBottom: "22px",
    padding: "15px 17px",
    border:
      "1px solid rgba(74, 222, 128, 0.35)",
    borderRadius: "12px",
    background: "var(--ia-alerta-sucesso-fundo)",
    color: "var(--ia-verde)",
  },

  gradeResumo: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(210px, 1fr))",
    gap: "16px",
    marginBottom: "22px",
  },

  cartaoResumo: {
    minHeight: "140px",
    padding: "20px",
    border: "1px solid var(--ia-borda)",
    borderRadius: "17px",
    background: "var(--ia-painel)",
    boxShadow: "var(--ia-sombra)",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    gap: "10px",
  },

  cartaoResumoDestaque: {
    border:
      "1px solid rgba(139, 92, 246, 0.55)",
    background: "var(--ia-destaque)",
  },

  cartaoResumoTitulo: {
    color: "var(--ia-texto-secundario)",
    fontSize: "13px",
    fontWeight: 700,
  },

  cartaoResumoValor: {
    color: "var(--ia-texto)",
    fontSize: "23px",
    wordBreak: "break-word",
  },

  cartaoResumoDescricao: {
    color: "var(--ia-texto-suave)",
    fontSize: "12px",
  },

  gradePrincipal: {
    display: "grid",
    gridTemplateColumns:
      "minmax(0, 1.6fr) minmax(300px, 0.8fr)",
    gap: "22px",
    alignItems: "start",
    marginBottom: "22px",
  },

  painel: {
    padding: "25px",
    border: "1px solid var(--ia-borda)",
    borderRadius: "18px",
    background: "var(--ia-painel)",
    boxShadow: "var(--ia-sombra)",
  },

  painelHistorico: {
    padding: "22px",
    border: "1px solid var(--ia-borda)",
    borderRadius: "18px",
    background: "var(--ia-painel)",
    boxShadow: "var(--ia-sombra)",
    maxHeight: "620px",
    overflowY: "auto",
  },

  cabecalhoPainel: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: "20px",
    flexWrap: "wrap",
    marginBottom: "24px",
  },

  cabecalhoHistorico: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "16px",
    marginBottom: "20px",
  },

  rotulo: {
    display: "block",
    marginBottom: "6px",
    color: "var(--ia-roxo)",
    fontSize: "11px",
    fontWeight: 900,
    textTransform: "uppercase",
    letterSpacing: "0.8px",
  },

  tituloPainel: {
    margin: 0,
    color: "var(--ia-texto)",
    fontSize: "22px",
  },

  contador: {
    minWidth: "34px",
    height: "34px",
    padding: "0 10px",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "999px",
    background: "var(--ia-fundo-secundario)",
    color: "var(--ia-texto)",
    fontWeight: 800,
  },

  botaoAtualizar: {
    minHeight: "38px",
    padding: "0 14px",
    border: "1px solid var(--ia-borda)",
    borderRadius: "10px",
    background: "transparent",
    color: "var(--ia-texto)",
    fontWeight: 700,
    cursor: "pointer",
  },

  grupoCampo: {
    display: "flex",
    flexDirection: "column",
    gap: "9px",
    marginBottom: "18px",
  },

  label: {
    color: "var(--ia-texto)",
    fontSize: "13px",
    fontWeight: 800,
  },

  input: {
    width: "100%",
    minHeight: "48px",
    boxSizing: "border-box",
    padding: "0 15px",
    border: "1px solid var(--ia-borda)",
    borderRadius: "11px",
    outline: "none",
    background: "var(--ia-input)",
    color: "var(--ia-texto)",
    fontSize: "14px",
  },

  textarea: {
    width: "100%",
    boxSizing: "border-box",
    padding: "15px",
    border: "1px solid var(--ia-borda)",
    borderRadius: "11px",
    outline: "none",
    resize: "vertical",
    background: "var(--ia-input)",
    color: "var(--ia-texto)",
    fontFamily: "inherit",
    fontSize: "14px",
    lineHeight: 1.6,
  },

  informacoesEnvio: {
    display: "flex",
    alignItems: "center",
    gap: "18px",
    flexWrap: "wrap",
    marginBottom: "18px",
    padding: "13px 15px",
    borderRadius: "11px",
    background: "var(--ia-fundo-secundario)",
    color: "var(--ia-texto-secundario)",
    fontSize: "12px",
  },

  botaoPrincipal: {
    width: "100%",
    minHeight: "52px",
    border: "none",
    borderRadius: "12px",
    background:
      "linear-gradient(135deg, #7c3aed, #4f46e5)",
    color: "#ffffff",
    fontSize: "14px",
    fontWeight: 900,
    cursor: "pointer",
    boxShadow:
      "0 14px 35px rgba(79, 70, 229, 0.25)",
  },

  botaoDesativado: {
    opacity: 0.55,
    cursor: "not-allowed",
  },

  caixaProcessando: {
    display: "flex",
    alignItems: "center",
    gap: "14px",
    marginTop: "17px",
    padding: "15px",
    border:
      "1px solid rgba(139, 92, 246, 0.3)",
    borderRadius: "12px",
    background:
      "rgba(76, 29, 149, 0.15)",
    color: "var(--ia-roxo-suave)",
  },

  textoProcessando: {
    margin: "5px 0 0",
    color: "var(--ia-roxo)",
    fontSize: "12px",
    lineHeight: 1.5,
  },

  listaHistorico: {
    display: "flex",
    flexDirection: "column",
    gap: "11px",
  },

  itemHistorico: {
    display: "flex",
    alignItems: "stretch",
    gap: "8px",
    padding: "11px",
    border: "1px solid var(--ia-borda)",
    borderRadius: "12px",
    background: "var(--ia-painel-hover)",
  },

  itemSelecionado: {
    border:
      "1px solid rgba(139, 92, 246, 0.65)",
    background: "var(--ia-selecionado)",
  },

  botaoSelecionar: {
    flex: 1,
    minWidth: 0,
    padding: 0,
    border: "none",
    background: "transparent",
    color: "inherit",
    textAlign: "left",
    cursor: "pointer",
  },

  tituloHistorico: {
    display: "block",
    marginBottom: "5px",
    color: "var(--ia-texto)",
    fontSize: "13px",
  },

  dataHistorico: {
    display: "block",
    marginBottom: "8px",
    color: "var(--ia-texto-suave)",
    fontSize: "10px",
  },

  previaHistorico: {
    display: "block",
    color: "var(--ia-texto-secundario)",
    fontSize: "11px",
    lineHeight: 1.45,
  },

  botaoExcluir: {
    alignSelf: "center",
    padding: "7px 8px",
    border: "none",
    borderRadius: "8px",
    background:
      "rgba(239, 68, 68, 0.1)",
    color: "var(--ia-vermelho)",
    fontSize: "10px",
    fontWeight: 800,
    cursor: "pointer",
  },

  estadoVazio: {
    minHeight: "180px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    color: "var(--ia-texto-suave)",
    textAlign: "center",
    fontSize: "13px",
  },

  painelResposta: {
    padding: "26px",
    border: "1px solid var(--ia-borda)",
    borderRadius: "18px",
    background: "var(--ia-painel)",
    boxShadow: "var(--ia-sombra)",
  },

  cabecalhoResposta: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: "20px",
    flexWrap: "wrap",
    paddingBottom: "20px",
    marginBottom: "22px",
    borderBottom: "1px solid var(--ia-borda)",
  },

  metaResposta: {
    display: "block",
    marginTop: "8px",
    color: "var(--ia-texto-suave)",
    fontSize: "11px",
  },

  botaoCopiar: {
    minHeight: "39px",
    padding: "0 14px",
    border: "1px solid var(--ia-borda)",
    borderRadius: "10px",
    background: "var(--ia-fundo-secundario)",
    color: "var(--ia-texto)",
    fontWeight: 800,
    cursor: "pointer",
  },

  resposta: {
    color: "var(--ia-texto)",
    fontSize: "14px",
    lineHeight: 1.85,
    whiteSpace: "pre-wrap",
    overflowWrap: "anywhere",
  },

  respostaVazia: {
    minHeight: "240px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    color: "var(--ia-texto-suave)",
    textAlign: "center",
  },

  iconeRespostaVazia: {
    marginBottom: "15px",
    color: "var(--ia-roxo)",
    fontSize: "42px",
  },

  bloqueio: {
    maxWidth: "660px",
    margin: "80px auto",
    padding: "46px",
    border:
      "1px solid rgba(139, 92, 246, 0.35)",
    borderRadius: "22px",
    background: "var(--ia-bloqueio)",
    boxShadow: "var(--ia-sombra)",
    textAlign: "center",
  },

  iconeBloqueio: {
    marginBottom: "15px",
    color: "var(--ia-roxo)",
    fontSize: "52px",
  },

  tituloBloqueio: {
    margin: "18px 0 12px",
    color: "var(--ia-texto)",
    fontSize: "31px",
  },

  textoBloqueio: {
    margin: "0 auto",
    maxWidth: "520px",
    color: "var(--ia-texto-secundario)",
    lineHeight: 1.75,
  },

  planoAtual: {
    marginTop: "25px",
    padding: "13px",
    borderRadius: "11px",
    background: "var(--ia-fundo-secundario)",
    color: "var(--ia-texto)",
  },
};

export default AnaliseIA;
