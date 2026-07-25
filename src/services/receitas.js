import { supabase } from "../lib/supabase";

async function obterUsuarioLogado() {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) {
    throw error;
  }

  if (!user) {
    throw new Error("Usuário não autenticado.");
  }

  return user;
}

async function listar() {
  const usuario = await obterUsuarioLogado();

  const { data, error } = await supabase
    .from("receitas")
    .select("*")
    .eq("user_id", usuario.id)
    .order("data", {
      ascending: false,
    })
    .order("created_at", {
      ascending: false,
    });

  if (error) {
    throw error;
  }

  return data ?? [];
}

async function criar({
  descricao,
  valor,
  categoria,
  data,
}) {
  const usuario = await obterUsuarioLogado();

  const descricaoTratada = descricao.trim();
  const categoriaTratada =
    categoria?.trim() || "Outros";
  const valorNumerico = Number(valor);

  if (!descricaoTratada) {
    throw new Error(
      "A descrição da receita é obrigatória."
    );
  }

  if (
    !Number.isFinite(valorNumerico) ||
    valorNumerico <= 0
  ) {
    throw new Error(
      "O valor da receita deve ser maior que zero."
    );
  }

  if (!data) {
    throw new Error(
      "A data da receita é obrigatória."
    );
  }

  const { data: receitaCriada, error } =
    await supabase
      .from("receitas")
      .insert({
        user_id: usuario.id,
        descricao: descricaoTratada,
        valor: valorNumerico,
        categoria: categoriaTratada,
        data,
      })
      .select()
      .single();

  if (error) {
    throw error;
  }

  return receitaCriada;
}

async function atualizar(
  id,
  {
    descricao,
    valor,
    categoria,
    data,
  }
) {
  const usuario = await obterUsuarioLogado();

  if (!id) {
    throw new Error(
      "O identificador da receita é obrigatório."
    );
  }

  const descricaoTratada = descricao.trim();
  const categoriaTratada =
    categoria?.trim() || "Outros";
  const valorNumerico = Number(valor);

  if (!descricaoTratada) {
    throw new Error(
      "A descrição da receita é obrigatória."
    );
  }

  if (
    !Number.isFinite(valorNumerico) ||
    valorNumerico <= 0
  ) {
    throw new Error(
      "O valor da receita deve ser maior que zero."
    );
  }

  if (!data) {
    throw new Error(
      "A data da receita é obrigatória."
    );
  }

  const { data: receitaAtualizada, error } =
    await supabase
      .from("receitas")
      .update({
        descricao: descricaoTratada,
        valor: valorNumerico,
        categoria: categoriaTratada,
        data,
      })
      .eq("id", id)
      .eq("user_id", usuario.id)
      .select()
      .single();

  if (error) {
    throw error;
  }

  return receitaAtualizada;
}

async function remover(id) {
  const usuario = await obterUsuarioLogado();

  if (!id) {
    throw new Error(
      "O identificador da receita é obrigatório."
    );
  }

  const { error } = await supabase
    .from("receitas")
    .delete()
    .eq("id", id)
    .eq("user_id", usuario.id);

  if (error) {
    throw error;
  }
}

export const receitasService = {
  listar,
  criar,
  atualizar,
  remover,
};

export default receitasService;