import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

import { supabase } from "../lib/supabase";

const AuthContext = createContext(null);
const CHAVE_CONTAS_CONHECIDAS =
  "mahafinance-contas-conhecidas";

function carregarContasConhecidas() {
  try {
    const contasSalvas = localStorage.getItem(
      CHAVE_CONTAS_CONHECIDAS
    );

    if (!contasSalvas) {
      return [];
    }

    const contas = JSON.parse(contasSalvas);

    return Array.isArray(contas) ? contas : [];
  } catch {
    return [];
  }
}

function salvarContasConhecidas(contas) {
  try {
    localStorage.setItem(
      CHAVE_CONTAS_CONHECIDAS,
      JSON.stringify(contas)
    );
  } catch (erro) {
    console.error(
      "Não foi possível lembrar as contas neste dispositivo:",
      erro
    );
  }
}

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null);
  const [sessao, setSessao] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [contasConhecidas, setContasConhecidas] =
    useState(carregarContasConhecidas);

  const registrarConta = useCallback(
    (usuarioConta, dadosAdicionais = {}) => {
      if (!usuarioConta?.id || !usuarioConta?.email) {
        return;
      }

      setContasConhecidas((contasAtuais) => {
        const contaAnterior = contasAtuais.find(
          (conta) => conta.id === usuarioConta.id
        );

        const nome =
          dadosAdicionais.nome?.trim() ||
          usuarioConta.user_metadata?.nome?.trim() ||
          usuarioConta.user_metadata?.full_name?.trim() ||
          contaAnterior?.nome ||
          usuarioConta.email.split("@")[0];

        const avatarUrl =
          dadosAdicionais.avatarUrl ||
          usuarioConta.user_metadata?.avatar_url ||
          contaAnterior?.avatarUrl ||
          "";

        const contaAtualizada = {
          id: usuarioConta.id,
          email: usuarioConta.email,
          nome,
          avatarUrl,
          ultimoAcesso: Date.now(),
        };

        const novasContas = [
          contaAtualizada,
          ...contasAtuais.filter(
            (conta) => conta.id !== usuarioConta.id
          ),
        ];

        salvarContasConhecidas(novasContas);

        return novasContas;
      });
    },
    []
  );

  useEffect(() => {
    async function carregarSessao() {
      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        if (error) {
          console.error(
            "Erro ao carregar a sessão:",
            error.message
          );
        }

        setSessao(session);
        setUsuario(session?.user ?? null);

        if (session?.user) {
          registrarConta(session.user);
        }
      } catch (erro) {
        console.error(
          "Erro inesperado ao carregar a sessão:",
          erro
        );
      } finally {
        setCarregando(false);
      }
    }

    carregarSessao();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      (_evento, session) => {
        setSessao(session);
        setUsuario(session?.user ?? null);
        setCarregando(false);

        if (session?.user) {
          registrarConta(session.user);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [registrarConta]);

  async function criarConta({
    nome,
    email,
    senha,
  }) {
    const emailTratado = email.trim().toLowerCase();
    const nomeTratado = nome.trim();

    const { data, error } = await supabase.auth.signUp({
      email: emailTratado,
      password: senha,
      options: {
        data: {
          nome: nomeTratado,
        },
        emailRedirectTo: `${window.location.origin}/login`,
      },
    });

    if (error) {
      throw error;
    }

    if (data.user) {
      registrarConta(data.user, {
        nome: nomeTratado,
      });
    }

    return data;
  }

  async function entrar({ email, senha }) {
    const emailTratado = email.trim().toLowerCase();

    const { data, error } =
      await supabase.auth.signInWithPassword({
        email: emailTratado,
        password: senha,
      });

    if (error) {
      throw error;
    }

    if (data.user) {
      registrarConta(data.user);
    }

    return data;
  }

  async function sair() {
    const { error } = await supabase.auth.signOut();

    if (error) {
      throw error;
    }
  }

  function atualizarContaConhecida({
    id,
    nome,
    avatarUrl,
  }) {
    if (!id) {
      return;
    }

    setContasConhecidas((contasAtuais) => {
      const novasContas = contasAtuais.map((conta) =>
        conta.id === id
          ? {
              ...conta,
              ...(nome !== undefined
                ? { nome: nome.trim() }
                : {}),
              ...(avatarUrl !== undefined
                ? { avatarUrl: avatarUrl || "" }
                : {}),
            }
          : conta
      );

      salvarContasConhecidas(novasContas);

      return novasContas;
    });
  }

  const valorContexto = {
    usuario,
    sessao,
    carregando,
    autenticado: Boolean(usuario),
    contasConhecidas,
    criarConta,
    entrar,
    sair,
    atualizarContaConhecida,
  };

  return (
    <AuthContext.Provider value={valorContexto}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const contexto = useContext(AuthContext);

  if (!contexto) {
    throw new Error(
      "useAuth deve ser usado dentro de AuthProvider."
    );
  }

  return contexto;
}

export default AuthContext;
