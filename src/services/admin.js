import { supabase } from "../lib/supabase";

const NOME_FUNCAO = "admin-usuarios";

async function extrairMensagemErro(erro) {
  if (!erro) {
    return "Não foi possível concluir a operação administrativa.";
  }

  try {
    if (erro.context && typeof erro.context.json === "function") {
      const resposta = await erro.context.json();

      if (resposta?.erro || resposta?.message) {
        return resposta.erro || resposta.message;
      }
    }
  } catch {
    // A mensagem padrão abaixo cobre respostas sem JSON.
  }

  return (
    erro.message ||
    "Não foi possível concluir a operação administrativa."
  );
}

async function executar(acao, dados = {}) {
  const { data, error } = await supabase.functions.invoke(
    NOME_FUNCAO,
    {
      body: {
        acao,
        ...dados,
      },
    }
  );

  if (error) {
    throw new Error(await extrairMensagemErro(error));
  }

  if (data?.erro) {
    throw new Error(data.erro);
  }

  return data;
}

async function listar() {
  return executar("listar");
}

async function alterarPlano(usuarioId, plano) {
  return executar("alterar_plano", { usuarioId, plano });
}

async function alterarBloqueio(usuarioId, bloquear) {
  return executar("alterar_bloqueio", { usuarioId, bloquear });
}

async function excluirUsuario(usuarioId) {
  return executar("excluir_usuario", { usuarioId });
}

async function alterarCadastros(liberar) {
  return executar("alterar_cadastros", { liberar });
}

async function cadastrosEstaoLiberados() {
  const { data, error } = await supabase
    .from("app_settings")
    .select("cadastros_liberados")
    .eq("id", "global")
    .maybeSingle();

  if (error) {
    console.warn(
      "Não foi possível consultar a disponibilidade de cadastros:",
      error.message
    );

    return true;
  }

  return data?.cadastros_liberados !== false;
}

export const adminService = {
  listar,
  alterarPlano,
  alterarBloqueio,
  excluirUsuario,
  alterarCadastros,
  cadastrosEstaoLiberados,
};

export default adminService;
