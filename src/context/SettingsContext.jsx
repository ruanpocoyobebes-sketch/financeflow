import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

const SettingsContext = createContext(null);

const configuracoesIniciais = {
  nome: "",
  tema: "dark",
  moeda: "BRL",
  mostrarCentavos: true,
  formatoData: "dd/MM/yyyy",
};

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(() => {
    try {
      const configuracoesSalvas = localStorage.getItem(
        "financeflow-settings"
      );

      if (configuracoesSalvas) {
        return {
          ...configuracoesIniciais,
          ...JSON.parse(configuracoesSalvas),
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
    try {
      localStorage.setItem(
        "financeflow-settings",
        JSON.stringify(settings)
      );
    } catch (erro) {
      console.error(
        "Erro ao salvar as configurações:",
        erro
      );
    }
  }, [settings]);

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