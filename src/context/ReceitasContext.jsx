import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { useAuth } from "./AuthContext";
import { receitasService } from "../services/receitas";

const ReceitasContext = createContext(null);

export function ReceitasProvider({ children }) {
  const {
    usuario,
    autenticado,
    carregando: carregandoAutenticacao,
  } = useAuth();

  const [receitas, setReceitas] = useState([]);
  const [carregandoReceitas, setCarregandoReceitas] =
    useState(true);
  const [erroReceitas, setErroReceitas] = useState("");

  const carregarReceitas = useCallback(async () => {
    if (!autenticado || !usuario) {
      setReceitas([]);
      setErroReceitas("");
      setCarregandoReceitas(false);
      return;
    }

    try {
      setCarregandoReceitas(true);
      setErroReceitas("");

      const lista = await receitasService.listar();

      setReceitas(lista);
    } catch (erro) {
      console.error(
        "Erro ao carregar receitas:",
        erro
      );

      setErroReceitas(
        erro?.message ||
          "Não foi possível carregar as receitas."
      );
    } finally {
      setCarregandoReceitas(false);
    }
  }, [autenticado, usuario]);

  useEffect(() => {
    if (carregandoAutenticacao) {
      return;
    }

    carregarReceitas();
  }, [
    carregandoAutenticacao,
    carregarReceitas,
  ]);

  async function adicionarReceita({
    descricao,
    valor,
    categoria,
    data,
  }) {
    try {
      setErroReceitas("");

      const novaReceita =
        await receitasService.criar({
          descricao,
          valor,
          categoria,
          data,
        });

      setReceitas((listaAtual) => [
        novaReceita,
        ...listaAtual,
      ]);

      return novaReceita;
    } catch (erro) {
      console.error(
        "Erro ao adicionar receita:",
        erro
      );

      setErroReceitas(
        erro?.message ||
          "Não foi possível adicionar a receita."
      );

      throw erro;
    }
  }

  async function editarReceita(
    id,
    {
      descricao,
      valor,
      categoria,
      data,
    }
  ) {
    try {
      setErroReceitas("");

      const receitaAtualizada =
        await receitasService.atualizar(id, {
          descricao,
          valor,
          categoria,
          data,
        });

      setReceitas((listaAtual) =>
        listaAtual.map((receita) =>
          receita.id === id
            ? receitaAtualizada
            : receita
        )
      );

      return receitaAtualizada;
    } catch (erro) {
      console.error(
        "Erro ao editar receita:",
        erro
      );

      setErroReceitas(
        erro?.message ||
          "Não foi possível editar a receita."
      );

      throw erro;
    }
  }

  async function removerReceita(id) {
    try {
      setErroReceitas("");

      await receitasService.remover(id);

      setReceitas((listaAtual) =>
        listaAtual.filter(
          (receita) => receita.id !== id
        )
      );
    } catch (erro) {
      console.error(
        "Erro ao remover receita:",
        erro
      );

      setErroReceitas(
        erro?.message ||
          "Não foi possível remover a receita."
      );

      throw erro;
    }
  }

  function limparErroReceitas() {
    setErroReceitas("");
  }

  const totalReceitas = useMemo(
    () =>
      receitas.reduce(
        (total, receita) =>
          total + Number(receita.valor || 0),
        0
      ),
    [receitas]
  );

  const valorContexto = {
    receitas,
    totalReceitas,
    carregandoReceitas,
    erroReceitas,

    carregarReceitas,
    adicionarReceita,
    editarReceita,
    removerReceita,
    limparErroReceitas,
  };

  return (
    <ReceitasContext.Provider
      value={valorContexto}
    >
      {children}
    </ReceitasContext.Provider>
  );
}

export function useReceitas() {
  const contexto = useContext(ReceitasContext);

  if (!contexto) {
    throw new Error(
      "useReceitas deve ser usado dentro de ReceitasProvider."
    );
  }

  return contexto;
}

export default ReceitasContext;