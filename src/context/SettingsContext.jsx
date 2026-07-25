import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { useAuth } from "./AuthContext";

const SettingsContext = createContext(null);

const CHAVE_CONFIGURACOES = "mahafinance-settings";
const CHAVE_DONO_CONFIGURACOES =
  "mahafinance-settings-dono-legado";
const CHAVE_COTACOES = "mahafinance-cotacoes";

const TEMPO_CACHE_COTACOES = 6 * 60 * 60 * 1000;

const configuracoesIniciais = {
  nome: "",
  moeda: "BRL",
  tema: "escuro",
  mostrarCentavos: true,
  formatoData: "dd/MM/yyyy",
};

function obterConfiguracoesSalvas(chave) {
  try {
    const salvo = localStorage.getItem(chave);

    if (!salvo) {
      return null;
    }

    return {
      ...configuracoesIniciais,
      ...JSON.parse(salvo),
    };
  } catch {
    return null;
  }
}

function criarConfiguracoesIniciais(usuario) {
  const nome =
    usuario?.user_metadata?.nome?.trim() ||
    usuario?.user_metadata?.full_name?.trim() ||
    usuario?.email?.split("@")[0] ||
    "";

  return {
    ...configuracoesIniciais,
    nome,
  };
}

const cotacoesIniciais = {
  BRL: 1,
  USD: 1,
  EUR: 1,
  CNY: 1,
};

const temas = {
  escuro: {
    fundo: "#0F172A",
    fundoSecundario: "#111827",
    painel: "#1E293B",
    painelHover: "#263449",
    borda: "#334155",
    texto: "#F8FAFC",
    textoSecundario: "#94A3B8",
    textoSuave: "#64748B",
    input: "#0F172A",
    sombra: "0 12px 35px rgba(0,0,0,.18)",
  },

  claro: {
    fundo: "#F1F5F9",
    fundoSecundario: "#E2E8F0",
    painel: "#FFFFFF",
    painelHover: "#F8FAFC",
    borda: "#CBD5E1",
    texto: "#0F172A",
    textoSecundario: "#475569",
    textoSuave: "#64748B",
    input: "#FFFFFF",
    sombra: "0 12px 35px rgba(15,23,42,.08)",
  },
};

