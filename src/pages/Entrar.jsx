import { useEffect, useState } from "react";
import {
  Link,
  useLocation,
  useNavigate,
} from "react-router-dom";

import { useAuth } from "../context/AuthContext";

function Entrar() {
  const navigate = useNavigate();
  const location = useLocation();
  const destinoAposLogin =
    location.state?.from || "/app";
  const trocandoConta =
    Boolean(location.state?.trocandoConta);

  const {
    entrar,
    autenticado,
    carregando: carregandoSessao,
  } = useAuth();

  const [email, setEmail] = useState(
    () => location.state?.email || ""
  );
  const [senha, setSenha] = useState("");

  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState("");

  useEffect(() => {
    if (autenticado && !carregandoSessao) {
      navigate(destinoAposLogin, {
        replace: true,
      });
    }
  }, [
    autenticado,
    carregandoSessao,
    destinoAposLogin,
    navigate,
  ]);

  async function fazerLogin(event) {
    event.preventDefault();

    setErro("");

    if (!email.trim() || !senha) {
      setErro("Preencha o e-mail e a senha.");
      return;
    }

    try {
      setCarregando(true);

      await entrar({
        email,
        senha,
      });

      navigate(destinoAposLogin, {
        replace: true,
      });
    } catch (erroLogin) {
      console.error(
        "Erro ao entrar:",
        erroLogin
      );

      const mensagem =
        erroLogin?.message || "";

      if (
        mensagem
          .toLowerCase()
          .includes("invalid login credentials")
      ) {
        setErro("E-mail ou senha incorretos.");
        return;
      }

      if (
        mensagem
          .toLowerCase()
          .includes("email not confirmed")
      ) {
        setErro(
          "Confirme seu e-mail antes de entrar."
        );
        return;
      }

      setErro(
        "Não foi possível entrar. Tente novamente."
      );
    } finally {
      setCarregando(false);
    }
  }

  if (carregandoSessao) {
    return (
      <div style={estilos.pagina}>
        <div style={estilos.carregamento}>
          Verificando sua conta...
        </div>
      </div>
    );
  }

  return (
    <div style={estilos.pagina}>
      <form
        onSubmit={fazerLogin}
        style={estilos.formulario}
      >
        <Link
          to="/"
          style={estilos.logo}
        >
          <span style={estilos.logoIcone}>
            M
          </span>

          <span>MahaFinance</span>
        </Link>

        <div style={estilos.cabecalho}>
          <h1 style={estilos.titulo}>
            {trocandoConta
              ? "Entrar em outra conta"
              : "Entrar"}
          </h1>

          <p style={estilos.descricao}>
            {trocandoConta
              ? "Use os dados da conta que deseja acessar."
              : "Acesse sua conta para continuar cuidando da sua vida financeira."}
          </p>
        </div>

        {erro && (
          <div
            role="alert"
            style={estilos.mensagemErro}
          >
            {erro}
          </div>
        )}

        <label style={estilos.campo}>
          <span style={estilos.rotulo}>
            E-mail
          </span>

          <input
            type="email"
            value={email}
            onChange={(event) =>
              setEmail(event.target.value)
            }
            placeholder="seuemail@exemplo.com"
            autoComplete="email"
            required
            disabled={carregando}
            style={estilos.input}
          />
        </label>

        <label style={estilos.campo}>
          <span style={estilos.rotulo}>
            Senha
          </span>

          <input
            type="password"
            value={senha}
            onChange={(event) =>
              setSenha(event.target.value)
            }
            placeholder="Digite sua senha"
            autoComplete="current-password"
            required
            minLength={6}
            disabled={carregando}
            style={estilos.input}
          />
        </label>

        <button
          type="submit"
          disabled={carregando}
          style={{
            ...estilos.botao,
            ...(carregando
              ? estilos.botaoDesativado
              : {}),
          }}
        >
          {carregando
            ? "Entrando..."
            : "Entrar"}
        </button>

        <p style={estilos.cadastroTexto}>
          Ainda não possui uma conta?{" "}
          <Link
            to="/cadastro"
            state={{
              from: destinoAposLogin,
              trocandoConta,
            }}
            style={estilos.link}
          >
            Criar conta
          </Link>
        </p>

        <Link
          to="/"
          style={estilos.voltar}
        >
          Voltar para a apresentação
        </Link>
      </form>
    </div>
  );
}

const estilos = {
  pagina: {
    minHeight: "100vh",
    padding: "24px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#0f172a",
    color: "#ffffff",
    boxSizing: "border-box",
  },

  formulario: {
    width: "100%",
    maxWidth: "430px",
    padding: "36px",
    border: "1px solid #334155",
    borderRadius: "22px",
    background: "#111c2f",
    boxShadow:
      "0 24px 70px rgba(0, 0, 0, 0.35)",
    boxSizing: "border-box",
  },

  logo: {
    marginBottom: "30px",
    display: "inline-flex",
    alignItems: "center",
    gap: "10px",
    color: "#ffffff",
    fontSize: "18px",
    fontWeight: 800,
    textDecoration: "none",
  },

  logoIcone: {
    width: "36px",
    height: "36px",
    borderRadius: "11px",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    background:
      "linear-gradient(135deg, #22c55e, #16a34a)",
    boxShadow:
      "0 8px 22px rgba(34, 197, 94, 0.25)",
  },

  cabecalho: {
    marginBottom: "26px",
  },

  titulo: {
    margin: "0 0 9px",
    fontSize: "31px",
    letterSpacing: "-0.8px",
  },

  descricao: {
    margin: 0,
    color: "#94a3b8",
    fontSize: "14px",
    lineHeight: 1.65,
  },

  mensagemErro: {
    marginBottom: "18px",
    padding: "13px 14px",
    border: "1px solid rgba(248, 113, 113, 0.35)",
    borderRadius: "11px",
    color: "#fecaca",
    background: "rgba(127, 29, 29, 0.25)",
    fontSize: "13px",
    lineHeight: 1.5,
  },

  campo: {
    marginBottom: "16px",
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },

  rotulo: {
    color: "#e2e8f0",
    fontSize: "14px",
    fontWeight: 650,
  },

  input: {
    width: "100%",
    height: "50px",
    padding: "0 15px",
    border: "1px solid #334155",
    borderRadius: "11px",
    outline: "none",
    background: "#0f172a",
    color: "#ffffff",
    fontSize: "15px",
    boxSizing: "border-box",
  },

  botao: {
    width: "100%",
    height: "51px",
    marginTop: "4px",
    border: "none",
    borderRadius: "11px",
    background:
      "linear-gradient(135deg, #22c55e, #16a34a)",
    color: "#ffffff",
    fontSize: "15px",
    fontWeight: 800,
    cursor: "pointer",
    boxShadow:
      "0 12px 28px rgba(34, 197, 94, 0.2)",
  },

  botaoDesativado: {
    opacity: 0.62,
    cursor: "not-allowed",
  },

  cadastroTexto: {
    margin: "22px 0 0",
    color: "#94a3b8",
    textAlign: "center",
    fontSize: "14px",
  },

  link: {
    color: "#22c55e",
    fontWeight: 750,
    textDecoration: "none",
  },

  voltar: {
    marginTop: "16px",
    display: "block",
    color: "#64748b",
    textAlign: "center",
    fontSize: "13px",
    textDecoration: "none",
  },

  carregamento: {
    color: "#ffffff",
    fontSize: "18px",
    fontWeight: 700,
  },
};

export default Entrar;
