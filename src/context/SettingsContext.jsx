import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

const SettingsContext = createContext(null);

const configuracoesIniciais = {
  nome: "",
  moeda: "BRL",
  mostrarCentavos: true,
  formatoData: "dd/MM/yyyy",
};

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(() => {
    try {
      const configuracoesSalvas = localStorage.getItem(
        "mahafinance-settings"
      );

      if (configuracoesSalvas) {
        const configuracoesConvertidas = JSON.parse(
          configuracoesSalvas
        );

        return {
          ...configuracoesIniciais,
          nome: configuracoesConvertidas.nome || "",
          moeda: configuracoesConvertidas.moeda || "BRL",
          mostrarCentavos:
            configuracoesConvertidas.mostrarCentavos ?? true,
          formatoData:
            configuracoesConvertidas.formatoData ||
            "dd/MM/yyyy",
        };
      }

      return configuracoesIniciais;
    } catch (erro) {
      console.error(
        "Erro ao carregar as configurações:",
        erro
      );

      return configuracoesIniciais;
    }
  });

  useEffect(() => {
    localStorage.setItem(
      "mahafinance-settings",
      JSON.stringify(settings)
    );
  }, [settings]);

  useEffect(() => {
    document.documentElement.removeAttribute("data-theme");
    document.documentElement.style.background = "#0F172A";
    document.body.style.background = "#0F172A";
    document.body.style.color = "#FFFFFF";
  }, []);

  function atualizarSetting(chave, valor) {
    setSettings((configuracoesAnteriores) => ({
      ...configuracoesAnteriores,
      [chave]: valor,
    }));
  }

  function restaurarConfiguracoes() {
    setSettings(configuracoesIniciais);
  }

  return (
    <SettingsContext.Provider
      value={{
        settings,
        atualizarSetting,
        restaurarConfiguracoes,
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