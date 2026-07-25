import { supabase } from "../lib/supabase";

const NOME_FUNCAO = "gerar-analise-financeira";

async function obterUsuarioLogado() {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) {
    throw error;
  }

  if (!user) {
    throw new Error(
      "Você precisa estar conectado para continuar."
    );
  }

  return user;
}

async function obterSessaoAtual() {
  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();

  if (error) {
    throw error;
  }

  if (!session?.access_token) {
    throw new Error(
      "Sua sessão expirou. Entre novamente na sua conta."
    );
  }

  return session;
}

async function verificarPlanoPremium() {
  const usuario = await obterUsuarioLogado();

  const { data: perfil, error } = await supabase
    .from("profiles")
    .select("id, nome, plano")
    .eq("id", usuario.id)
    .single();

  if (error) {
    throw error;
  }

  const plano = String(
    perfil?.plano || "free"
  )
    .trim()
    .toLowerCase();

  if (plano !== "premium") {
    throw new Error(
      "A análise com IA está disponível apenas para usuários Premium."
    );
  }

  return {
    usuario,
    perfil,
  };
}

async function extrairMensagemErroFuncao(erro) {
  if (!erro) {
    return "Não foi possível acessar a inteligência artificial.";
  }

  try {
    if (
      erro.context &&
      typeof erro.context.json === "function"
    ) {
      const corpoErro =
        await erro.context.json();

      if (corpoErro?.erro) {
        return corpoErro.erro;
      }

      if (corpoErro?.message) {
        return corpoErro.message;
      }
    }
  } catch (erroLeitura) {
    console.error(
      "Não foi possível ler a resposta de erro da função:",
      erroLeitura
    );
  }

  return (
    erro.message ||
    "Não foi possível gerar a análise financeira."
  );
}

function validarDadosFinanceiros(
  dadosFinanceiros
) {
  if (
    !dadosFinanceiros ||
    typeof dadosFinanceiros !== "object"
  ) {
    throw new Error(
      "Os dados financeiros não foram informados."
    );
  }

  return {
    totalReceitas: Number(
      dadosFinanceiros.totalReceitas || 0
    ),

    totalDespesas: Number(
      dadosFinanceiros.totalDespesas || 0
    ),

    saldoDisponivel: Number(
      dadosFinanceiros.saldoDisponivel || 0
    ),

    quantidadeReceitas: Number(
      dadosFinanceiros.quantidadeReceitas || 0
    ),

    quantidadeDespesas: Number(
      dadosFinanceiros.quantidadeDespesas || 0
    ),

    taxaEconomia: Number(
      dadosFinanceiros.taxaEconomia || 0
    ),

    categoriaMaisCara:
      dadosFinanceiros.categoriaMaisCara ||
      "Não identificada",

    valorCategoriaMaisCara: Number(
      dadosFinanceiros.valorCategoriaMaisCara ||
        0
    ),

    maiorDespesaDescricao:
      dadosFinanceiros.maiorDespesaDescricao ||
      "Não identificada",

    maiorDespesaValor: Number(
      dadosFinanceiros.maiorDespesaValor || 0
    ),
  };
}

async function gerar({
  titulo = "Análise Financeira Geral",
  pergunta =
    "Faça uma análise geral da minha situação financeira.",
  dadosFinanceiros,
}) {
  await obterSessaoAtual();

  const dadosTratados =
    validarDadosFinanceiros(
      dadosFinanceiros
    );

  const tituloTratado =
    String(titulo || "").trim() ||
    "Análise Financeira Geral";

  const perguntaTratada =
    String(pergunta || "").trim() ||
    "Faça uma análise geral da minha situação financeira.";

  const { data, error } =
    await supabase.functions.invoke(
      NOME_FUNCAO,
      {
        body: {
          titulo: tituloTratado,
          pergunta: perguntaTratada,
          dadosFinanceiros:
            dadosTratados,
        },
      }
    );

  if (error) {
    const mensagem =
      await extrairMensagemErroFuncao(
        error
      );

    throw new Error(mensagem);
  }

  if (!data) {
    throw new Error(
      "A função respondeu sem nenhum conteúdo."
    );
  }

  if (data.sucesso === false) {
    throw new Error(
      data.erro ||
        "A inteligência artificial não conseguiu gerar a análise."
    );
  }

  if (!data.resposta) {
    throw new Error(
      "A inteligência artificial respondeu sem texto."
    );
  }

  return {
    sucesso: true,
    resposta: data.resposta,
    analise: data.analise || null,
    modelo:
      data.modelo ||
      "gemini-2.5-flash",
    mensagem:
      data.mensagem ||
      "Análise gerada com sucesso.",
  };
}

async function listar() {
  const usuario =
    await obterUsuarioLogado();

  const { data, error } = await supabase
    .from("analises_ia")
    .select(
      `
        id,
        usuario_id,
        titulo,
        pergunta,
        resposta,
        modelo,
        created_at
      `
    )
    .eq("usuario_id", usuario.id)
    .order("created_at", {
      ascending: false,
    });

  if (error) {
    throw error;
  }

  return data || [];
}

async function buscarPorId(id) {
  if (!id) {
    throw new Error(
      "O ID da análise é obrigatório."
    );
  }

  const usuario =
    await obterUsuarioLogado();

  const { data, error } = await supabase
    .from("analises_ia")
    .select(
      `
        id,
        usuario_id,
        titulo,
        pergunta,
        resposta,
        modelo,
        created_at
      `
    )
    .eq("id", id)
    .eq("usuario_id", usuario.id)
    .single();

  if (error) {
    throw error;
  }

  return data;
}

async function salvar({
  titulo,
  pergunta = null,
  resposta,
  modelo = "demonstracao-local",
}) {
  const { usuario } =
    await verificarPlanoPremium();

  const tituloTratado =
    String(titulo || "").trim();

  const perguntaTratada =
    pergunta
      ? String(pergunta).trim()
      : null;

  const respostaTratada =
    String(resposta || "").trim();

  if (!tituloTratado) {
    throw new Error(
      "O título da análise é obrigatório."
    );
  }

  if (!respostaTratada) {
    throw new Error(
      "A resposta da análise é obrigatória."
    );
  }

  const { data, error } = await supabase
    .from("analises_ia")
    .insert({
      usuario_id: usuario.id,
      titulo: tituloTratado,
      pergunta: perguntaTratada,
      resposta: respostaTratada,
      modelo,
    })
    .select(
      `
        id,
        usuario_id,
        titulo,
        pergunta,
        resposta,
        modelo,
        created_at
      `
    )
    .single();

  if (error) {
    throw error;
  }

  return data;
}

async function remover(id) {
  if (!id) {
    throw new Error(
      "O ID da análise é obrigatório."
    );
  }

  const usuario =
    await obterUsuarioLogado();

  const { error } = await supabase
    .from("analises_ia")
    .delete()
    .eq("id", id)
    .eq("usuario_id", usuario.id);

  if (error) {
    throw error;
  }

  return true;
}

export const analiseIAService = {
  gerar,
  listar,
  buscarPorId,
  salvar,
  remover,
  verificarPlanoPremium,
};

export default analiseIAService;