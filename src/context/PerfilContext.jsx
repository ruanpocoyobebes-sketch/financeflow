import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { useAuth } from "./AuthContext";
import { perfilService } from "../services/perfil";

const PerfilContext = createContext(null);

export function PerfilProvider({ children }) {
  const {
    usuario,
    autenticado,
    carregando: carregandoAutenticacao,
  } = useAuth();

  const [perfil, setPerfil] = useState(null);
  const [carregandoPerfil, setCarregandoPerfil] =
    useState(true);
  const [erroPerfil, setErroPerfil] = useState("");

  const carregarPerfil = useCallback(async () => {
    if (!autenticado || !usuario) {
      setPerfil(null);
      setErroPerfil("");
      setCarregandoPerfil(false);
      return;
    }

    try {
      setCarregandoPerfil(true);
      setErroPerfil("");

      const perfilEncontrado =
        await perfilService.buscarPerfil();

      setPerfil(perfilEncontrado);
    } catch (erro) {
      console.error(
        "Erro ao carregar perfil:",
        erro
      );

      setPerfil(null);

      setErroPerfil(
        erro?.message ||
          "Não foi possível carregar o perfil."
      );
    } finally {
      setCarregandoPerfil(false);
    }
  }, [autenticado, usuario]);

  useEffect(() => {
    if (carregandoAutenticacao) {
      return;
    }

    carregarPerfil();
  }, [
    carregandoAutenticacao,
    carregarPerfil,
  ]);

  async function atualizarPerfil({
    nome,
    avatarUrl,
    moeda,
    tema,
  }) {
    try {
      setErroPerfil("");

      const perfilAtualizado =
        await perfilService.atualizarPerfil({
          nome,
          avatarUrl,
          moeda,
          tema,
        });

      setPerfil(perfilAtualizado);

      return perfilAtualizado;
    } catch (erro) {
      console.error(
        "Erro ao atualizar perfil:",
        erro
      );

      setErroPerfil(
        erro?.message ||
          "Não foi possível atualizar o perfil."
      );

      throw erro;
    }
  }

  function limparErroPerfil() {
    setErroPerfil("");
  }

  const ehPremium = useMemo(
    () =>
      perfilService.usuarioTemPlanoPremium(
        perfil
      ),
    [perfil]
  );

  const plano = perfil?.plano || "free";

  const valorContexto = {
    perfil,
    plano,
    ehPremium,
    carregandoPerfil,
    erroPerfil,

    carregarPerfil,
    atualizarPerfil,
    limparErroPerfil,
  };

  return (
    <PerfilContext.Provider
      value={valorContexto}
    >
      {children}
    </PerfilContext.Provider>
  );
}

export function usePerfil() {
  const contexto = useContext(PerfilContext);

  if (!contexto) {
    throw new Error(
      "usePerfil deve ser usado dentro de PerfilProvider."
    );
  }

  return contexto;
}

export default PerfilContext;