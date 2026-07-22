import { useSettings } from "../context/SettingsContext";

function Configuracoes() {
  const { settings, atualizarSetting } = useSettings();

  return (
    <div>
      <h1
        style={{
          color: "white",
          marginBottom: 10,
        }}
      >
        Configurações
      </h1>

      <p
        style={{
          color: "#94A3B8",
          marginBottom: 30,
        }}
      >
        Personalize o FinanceFlow.
      </p>

      <section
        style={{
          background: "#1E293B",
          padding: 25,
          borderRadius: 15,
          border: "1px solid #334155",
          marginBottom: 25,
        }}
      >
        <h2
          style={{
            color: "white",
            marginTop: 0,
          }}
        >
          👤 Perfil
        </h2>

        <label
          htmlFor="nome"
          style={{
            display: "block",
            color: "#CBD5E1",
            marginBottom: 8,
          }}
        >
          Nome
        </label>

        <input
          id="nome"
          value={settings.nome}
          onChange={(evento) =>
            atualizarSetting("nome", evento.target.value)
          }
          placeholder="Digite seu nome"
          style={{
            width: "100%",
            padding: 14,
            borderRadius: 10,
            border: "1px solid #334155",
            background: "#0F172A",
            color: "white",
            fontSize: 16,
            outline: "none",
          }}
        />
      </section>

      <section
        style={{
          background: "#1E293B",
          padding: 25,
          borderRadius: 15,
          border: "1px solid #334155",
          marginBottom: 25,
        }}
      >
        <h2
          style={{
            color: "white",
            marginTop: 0,
          }}
        >
          💰 Financeiro
        </h2>

        <label
          htmlFor="moeda"
          style={{
            display: "block",
            color: "#CBD5E1",
            marginBottom: 8,
          }}
        >
          Moeda
        </label>

        <select
          id="moeda"
          value={settings.moeda}
          onChange={(evento) =>
            atualizarSetting("moeda", evento.target.value)
          }
          style={{
            width: "100%",
            padding: 14,
            borderRadius: 10,
            background: "#0F172A",
            color: "white",
            border: "1px solid #334155",
            fontSize: 16,
          }}
        >
          <option value="BRL">Real brasileiro (R$)</option>
          <option value="USD">Dólar americano ($)</option>
          <option value="EUR">Euro (€)</option>
        </select>
      </section>

      <section
        style={{
          background: "#1E293B",
          padding: 25,
          borderRadius: 15,
          border: "1px solid #334155",
        }}
      >
        <h2
          style={{
            color: "white",
            marginTop: 0,
          }}
        >
          ℹ️ Sobre
        </h2>

        <p style={{ color: "#CBD5E1" }}>
          <strong>FinanceFlow</strong>
        </p>

        <p style={{ color: "#94A3B8" }}>
          Versão 1.0.0
        </p>
      </section>
    </div>
  );
}

export default Configuracoes;