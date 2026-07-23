import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

const SettingsContext = createContext(null);

const CHAVE_CONFIGURACOES =
  "mahafinance-settings";

const CHAVE_COTACOES =
  "mahafinance-cotacoes";

const TEMPO_CACHE_COTACOES =
  6 * 60 * 60 * 1000;

const configuracoesIniciais = {
  nome: "",
  moeda: "BRL",
  mostrarCentavos: true,
  formatoData: "dd/MM/yyyy",
};

const cotacoesIniciais = {
  BRL: 1,
  USD: 1,
  EUR: 1,
};

export function SettingsProvider({
  children,
}) {
  const [settings, setSettings] =
    useState(() => {
      try {
        const configuracoesSalvas =
          localStorage.getItem(
            CHAVE_CONFIGURACOES
          );

        if (!configuracoesSalvas) {
          return configuracoesIniciais;
        }

        const configuracoesConvertidas =
          JSON.parse(configuracoesSalvas);

        return {
          ...configuracoesIniciais,

          nome:
            configuracoesConvertidas.nome ||
            "",

          moeda:
            configuracoesConvertidas.moeda ||
            "BRL",

          mostrarCentavos:
            configuracoesConvertidas
              .mostrarCentavos ?? true,

          formatoData:
            configuracoesConvertidas
              .formatoData ||
            "dd/MM/yyyy",
        };
      } catch (erro) {
        console.error(
          "Erro ao carregar as configurações:",
          erro
        );

        return configuracoesIniciais;
      }
    });

  const [cotacoes, setCotacoes] =
    useState(cotacoesIniciais);

  const [carregandoCotacoes, setCarregandoCotacoes] =
    useState(false);

  const [erroCotacoes, setErroCotacoes] =
    useState("");

  const [ultimaAtualizacaoCotacoes, setUltimaAtualizacaoCotacoes] =
    useState(null);

  useEffect(() => {
    localStorage.setItem(
      CHAVE_CONFIGURACOES,
      JSON.stringify(settings)
    );
  }, [settings]);

  useEffect(() => {
    document.documentElement.removeAttribute(
      "data-theme"
    );

    document.documentElement.style.background =
      "#0F172A";

    document.body.style.background =
      "#0F172A";

    document.body.style.color =
      "#FFFFFF";
  }, []);

  useEffect(() => {
    carregarCotacoes();
  }, []);

  function obterCotacoesSalvas() {
    try {
      const dadosSalvos =
        localStorage.getItem(
          CHAVE_COTACOES
        );

      if (!dadosSalvos) {
        return null;
      }

      const dadosConvertidos =
        JSON.parse(dadosSalvos);

      const cotacoesSalvas =
        dadosConvertidos.cotacoes;

      const atualizadoEm =
        Number(
          dadosConvertidos.atualizadoEm
        );

      if (
        !cotacoesSalvas ||
        !atualizadoEm
      ) {
        return null;
      }

      return {
        cotacoes: {
          BRL: 1,

          USD:
            Number(
              cotacoesSalvas.USD
            ) || 1,

          EUR:
            Number(
              cotacoesSalvas.EUR
            ) || 1,
        },

        atualizadoEm,
      };
    } catch (erro) {
      console.error(
        "Erro ao ler cotações salvas:",
        erro
      );

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

  async function buscarTaxa(
    moedaDestino
  ) {
    const resposta = await fetch(
      `https://api.frankfurter.dev/v2/rate/BRL/${moedaDestino}`
    );

    if (!resposta.ok) {
      throw new Error(
        `Não foi possível buscar a cotação BRL/${moedaDestino}.`
      );
    }

    const dados = await resposta.json();

    const taxa = Number(dados.rate);

    if (
      !Number.isFinite(taxa) ||
      taxa <= 0
    ) {
      throw new Error(
        `A cotação BRL/${moedaDestino} recebida é inválida.`
      );
    }

    return taxa;
  }

  async function carregarCotacoes({
    forcarAtualizacao = false,
  } = {}) {
    const dadosSalvos =
      obterCotacoesSalvas();

    if (dadosSalvos) {
      setCotacoes(
        dadosSalvos.cotacoes
      );

      setUltimaAtualizacaoCotacoes(
        new Date(
          dadosSalvos.atualizadoEm
        )
      );

      const cacheAindaValido =
        Date.now() -
          dadosSalvos.atualizadoEm <
        TEMPO_CACHE_COTACOES;

      if (
        cacheAindaValido &&
        !forcarAtualizacao
      ) {
        return;
      }
    }

    setCarregandoCotacoes(true);
    setErroCotacoes("");

    try {
      const [
        taxaDolar,
        taxaEuro,
      ] = await Promise.all([
        buscarTaxa("USD"),
        buscarTaxa("EUR"),
      ]);

      const novasCotacoes = {
        BRL: 1,
        USD: taxaDolar,
        EUR: taxaEuro,
      };

      const atualizadoEm =
        Date.now();

      setCotacoes(novasCotacoes);

      setUltimaAtualizacaoCotacoes(
        new Date(atualizadoEm)
      );

      salvarCotacoes(
        novasCotacoes,
        atualizadoEm
      );
    } catch (erro) {
      console.error(
        "Erro ao atualizar as cotações:",
        erro
      );

      setErroCotacoes(
        "Não foi possível atualizar as cotações. Os últimos valores disponíveis serão usados."
      );

      if (!dadosSalvos) {
        setCotacoes(
          cotacoesIniciais
        );
      }
    } finally {
      setCarregandoCotacoes(false);
    }
  }

  function atualizarSetting(
    chave,
    valor
  ) {
    setSettings(
      (configuracoesAnteriores) => ({
        ...configuracoesAnteriores,
        [chave]: valor,
      })
    );
  }

  function restaurarConfiguracoes() {
    setSettings(
      configuracoesIniciais
    );
  }

  function converterMoeda(
    valorEmReais,
    moedaDestino = settings.moeda
  ) {
    const valor = Number(
      valorEmReais
    );

    if (!Number.isFinite(valor)) {
      return 0;
    }

    if (
      moedaDestino === "BRL"
    ) {
      return valor;
    }

    const taxa = Number(
      cotacoes[moedaDestino]
    );

    if (
      !Number.isFinite(taxa) ||
      taxa <= 0
    ) {
      return valor;
    }

    return valor * taxa;
  }

  function formatarMoeda(
    valorEmReais,
    moedaDestino = settings.moeda
  ) {
    const valorConvertido =
      converterMoeda(
        valorEmReais,
        moedaDestino
      );

    const quantidadeCentavos =
      settings.mostrarCentavos
        ? 2
        : 0;

    return new Intl.NumberFormat(
      "pt-BR",
      {
        style: "currency",
        currency: moedaDestino,

        minimumFractionDigits:
          quantidadeCentavos,

        maximumFractionDigits:
          quantidadeCentavos,
      }
    ).format(valorConvertido);
  }

  function obterCotacao(
    moeda = settings.moeda
  ) {
    if (moeda === "BRL") {
      return 1;
    }

    return Number(
      cotacoes[moeda]
    ) || 1;
  }

  const textoUltimaAtualizacao =
    useMemo(() => {
      if (
        !ultimaAtualizacaoCotacoes
      ) {
        return "";
      }

      return new Intl.DateTimeFormat(
        "pt-BR",
        {
          dateStyle: "short",
          timeStyle: "short",
        }
      ).format(
        ultimaAtualizacaoCotacoes
      );
    }, [
      ultimaAtualizacaoCotacoes,
    ]);

  return (
    <SettingsContext.Provider
      value={{
        settings,

        atualizarSetting,
        restaurarConfiguracoes,

        cotacoes,
        obterCotacao,

        converterMoeda,
        formatarMoeda,

        carregarCotacoes,
        carregandoCotacoes,
        erroCotacoes,

        ultimaAtualizacaoCotacoes,
        textoUltimaAtualizacao,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const contexto = useContext(
    SettingsContext
  );

  if (!contexto) {
    throw new Error(
      "useSettings deve ser usado dentro de SettingsProvider."
    );
  }

  return contexto;
}

export default SettingsContext;