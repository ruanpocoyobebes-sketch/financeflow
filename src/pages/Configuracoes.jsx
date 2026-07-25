import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext";
import { useSettings } from "../context/SettingsContext";

function Configuracoes() {
  const navigate = useNavigate();

  const {
    usuario,
    contasConhecidas,
    sair,
    atualizarContaConhecida,
  } = useAuth();

  const {
    settings,
    atualizarSetting,
    alternarTema,
    temaEscuro,
    cores,

    cotacoes,
    carregarCotacoes,
    carregandoCotacoes,
    erroCotacoes,
    textoUltimaAtualizacao,

    restaurarConfiguracoes,
  } = useSettings();

  const [nomeTemporario, setNomeTemporario] = useState(
    settings.nome || ""
  );

  const [mensagem, setMensagem] = useState("");
  const [trocandoConta, setTrocandoConta] =
    useState(false);

  useEffect(() => {
    setNomeTemporario(settings.nome || "");
  }, [settings.nome]);

  const moedas = [
    {
      codigo: "BRL",
      nome: "Real brasileiro",
      simbolo: "R$",
      pais: "Brasil",
      emoji: "🇧🇷",
    },
    {
      codigo: "USD",
      nome: "Dólar americano",
      simbolo: "$",
      pais: "Estados Unidos",
      emoji: "🇺🇸",
    },
    {
      codigo: "EUR",
      nome: "Euro",
      simbolo: "€",
      pais: "União Europeia",
      emoji: "🇪🇺",
    },
    {
      codigo: "CNY",
      nome: "Yuan chinês",
      simbolo: "¥",
      pais: "China",
      emoji: "🇨🇳",
    },
  ];

  const moedaAtual =
    moedas.find(
      (moeda) => moeda.codigo === settings.moeda
    ) || moedas[0];

  const contasDisponiveis = useMemo(() => {
    const contas = Array.isArray(contasConhecidas)
      ? contasConhecidas
      : [];

    if (
      !usuario?.id ||
      contas.some((conta) => conta.id === usuario.id)
    ) {
      return contas;
    }

    return [
      {
        id: usuario.id,
        email: usuario.email || "",
        nome:
          usuario.user_metadata?.nome ||
          usuario.email?.split("@")[0] ||
          "Usuário",
        avatarUrl:
          usuario.user_metadata?.avatar_url || "",
      },
      ...contas,
    ];
  }, [contasConhecidas, usuario]);

  const primeiraLetra = nomeTemporario.trim()
    ? nomeTemporario.trim().charAt(0).toUpperCase()
    : "U";

  function exibirMensagem(texto) {
    setMensagem(texto);

    window.setTimeout(() => {
      setMensagem("");
    }, 2500);
  }

  function salvarPerfil(evento) {
    evento.preventDefault();

    const nomeLimpo = nomeTemporario.trim();

    if (!nomeLimpo) {
      exibirMensagem("Digite um nome antes de salvar.");
      return;
    }

    atualizarSetting("nome", nomeLimpo);

    atualizarContaConhecida({
      id: usuario?.id,
      nome: nomeLimpo,
    });

    exibirMensagem("Perfil salvo com sucesso.");
  }

  async function abrirSeletorDeContas(conta = null) {
    if (trocandoConta) {
      return;
    }

    try {
      setTrocandoConta(true);

      await sair();

      if (conta?.email) {
        navigate("/login", {
          replace: true,
          state: {
            email: conta.email,
            from: "/app/configuracoes",
            trocandoConta: true,
          },
        });
        return;
      }

      navigate("/", {
        replace: true,
      });
    } catch (erro) {
      console.error(
        "Erro ao iniciar a troca de conta:",
        erro
      );

      exibirMensagem(
        "Não foi possível sair desta conta. Tente novamente."
      );
    } finally {
      setTrocandoConta(false);
    }
  }

  function obterInicialConta(conta) {
    const texto =
      conta.nome?.trim() ||
      conta.email?.trim() ||
      "U";

    return texto.charAt(0).toUpperCase();
  }

  function alterarMoeda(codigo) {
    atualizarSetting("moeda", codigo);

    exibirMensagem(`Moeda alterada para ${codigo}.`);
  }

  function alterarCentavos() {
    atualizarSetting(
      "mostrarCentavos",
      !settings.mostrarCentavos
    );
  }

  async function atualizarCotacoes() {
    await carregarCotacoes({
      forcarAtualizacao: true,
    });

    exibirMensagem("Cotações atualizadas.");
  }

  function restaurarTudo() {
    const confirmou = window.confirm(
      "Deseja restaurar nome, moeda, tema e demais configurações?"
    );

    if (!confirmou) {
      return;
    }

    restaurarConfiguracoes();
    setNomeTemporario("");

    exibirMensagem("Configurações restauradas.");
  }

  function formatarTaxa(codigo) {
    if (codigo === "BRL") {
      return "Moeda base";
    }

    const taxa = Number(cotacoes[codigo]);

    if (!Number.isFinite(taxa) || taxa <= 0) {
      return "Cotação indisponível";
    }

    return `R$ 1 = ${taxa.toFixed(4)} ${codigo}`;
  }

  const estilos = {
    pagina: {
      width: "100%",
      color: cores.texto,
      transition:
        "background-color 0.25s ease, color 0.25s ease",
    },

    cabecalho: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "flex-start",
      gap: 18,
      flexWrap: "wrap",
      marginBottom: 28,
    },

    titulo: {
      color: cores.texto,
      margin: 0,
      fontSize: 30,
      fontWeight: 800,
    },

    subtitulo: {
      color: cores.textoSecundario,
      marginTop: 8,
      marginBottom: 0,
      lineHeight: 1.5,
    },

    mensagem: {
      padding: "11px 15px",
      borderRadius: 10,
      border: "1px solid rgba(34, 197, 94, 0.35)",
      background: "rgba(34, 197, 94, 0.12)",
      color: "#22C55E",
      fontWeight: 700,
      fontSize: 13,
    },

    grade: {
      display: "grid",
      gridTemplateColumns:
        "repeat(auto-fit, minmax(320px, 1fr))",
      gap: 22,
    },

    painel: {
      background: cores.painel,
      padding: 24,
      borderRadius: 17,
      border: `1px solid ${cores.borda}`,
      boxShadow: cores.sombra,
      transition:
        "background-color 0.25s ease, border-color 0.25s ease",
    },

    cabecalhoPainel: {
      display: "flex",
      alignItems: "center",
      gap: 13,
      marginBottom: 22,
    },

    icone: {
      width: 44,
      height: 44,
      minWidth: 44,
      borderRadius: 13,
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      background: "rgba(59, 130, 246, 0.13)",
      fontSize: 20,
    },

    tituloPainel: {
      color: cores.texto,
      margin: 0,
      fontSize: 19,
    },

    descricaoPainel: {
      color: cores.textoSecundario,
      margin: "5px 0 0",
      fontSize: 13,
      lineHeight: 1.5,
    },

    input: {
      width: "100%",
      boxSizing: "border-box",
      padding: 14,
      borderRadius: 11,
      border: `1px solid ${cores.borda}`,
      background: cores.input,
      color: cores.texto,
      fontSize: 15,
      outline: "none",
    },

    label: {
      display: "block",
      color: cores.texto,
      marginBottom: 8,
      fontSize: 14,
      fontWeight: 700,
    },

    botaoPrimario: {
      padding: "12px 18px",
      border: "none",
      borderRadius: 10,
      background: "#2563EB",
      color: "#FFFFFF",
      fontSize: 14,
      fontWeight: 700,
      cursor: "pointer",
    },

    botaoSecundario: {
      padding: "12px 18px",
      border: `1px solid ${cores.borda}`,
      borderRadius: 10,
      background: cores.fundoSecundario,
      color: cores.texto,
      fontSize: 14,
      fontWeight: 700,
      cursor: "pointer",
    },

    avatar: {
      width: 68,
      height: 68,
      minWidth: 68,
      borderRadius: 20,
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      background:
        "linear-gradient(135deg, #2563EB, #7C3AED)",
      color: "#FFFFFF",
      fontSize: 27,
      fontWeight: 800,
      boxShadow: "0 10px 25px rgba(37, 99, 235, 0.25)",
    },

    linhaPerfil: {
      display: "flex",
      alignItems: "center",
      gap: 16,
      marginBottom: 23,
    },

    nomePerfil: {
      color: cores.texto,
      margin: 0,
      fontSize: 18,
      fontWeight: 800,
    },

    textoPequeno: {
      color: cores.textoSecundario,
      margin: "5px 0 0",
      fontSize: 13,
    },

    separadorPerfil: {
      margin: "22px 0",
      border: 0,
      borderTop: `1px solid ${cores.borda}`,
    },

    tituloContas: {
      margin: "0 0 5px",
      color: cores.texto,
      fontSize: 15,
    },

    listaContas: {
      display: "flex",
      flexDirection: "column",
      gap: 10,
      marginTop: 15,
    },

    conta: {
      display: "flex",
      alignItems: "center",
      gap: 12,
      padding: 12,
      border: `1px solid ${cores.borda}`,
      borderRadius: 12,
      background: cores.fundoSecundario,
    },

    avatarConta: {
      width: 40,
      height: 40,
      minWidth: 40,
      borderRadius: 12,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background:
        "linear-gradient(135deg, #2563EB, #7C3AED)",
      color: "#FFFFFF",
      fontSize: 16,
      fontWeight: 800,
    },

    dadosConta: {
      minWidth: 0,
      flex: 1,
    },

    emailConta: {
      display: "block",
      marginTop: 3,
      color: cores.textoSecundario,
      fontSize: 12,
      overflow: "hidden",
      textOverflow: "ellipsis",
      whiteSpace: "nowrap",
    },

    contaAtual: {
      padding: "7px 10px",
      borderRadius: 999,
      background: "rgba(34, 197, 94, 0.13)",
      color: "#22C55E",
      fontSize: 12,
      fontWeight: 800,
    },

    opcao: {
      width: "100%",
      boxSizing: "border-box",
      padding: 16,
      borderRadius: 13,
      border: `1px solid ${cores.borda}`,
      background: cores.fundoSecundario,
      color: cores.texto,
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      gap: 16,
    },

    switch: {
      width: 62,
      height: 34,
      minWidth: 62,
      padding: 4,
      boxSizing: "border-box",
      borderRadius: 999,
      display: "flex",
      alignItems: "center",
      justifyContent: temaEscuro
        ? "flex-end"
        : "flex-start",
      background: temaEscuro ? "#3B82F6" : "#CBD5E1",
      transition: "0.25s",
    },

    switchBola: {
      width: 26,
      height: 26,
      borderRadius: "50%",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      background: "#FFFFFF",
      boxShadow: "0 2px 8px rgba(0, 0, 0, 0.25)",
      fontSize: 14,
    },
  };

  return (
    <div style={estilos.pagina}>
      <header style={estilos.cabecalho}>
        <div>
          <h1 style={estilos.titulo}>
            Configurações
          </h1>

          <p style={estilos.subtitulo}>
            Personalize seu perfil, moeda, cotações e aparência
            do mahafinance.
          </p>
        </div>

        {mensagem && (
          <div style={estilos.mensagem}>
            {mensagem}
          </div>
        )}
      </header>

      <div style={estilos.grade}>
        <section style={estilos.painel}>
          <div style={estilos.cabecalhoPainel}>
            <div style={estilos.icone}>👤</div>

            <div>
              <h2 style={estilos.tituloPainel}>
                Perfil
              </h2>

              <p style={estilos.descricaoPainel}>
                Nome utilizado na saudação do dashboard.
              </p>
            </div>
          </div>

          <div style={estilos.linhaPerfil}>
            <div style={estilos.avatar}>
              {primeiraLetra}
            </div>

            <div>
              <p style={estilos.nomePerfil}>
                {nomeTemporario.trim() || "Usuário"}
              </p>

              <p style={estilos.textoPequeno}>
                Perfil principal
              </p>

              {usuario?.email && (
                <span style={estilos.emailConta}>
                  {usuario.email}
                </span>
              )}
            </div>
          </div>

          <form onSubmit={salvarPerfil}>
            <label
              htmlFor="nome"
              style={estilos.label}
            >
              Nome
            </label>

            <input
              id="nome"
              type="text"
              value={nomeTemporario}
              onChange={(evento) =>
                setNomeTemporario(evento.target.value)
              }
              placeholder="Digite seu nome"
              maxLength={40}
              style={estilos.input}
            />

            <button
              type="submit"
              style={{
                ...estilos.botaoPrimario,
                marginTop: 16,
              }}
            >
              Salvar perfil
            </button>
          </form>

          <hr style={estilos.separadorPerfil} />

          <div>
            <h3 style={estilos.tituloContas}>
              Contas neste dispositivo
            </h3>

            <p style={estilos.textoPequeno}>
              Selecione uma conta lembrada ou entre com uma nova.
              Sua senha nunca é salva pelo aplicativo.
            </p>

            <div style={estilos.listaContas}>
              {contasDisponiveis.map((conta) => {
                const contaAtual =
                  conta.id === usuario?.id;

                return (
                  <div
                    key={conta.id}
                    style={estilos.conta}
                  >
                    <div style={estilos.avatarConta}>
                      {obterInicialConta(conta)}
                    </div>

                    <div style={estilos.dadosConta}>
                      <strong
                        style={{
                          display: "block",
                          color: cores.texto,
                          fontSize: 14,
                        }}
                      >
                        {conta.nome || "Usuário"}
                      </strong>

                      <span style={estilos.emailConta}>
                        {conta.email}
                      </span>
                    </div>

                    {contaAtual ? (
                      <span style={estilos.contaAtual}>
                        Em uso
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() =>
                          abrirSeletorDeContas(conta)
                        }
                        disabled={trocandoConta}
                        style={{
                          ...estilos.botaoSecundario,
                          padding: "8px 11px",
                          opacity: trocandoConta
                            ? 0.65
                            : 1,
                        }}
                      >
                        Trocar
                      </button>
                    )}
                  </div>
                );
              })}
            </div>

            <button
              type="button"
              onClick={() => abrirSeletorDeContas()}
              disabled={trocandoConta}
              style={{
                ...estilos.botaoSecundario,
                width: "100%",
                marginTop: 13,
                opacity: trocandoConta ? 0.65 : 1,
                cursor: trocandoConta
                  ? "not-allowed"
                  : "pointer",
              }}
            >
              {trocandoConta
                ? "Saindo..."
                : "Trocar ou adicionar conta"}
            </button>
          </div>
        </section>

        <section style={estilos.painel}>
          <div style={estilos.cabecalhoPainel}>
            <div style={estilos.icone}>
              {temaEscuro ? "🌙" : "☀️"}
            </div>

            <div>
              <h2 style={estilos.tituloPainel}>
                Aparência
              </h2>

              <p style={estilos.descricaoPainel}>
                Escolha entre o tema claro e o escuro.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={alternarTema}
            style={{
              ...estilos.opcao,
              cursor: "pointer",
            }}
          >
            <div style={{ textAlign: "left" }}>
              <strong>
                {temaEscuro
                  ? "Tema escuro ativado"
                  : "Tema claro ativado"}
              </strong>

              <p style={estilos.textoPequeno}>
                Clique para mudar para o tema{" "}
                {temaEscuro ? "claro" : "escuro"}.
              </p>
            </div>

            <div style={estilos.switch}>
              <span style={estilos.switchBola}>
                {temaEscuro ? "🌙" : "☀️"}
              </span>
            </div>
          </button>
        </section>
      </div>

      <section
        style={{
          ...estilos.painel,
          marginTop: 22,
        }}
      >
        <div style={estilos.cabecalhoPainel}>
          <div
            style={{
              ...estilos.icone,
              background: "rgba(34, 197, 94, 0.13)",
            }}
          >
            💰
          </div>

          <div>
            <h2 style={estilos.tituloPainel}>
              Moeda do sistema
            </h2>

            <p style={estilos.descricaoPainel}>
              Os valores são armazenados em reais e convertidos
              pela cotação disponível.
            </p>
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(220px, 1fr))",
            gap: 13,
          }}
        >
          {moedas.map((moeda) => {
            const selecionada =
              moeda.codigo === settings.moeda;

            return (
              <button
                key={moeda.codigo}
                type="button"
                onClick={() =>
                  alterarMoeda(moeda.codigo)
                }
                style={{
                  padding: 16,
                  borderRadius: 13,
                  border: selecionada
                    ? "1px solid #22C55E"
                    : `1px solid ${cores.borda}`,
                  background: selecionada
                    ? "rgba(34, 197, 94, 0.11)"
                    : cores.fundoSecundario,
                  color: cores.texto,
                  cursor: "pointer",
                  textAlign: "left",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: 12,
                }}
              >
                <div>
                  <strong
                    style={{
                      display: "block",
                      fontSize: 15,
                    }}
                  >
                    {moeda.emoji} {moeda.simbolo}{" "}
                    {moeda.nome}
                  </strong>

                  <span
                    style={{
                      display: "block",
                      color: cores.textoSecundario,
                      fontSize: 12,
                      marginTop: 5,
                    }}
                  >
                    {moeda.pais}
                  </span>

                  <span
                    style={{
                      display: "block",
                      color: cores.textoSecundario,
                      fontSize: 12,
                      marginTop: 8,
                    }}
                  >
                    {formatarTaxa(moeda.codigo)}
                  </span>
                </div>

                {selecionada && (
                  <span
                    style={{
                      width: 26,
                      height: 26,
                      minWidth: 26,
                      borderRadius: "50%",
                      background: "#22C55E",
                      color: "#FFFFFF",
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      fontWeight: 900,
                    }}
                  >
                    ✓
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 15,
            flexWrap: "wrap",
            marginTop: 20,
            paddingTop: 18,
            borderTop: `1px solid ${cores.borda}`,
          }}
        >
          <div>
            <strong
              style={{
                color: cores.texto,
                fontSize: 14,
              }}
            >
              Última atualização
            </strong>

            <p style={estilos.textoPequeno}>
              {textoUltimaAtualizacao ||
                "As cotações ainda não foram carregadas."}
            </p>
          </div>

          <button
            type="button"
            onClick={atualizarCotacoes}
            disabled={carregandoCotacoes}
            style={{
              ...estilos.botaoPrimario,
              opacity: carregandoCotacoes ? 0.65 : 1,
              cursor: carregandoCotacoes
                ? "not-allowed"
                : "pointer",
            }}
          >
            {carregandoCotacoes
              ? "Atualizando..."
              : "Atualizar cotações"}
          </button>
        </div>

        {erroCotacoes && (
          <div
            style={{
              marginTop: 15,
              padding: 13,
              borderRadius: 10,
              background: "rgba(239, 68, 68, 0.10)",
              border: "1px solid rgba(239, 68, 68, 0.30)",
              color: "#EF4444",
              fontSize: 13,
            }}
          >
            {erroCotacoes}
          </div>
        )}
      </section>

      <div
        style={{
          ...estilos.grade,
          marginTop: 22,
        }}
      >
        <section style={estilos.painel}>
          <div style={estilos.cabecalhoPainel}>
            <div style={estilos.icone}>🔢</div>

            <div>
              <h2 style={estilos.tituloPainel}>
                Formatação
              </h2>

              <p style={estilos.descricaoPainel}>
                Defina como os valores aparecem no sistema.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={alterarCentavos}
            style={{
              ...estilos.opcao,
              cursor: "pointer",
            }}
          >
            <div style={{ textAlign: "left" }}>
              <strong>
                Mostrar centavos
              </strong>

              <p style={estilos.textoPequeno}>
                Exemplo: R$ 100,00 em vez de R$ 100.
              </p>
            </div>

            <div
              style={{
                ...estilos.switch,
                background: settings.mostrarCentavos
                  ? "#22C55E"
                  : "#64748B",
                justifyContent: settings.mostrarCentavos
                  ? "flex-end"
                  : "flex-start",
              }}
            >
              <span style={estilos.switchBola}>
                {settings.mostrarCentavos ? "✓" : ""}
              </span>
            </div>
          </button>
        </section>

        <section style={estilos.painel}>
          <div style={estilos.cabecalhoPainel}>
            <div style={estilos.icone}>📋</div>

            <div>
              <h2 style={estilos.tituloPainel}>
                Resumo
              </h2>

              <p style={estilos.descricaoPainel}>
                Configurações atualmente selecionadas.
              </p>
            </div>
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 14,
            }}
          >
            {[
              [
                "Usuário",
                settings.nome || "Não definido",
              ],
              [
                "Moeda",
                `${moedaAtual.simbolo} ${moedaAtual.codigo}`,
              ],
              [
                "Tema",
                temaEscuro ? "Escuro" : "Claro",
              ],
              [
                "Centavos",
                settings.mostrarCentavos
                  ? "Ativados"
                  : "Desativados",
              ],
            ].map(([nome, valor]) => (
              <div
                key={nome}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  gap: 15,
                  paddingBottom: 13,
                  borderBottom: `1px solid ${cores.borda}`,
                }}
              >
                <span
                  style={{
                    color: cores.textoSecundario,
                    fontSize: 13,
                  }}
                >
                  {nome}
                </span>

                <strong
                  style={{
                    color: cores.texto,
                    fontSize: 13,
                    textAlign: "right",
                  }}
                >
                  {valor}
                </strong>
              </div>
            ))}
          </div>
        </section>
      </div>

      <div
        style={{
          ...estilos.grade,
          marginTop: 22,
        }}
      >
        <section style={estilos.painel}>
          <div style={estilos.cabecalhoPainel}>
            <div style={estilos.icone}>ℹ️</div>

            <div>
              <h2 style={estilos.tituloPainel}>
                Sobre
              </h2>

              <p style={estilos.descricaoPainel}>
                Informações do sistema.
              </p>
            </div>
          </div>

          <div
            style={{
              padding: 17,
              borderRadius: 13,
              border: `1px solid ${cores.borda}`,
              background: cores.fundoSecundario,
            }}
          >
            <strong
              style={{
                color: cores.texto,
                fontSize: 18,
              }}
            >
              mahafinance
            </strong>

            <p
              style={{
                color: "#A855F7",
                margin: "7px 0 0",
                fontWeight: 700,
                fontSize: 13,
              }}
            >
              Versão 1.0.0
            </p>

            <p
              style={{
                color: cores.textoSecundario,
                lineHeight: 1.6,
                marginBottom: 0,
                fontSize: 13,
              }}
            >
              Sistema de controle financeiro com receitas,
              despesas, investimentos, metas e conversão de
              moedas.
            </p>
          </div>
        </section>

        <section style={estilos.painel}>
          <div style={estilos.cabecalhoPainel}>
            <div
              style={{
                ...estilos.icone,
                background: "rgba(239, 68, 68, 0.12)",
              }}
            >
              ⚠️
            </div>

            <div>
              <h2 style={estilos.tituloPainel}>
                Restaurar configurações
              </h2>

              <p style={estilos.descricaoPainel}>
                Retorne todas as opções para o padrão.
              </p>
            </div>
          </div>

          <p
            style={{
              color: cores.textoSecundario,
              lineHeight: 1.6,
              fontSize: 13,
            }}
          >
            Isso restaura o nome, moeda, tema e formatação.
            Suas transações financeiras não serão apagadas.
          </p>

          <button
            type="button"
            onClick={restaurarTudo}
            style={{
              width: "100%",
              padding: "12px 16px",
              borderRadius: 10,
              border:
                "1px solid rgba(239, 68, 68, 0.35)",
              background: "rgba(239, 68, 68, 0.10)",
              color: "#EF4444",
              fontSize: 14,
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            Restaurar configurações
          </button>
        </section>
      </div>
    </div>
  );
}

export default Configuracoes;