export function SettingsProvider({ children }) {
  const {
    usuario,
    carregando: carregandoAutenticacao,
  } = useAuth();

  const identidadeConfiguracoes =
    usuario?.id || "publico";

  const chaveConfiguracoes =
    usuario?.id
      ? `${CHAVE_CONFIGURACOES}:${usuario.id}`
      : CHAVE_CONFIGURACOES;

  const [settings, setSettings] = useState(
    () =>
      obterConfiguracoesSalvas(
        CHAVE_CONFIGURACOES
      ) || criarConfiguracoesIniciais(null)
  );

  const [
    donoConfiguracoesCarregadas,
    setDonoConfiguracoesCarregadas,
  ] = useState("publico");

  const [cotacoes, setCotacoes] =
    useState(cotacoesIniciais);

  const [carregandoCotacoes, setCarregandoCotacoes] =
    useState(false);

  const [erroCotacoes, setErroCotacoes] =
    useState("");

  const [
    ultimaAtualizacaoCotacoes,
    setUltimaAtualizacaoCotacoes,
  ] = useState(null);

  const cores =
    temas[settings.tema] || temas.escuro;

  const temaEscuro =
    settings.tema === "escuro";

  useEffect(() => {
    if (
      carregandoAutenticacao ||
      donoConfiguracoesCarregadas ===
        identidadeConfiguracoes
    ) {
      return;
    }

    let configuracoesSalvas =
      obterConfiguracoesSalvas(chaveConfiguracoes);

    if (usuario?.id && !configuracoesSalvas) {
      const donoConfiguracoesLegadas =
        localStorage.getItem(
          CHAVE_DONO_CONFIGURACOES
        );

      const configuracoesLegadas =
        obterConfiguracoesSalvas(
          CHAVE_CONFIGURACOES
        );

      const podeMigrarConfiguracoesLegadas =
        configuracoesLegadas &&
        (!donoConfiguracoesLegadas ||
          donoConfiguracoesLegadas === usuario.id);

      if (podeMigrarConfiguracoesLegadas) {
        configuracoesSalvas =
          configuracoesLegadas;

        localStorage.setItem(
          CHAVE_DONO_CONFIGURACOES,
          usuario.id
        );
      }
    }

    setSettings(
      configuracoesSalvas ||
        criarConfiguracoesIniciais(usuario)
    );

    setDonoConfiguracoesCarregadas(
      identidadeConfiguracoes
    );
  }, [
    carregandoAutenticacao,
    chaveConfiguracoes,
    donoConfiguracoesCarregadas,
    identidadeConfiguracoes,
    usuario,
  ]);

  useEffect(() => {
    if (
      carregandoAutenticacao ||
      donoConfiguracoesCarregadas !==
        identidadeConfiguracoes
    ) {
      return;
    }

    localStorage.setItem(
      chaveConfiguracoes,
      JSON.stringify(settings)
    );
  }, [
    carregandoAutenticacao,
    chaveConfiguracoes,
    donoConfiguracoesCarregadas,
    identidadeConfiguracoes,
    settings,
  ]);

  useEffect(() => {
    const raiz = document.documentElement;

    raiz.dataset.theme =
      temaEscuro ? "dark" : "light";

    raiz.style.setProperty(
      "--bg-primary",
      cores.fundo
    );

    raiz.style.setProperty(
      "--bg-secondary",
      cores.fundoSecundario
    );

    raiz.style.setProperty(
      "--panel-bg",
      cores.painel
    );

    raiz.style.setProperty(
      "--panel-hover",
      cores.painelHover
    );

    raiz.style.setProperty(
      "--border-color",
      cores.borda
    );

    raiz.style.setProperty(
      "--text-primary",
      cores.texto
    );

    raiz.style.setProperty(
      "--text-secondary",
      cores.textoSecundario
    );

    raiz.style.setProperty(
      "--text-muted",
      cores.textoSuave
    );

    raiz.style.setProperty(
      "--input-bg",
      cores.input
    );

    raiz.style.setProperty(
      "--app-shadow",
      cores.sombra
    );

    raiz.style.background = cores.fundo;

    document.body.style.background = cores.fundo;
    document.body.style.color = cores.texto;

    document.body.style.margin = "0";

    raiz.style.colorScheme =
      temaEscuro ? "dark" : "light";
  }, [cores, temaEscuro]);

  useEffect(() => {
    carregarCotacoes();
  }, []);

  function obterCotacoesSalvas() {
    try {
      const salvo = localStorage.getItem(
        CHAVE_COTACOES
      );

      if (!salvo) return null;

      const dados = JSON.parse(salvo);

      return dados;
    } catch {
      return null;
    }
  }

  function salvarCotacoes(
    novasCotacoes,
    atualizadoEm
  ) {
    localStorage.setItem(
      CHAVE_COTACOES,
      JSON.stringify({
        cotacoes: novasCotacoes,
        atualizadoEm,
      })
    );
  }

  // ========= NOVA API =========

  async function buscarTaxa(moeda) {
    const resposta = await fetch(
      `https://api.frankfurter.app/latest?from=BRL&to=${moeda}`
    );

    if (!resposta.ok) {
      throw new Error(
        `Erro ao buscar ${moeda}`
      );
    }

    const dados = await resposta.json();

    const taxa = Number(
      dados.rates?.[moeda]
    );

    if (!taxa || taxa <= 0) {
      throw new Error(
        `Cotação inválida para ${moeda}`
      );
    }

    return taxa;
  }
    async function carregarCotacoes({
    forcarAtualizacao = false,
  } = {}) {
    const dadosSalvos = obterCotacoesSalvas();

    if (dadosSalvos) {
      setCotacoes(dadosSalvos.cotacoes);

      setUltimaAtualizacaoCotacoes(
        new Date(dadosSalvos.atualizadoEm)
      );

      const cacheValido =
        Date.now() - dadosSalvos.atualizadoEm <
        TEMPO_CACHE_COTACOES;

      if (cacheValido && !forcarAtualizacao) {
        return;
      }
    }

    setCarregandoCotacoes(true);
    setErroCotacoes("");

    try {
      const [usd, eur, cny] = await Promise.all([
        buscarTaxa("USD"),
        buscarTaxa("EUR"),
        buscarTaxa("CNY"),
      ]);

      const novasCotacoes = {
        BRL: 1,
        USD: usd,
        EUR: eur,
        CNY: cny,
      };

      const atualizadoEm = Date.now();

      setCotacoes(novasCotacoes);

      setUltimaAtualizacaoCotacoes(
        new Date(atualizadoEm)
      );

      salvarCotacoes(
        novasCotacoes,
        atualizadoEm
      );
    } catch (erro) {
      console.error(erro);

      setErroCotacoes(
        "Não foi possível atualizar as cotações."
      );

      if (dadosSalvos?.cotacoes) {
        setCotacoes(dadosSalvos.cotacoes);
      } else {
        setCotacoes(cotacoesIniciais);
      }
    } finally {
      setCarregandoCotacoes(false);
    }
  }

  function atualizarSetting(chave, valor) {
    setSettings((anterior) => ({
      ...anterior,
      [chave]: valor,
    }));
  }

  function alternarTema() {
    setSettings((anterior) => ({
      ...anterior,
      tema:
        anterior.tema === "escuro"
          ? "claro"
          : "escuro",
    }));
  }

  function restaurarConfiguracoes() {
    localStorage.removeItem(
      chaveConfiguracoes
    );

    localStorage.removeItem(
      CHAVE_COTACOES
    );

    setSettings(
      criarConfiguracoesIniciais(usuario)
    );

    setCotacoes(cotacoesIniciais);

    carregarCotacoes({
      forcarAtualizacao: true,
    });
  }

  function converterMoeda(
    valorEmReais,
    moedaDestino = settings.moeda
  ) {
    const valor = Number(valorEmReais);

    if (!Number.isFinite(valor))
      return 0;

    if (moedaDestino === "BRL")
      return valor;

    const taxa =
      cotacoes[moedaDestino];

    if (
      !Number.isFinite(taxa) ||
      taxa <= 0
    ) {
      return valor;
    }

    return valor * taxa;
  }

  function formatarMoeda(
    valor,
    moeda = settings.moeda
  ) {
    const convertido =
      converterMoeda(valor, moeda);

    return new Intl.NumberFormat(
      "pt-BR",
      {
        style: "currency",
        currency: moeda,
        minimumFractionDigits:
          settings.mostrarCentavos
            ? 2
            : 0,
        maximumFractionDigits:
          settings.mostrarCentavos
            ? 2
            : 0,
      }
    ).format(convertido);
  }

  function obterCotacao(
    moeda = settings.moeda
  ) {
    return cotacoes[moeda] || 1;
  }

  const textoUltimaAtualizacao =
    useMemo(() => {
      if (!ultimaAtualizacaoCotacoes)
        return "";

      return new Intl.DateTimeFormat(
        "pt-BR",
        {
          dateStyle: "short",
          timeStyle: "short",
        }
      ).format(
        ultimaAtualizacaoCotacoes
      );
    }, [ultimaAtualizacaoCotacoes]);
      return (
    <SettingsContext.Provider
      value={{
        settings,

        // Tema
        cores,
        temas,
        temaEscuro,

        atualizarSetting,
        alternarTema,
        restaurarConfiguracoes,

        // Cotações
        cotacoes,
        obterCotacao,
        carregarCotacoes,
        carregandoCotacoes,
        erroCotacoes,

        ultimaAtualizacaoCotacoes,
        textoUltimaAtualizacao,

        // Conversão
        converterMoeda,
        formatarMoeda,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const contexto = useContext(SettingsContext);

  if (!contexto) {
    throw new Error(
      "useSettings deve ser usado dentro de SettingsProvider."
    );
  }

  return contexto;
}

export default SettingsContext;
