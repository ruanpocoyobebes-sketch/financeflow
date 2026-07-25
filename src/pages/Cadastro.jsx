import { useState } from "react";
import {
  Link,
  useLocation,
  useNavigate,
} from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Cadastro() {
  const navigate = useNavigate();
  const location = useLocation();
  const { criarConta } = useAuth();

  const destinoAposCadastro =
    location.state?.from || "/app";
  const trocandoConta =
    Boolean(location.state?.trocandoConta);

  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");

  const [carregando, setCarregando] = useState(false);

  async function cadastrar(e) {
    e.preventDefault();

    try {
      setCarregando(true);

      const resultado = await criarConta({
        nome,
        email,
        senha,
      });

      if (resultado.session) {
        alert("Conta criada com sucesso!");

        navigate(destinoAposCadastro, {
          replace: true,
        });
        return;
      }

      alert(
        "Conta criada com sucesso!\n\nVerifique seu e-mail para confirmar sua conta."
      );

      navigate("/login", {
        replace: true,
        state: {
          email: email.trim().toLowerCase(),
          from: destinoAposCadastro,
          trocandoConta,
        },
      });
    } catch (erro) {
      alert(erro.message);
    } finally {
      setCarregando(false);
    }
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "#0f172a",
        color: "white",
        padding: 24,
      }}
    >
      <form
        onSubmit={cadastrar}
        style={{
          width: "100%",
          maxWidth: 430,
          background: "#111c2f",
          border: "1px solid #334155",
          borderRadius: 20,
          padding: 35,
        }}
      >
        <h1
          style={{
            marginTop: 0,
            marginBottom: 8,
          }}
        >
          Criar conta
        </h1>

        <p
          style={{
            color: "#94a3b8",
            marginBottom: 30,
          }}
        >
          Crie sua conta gratuitamente.
        </p>

        <input
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          placeholder="Nome"
          required
          style={input}
        />

        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          required
          style={input}
        />

        <input
          type="password"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          placeholder="Senha"
          required
          minLength={6}
          style={input}
        />

        <button
          disabled={carregando}
          style={botao}
        >
          {carregando
            ? "Criando..."
            : "Criar conta"}
        </button>

        <p
          style={{
            textAlign: "center",
            marginTop: 20,
            color: "#94a3b8",
          }}
        >
          Já possui conta?{" "}
          <Link
            to="/login"
            state={{
              email,
              from: destinoAposCadastro,
              trocandoConta,
            }}
            style={{
              color: "#22c55e",
            }}
          >
            Entrar
          </Link>
        </p>
      </form>
    </div>
  );
}

const input = {
  width: "100%",
  height: 50,
  marginBottom: 15,
  borderRadius: 10,
  border: "1px solid #334155",
  background: "#0f172a",
  color: "white",
  padding: "0 15px",
  boxSizing: "border-box",
  fontSize: 15,
};

const botao = {
  width: "100%",
  height: 50,
  border: "none",
  borderRadius: 10,
  background: "#22c55e",
  color: "white",
  fontWeight: "bold",
  cursor: "pointer",
  fontSize: 16,
};

export default Cadastro;
